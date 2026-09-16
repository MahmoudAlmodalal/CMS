import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cssUrl } from "../src/lib/storage.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("YouTubeEmbed is the only place the site builds a YouTube iframe", () => {
  const embed = read("src/components/ui/YouTubeEmbed.tsx");

  assert.match(embed, /^"use client";/);
  assert.match(embed, /parseYouTubeId/, "parsing goes through the shared helper");
  assert.match(embed, /if \(!videoId\) return null/, "an unparseable link renders nothing");
  assert.match(embed, /variant === "backdrop"/, "both the player and the backdrop live here");

  // Every other component must delegate rather than hand-roll a second iframe
  // with its own allow list and referrer policy that can drift out of sync.
  const publicDir = path.join(ROOT, "src/components/public");
  const files = (fs.readdirSync(publicDir, { recursive: true }) as string[]).filter((f) =>
    f.endsWith(".tsx"),
  );
  for (const file of files) {
    const source = fs.readFileSync(path.join(publicDir, file), "utf-8");
    assert.doesNotMatch(
      source,
      /<iframe/,
      `${file} must render video through YouTubeEmbed, not its own <iframe>`,
    );
  }
});

test("the home page offers the hero video once, not three times", () => {
  const hero = read("src/components/public/HeroSection.tsx");
  const about = read("src/components/public/AboutSection.tsx");

  // The hero paints hero_video_url as a muted backdrop; the about band carries
  // the one playable copy. A second playable embed in the hero body meant the
  // same video was offered twice on one screen.
  assert.equal(hero.match(/<YouTubeEmbed/g)?.length, 1, "the hero embeds the video once");
  assert.match(hero, /variant="backdrop"/);
  assert.equal(about.match(/<YouTubeEmbed/g)?.length, 1, "the about band embeds the video once");
  assert.doesNotMatch(about, /variant="backdrop"/, "the about copy is the playable one");
});

test("cssUrl quotes CMS URLs so a filename with a space cannot break a background", () => {
  // `url(https://x/a (1).png)` is invalid CSS and the whole declaration is
  // dropped, so the background silently disappears.
  assert.equal(cssUrl("https://x/a (1).png"), 'url("https://x/a (1).png")');
  assert.equal(cssUrl('https://x/a".png'), 'url("https://x/a\\".png")');
  assert.equal(cssUrl("  https://x/a.png  "), 'url("https://x/a.png")');

  // Blank falls through to the fallback, and with neither the declaration is
  // omitted rather than emitted as url("") — which re-requests the page itself.
  assert.equal(cssUrl("", "/assets/x.png"), 'url("/assets/x.png")');
  assert.equal(cssUrl(null, "/assets/x.png"), 'url("/assets/x.png")');
  assert.equal(cssUrl(null), undefined);
  assert.equal(cssUrl("   "), undefined);
});

test("no component interpolates a CMS URL into url() unquoted", () => {
  const dirs = ["src/components/public", "src/components/admin", "src/app"];
  for (const dir of dirs) {
    const abs = path.join(ROOT, dir);
    const files = (fs.readdirSync(abs, { recursive: true }) as string[]).filter((f) =>
      f.endsWith(".tsx"),
    );
    for (const file of files) {
      const source = fs.readFileSync(path.join(abs, file), "utf-8");
      assert.doesNotMatch(
        source,
        /backgroundImage: `url\(\$\{/,
        `${dir}/${file} must build its background through cssUrl()`,
      );
    }
  }
});

test("a misconfigured storage override is ignored, not trusted", async () => {
  const { storageBaseUrl, isStorageBaseUrl, repairLegacyMediaUrl, resolveMediaUrl } = await import(
    "../src/lib/storage.ts"
  );

  assert.equal(isStorageBaseUrl("https://x.supabase.co/storage/v1/object/public"), true);
  assert.equal(isStorageBaseUrl("https://cms-drab-eight.vercel.app"), false);
  assert.equal(isStorageBaseUrl("not a url"), false);

  const savedOverride = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
  const savedProject = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    // The exact production misconfiguration: the override pointed at the app's
    // own domain, so uploads persisted URLs there and every one 404'd.
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL = "https://cms-drab-eight.vercel.app";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://proj.supabase.co";

    assert.equal(
      storageBaseUrl(),
      "https://proj.supabase.co/storage/v1/object/public",
      "a base that cannot serve an object must lose to the derivable project URL",
    );

    // Rows already written against the bad host are repaired on read.
    assert.equal(
      repairLegacyMediaUrl("https://cms-drab-eight.vercel.app/artists/portraits/a/1_x.png"),
      "https://proj.supabase.co/storage/v1/object/public/artists/portraits/a/1_x.png",
    );
    assert.equal(
      resolveMediaUrl("artists", "https://cms-drab-eight.vercel.app/artists/portraits/a/1_x.png"),
      "https://proj.supabase.co/storage/v1/object/public/artists/portraits/a/1_x.png",
    );

    // A correct URL, a real public route and an unrelated host are left alone.
    const good = "https://proj.supabase.co/storage/v1/object/public/artists/artist-1.png";
    assert.equal(repairLegacyMediaUrl(good), good);
    assert.equal(
      repairLegacyMediaUrl("https://cms-drab-eight.vercel.app/artists/sara-alsawt"),
      "https://cms-drab-eight.vercel.app/artists/sara-alsawt",
      "a public route has no file extension and must never be rewritten",
    );
    assert.equal(
      repairLegacyMediaUrl("https://youtu.be/60g72d4Nqss"),
      "https://youtu.be/60g72d4Nqss",
    );
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL = savedOverride;
    process.env.NEXT_PUBLIC_SUPABASE_URL = savedProject;
  }
});

test("an image field rejects a video-page URL", async () => {
  const { imageUrlSchema } = await import("../src/lib/validations/primitives.ts");
  const schema = imageUrlSchema();

  // Production had a youtu.be link in site_settings.hero_image_url: a valid
  // https URL returning 200 that serves HTML, so the band never painted.
  assert.equal(schema.safeParse("https://youtu.be/60g72d4Nqss?si=x").success, false);
  assert.equal(schema.safeParse("https://www.youtube.com/watch?v=aqz-KE-bpKQ").success, false);
  assert.equal(schema.safeParse("https://vimeo.com/12345").success, false);

  assert.equal(schema.safeParse("https://proj.supabase.co/storage/v1/object/public/site/a.png").success, true);
  assert.equal(schema.safeParse("/assets/figma/hero-stage.png").success, true);
});

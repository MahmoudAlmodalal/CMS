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

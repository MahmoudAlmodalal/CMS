import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  isYouTubeUrl,
  parseYouTubeId,
  youTubeEmbedUrl,
  youTubeBackdropEmbedUrl,
  youTubeThumbnailUrl,
  youTubeWatchUrl,
} from "../src/lib/youtube.ts";

const ID = "dQw4w9WgXcQ";

test("parseYouTubeId — every shape an editor can paste", () => {
  const accepted = [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://music.youtube.com/watch?v=${ID}`,
    `http://www.youtube.com/watch?v=${ID}`,
    // share sheet and playlist noise must not defeat the lookup
    `https://www.youtube.com/watch?v=${ID}&t=42s`,
    `https://www.youtube.com/watch?v=${ID}&list=PL1234567890&index=3`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=AbCdEfGhIjKlMnOp`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}?rel=0`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/v/${ID}`,
    `  https://www.youtube.com/watch?v=${ID}  `,
  ];
  for (const url of accepted) {
    assert.equal(parseYouTubeId(url), ID, `should parse: ${url}`);
    assert.equal(isYouTubeUrl(url), true, `should accept: ${url}`);
  }
});

test("parseYouTubeId — rejects non-YouTube, unsafe and malformed input", () => {
  const rejected = [
    null,
    undefined,
    "",
    "   ",
    "https://vimeo.com/123456789",
    // a lookalike host must not pass on a substring match
    `https://notyoutube.com/watch?v=${ID}`,
    `https://youtube.com.evil.test/watch?v=${ID}`,
    `javascript:alert(1)//youtube.com/watch?v=${ID}`,
    `data:text/html,<script>alert(1)</script>`,
    // a bare id is not a URL; the field stores links
    ID,
    // ids are exactly 11 chars of [A-Za-z0-9_-]
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch?v=waaaaaaaaaaytoolong",
    "https://www.youtube.com/watch?v=bad!chars12",
    "https://www.youtube.com/watch",
    "https://www.youtube.com/",
    "https://www.youtube.com/results?search_query=oud",
    "not a url at all",
  ];
  for (const url of rejected) {
    assert.equal(parseYouTubeId(url), null, `should reject: ${String(url)}`);
    assert.equal(isYouTubeUrl(url), false, `should reject: ${String(url)}`);
  }
});

test("youTubeEmbedUrl — privacy host, opt-in autoplay, never echoes raw input", () => {
  const embed = youTubeEmbedUrl(ID);
  assert.ok(embed.startsWith(`https://www.youtube-nocookie.com/embed/${ID}?`), embed);
  assert.match(embed, /rel=0/);
  assert.match(embed, /modestbranding=1/);
  assert.doesNotMatch(embed, /autoplay/, "autoplay is opt-in so the facade controls it");
  assert.match(youTubeEmbedUrl(ID, { autoplay: true }), /autoplay=1/);
});

test("youTubeBackdropEmbedUrl — silent looping footage with no player furniture", () => {
  const backdrop = youTubeBackdropEmbedUrl(ID);
  assert.ok(backdrop.startsWith(`https://www.youtube-nocookie.com/embed/${ID}?`), backdrop);

  // Plays by itself, silently, forever. `loop` is inert unless `playlist` names
  // the same id, so a missing playlist param means the hero shows one pass and
  // then an end screen.
  for (const param of ["autoplay=1", "mute=1", "loop=1", `playlist=${ID}`, "playsinline=1"]) {
    assert.ok(backdrop.includes(param), `${param} missing from ${backdrop}`);
  }

  // Everything the player draws over the footage is switched off: the band must
  // not read as an embed.
  for (const param of [
    "controls=0",
    "modestbranding=1",
    "rel=0",
    "showinfo=0",
    "disablekb=1",
    "fs=0",
    "iv_load_policy=3",
    "cc_load_policy=0",
  ]) {
    assert.ok(backdrop.includes(param), `${param} missing from ${backdrop}`);
  }
});

test("HeroSection — a YouTube link outranks the image, which stays as the fallback", () => {
  const hero = fs.readFileSync(
    path.join(import.meta.dirname, "..", "src/components/public/HeroSection.tsx"),
    "utf-8",
  );
  assert.match(hero, /parseYouTubeId\(settings\.hero_video_url\)/);
  // The iframe itself lives in the shared YouTubeEmbed; the hero declares the
  // backdrop variant and passes the crop class.
  assert.match(hero, /variant="backdrop"/);
  assert.match(hero, /className="hero-youtube-backdrop"/);
  assert.doesNotMatch(hero, /<iframe/, "the hero must not hand-roll an iframe any more");

  // No link parses -> nothing changes about today's image/<video> backdrop.
  assert.match(hero, /!backdropVideoId && isVideoUrl\(heroUrl\)/);
  assert.match(hero, /hero_image_url/, "the image column remains the fallback");

  // The frame is cropped and unreachable, which is what hides the branding.
  const embed = fs.readFileSync(
    path.join(import.meta.dirname, "..", "src/components/ui/YouTubeEmbed.tsx"),
    "utf-8",
  );
  assert.match(embed, /youTubeBackdropEmbedUrl\(videoId\)/);
  assert.match(embed, /absolute inset-0 overflow-hidden \$\{className\}/);
  assert.match(embed, /pointer-events-none/);
  assert.match(embed, /tabIndex=\{-1\}/);

  // Reduced motion drops the frame and uncovers the still image beneath it.
  const css = fs.readFileSync(path.join(import.meta.dirname, "..", "src/app/globals.css"), "utf-8");
  assert.match(css, /\.hero-youtube-backdrop \{ display: none !important; \}/);
});

test("youTubeThumbnailUrl / youTubeWatchUrl point at the hosts next.config allows", () => {
  assert.equal(youTubeThumbnailUrl(ID), `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  assert.equal(youTubeThumbnailUrl(ID, "maxres"), `https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`);
  assert.equal(youTubeWatchUrl(ID), `https://www.youtube.com/watch?v=${ID}`);

  // next/image refuses a remote host that is not allowlisted, which would make
  // every work card render broken.
  const src = fs.readFileSync(path.join(import.meta.dirname, "..", "next.config.ts"), "utf-8");
  assert.match(src, /i\.ytimg\.com/, "next.config must allow the thumbnail host");
  assert.match(src, /img\.youtube\.com/);
});

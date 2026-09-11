import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages, enMessages } from "./helpers/i18n.ts";
// NOTE: components use the `@/` alias (unresolvable under plain node --test),
// so the widget contract is asserted via file-content checks per
// tests/events-page.test.ts precedent. formatDuration lives in the
// alias-free src/lib/formatters.ts and is tested at runtime.
import { formatDuration } from "../src/lib/formatters.ts";

const root = path.resolve(".");

test("Task 39 — 1. Duration formatting (mm:ss timeline)", () => {
  assert.equal(formatDuration(0), "0:00");
  assert.equal(formatDuration(5), "0:05");
  assert.equal(formatDuration(65), "1:05");
  assert.equal(formatDuration(185), "3:05");
  assert.equal(formatDuration(600), "10:00");
  // Guards: metadata not yet loaded / corrupt values never break the timeline
  assert.equal(formatDuration(NaN), "0:00");
  assert.equal(formatDuration(Infinity), "0:00");
  assert.equal(formatDuration(-3), "0:00");
  // Fractional seconds (HTMLMediaElement.currentTime) floor cleanly
  assert.equal(formatDuration(89.9), "1:29");
});

test("Task 39 — 2. AudioPlayerWidget artifact & Figma traceability", () => {
  const widgetPath = path.join(root, "src/components/public/AudioPlayerWidget.tsx");
  assert.ok(fs.existsSync(widgetPath), "AudioPlayerWidget.tsx must exist");

  const widget = fs.readFileSync(widgetPath, "utf-8");
  assert.match(widget, /"use client"/, "Player needs interaction → Client Component");
  assert.match(widget, /134:4420/, "Must reference Figma Artist Profile node");
  assert.match(widget, /tracks\.title|track\.title/);
  assert.match(widget, /audio_file_url/);
  assert.match(widget, /duration_seconds/);
  assert.match(widget, /formatDuration/);

  const barrel = fs.readFileSync(
    path.join(root, "src/components/public/index.ts"),
    "utf-8"
  );
  assert.match(barrel, /export \{ AudioPlayerWidget/);
});

test("Task 39 — 3. Playback states: loading, missing-media, error + retry", () => {
  const widget = fs.readFileSync(
    path.join(root, "src/components/public/AudioPlayerWidget.tsx"),
    "utf-8"
  );

  // Loading / buffering
  assert.match(widget, /onLoadStart/);
  assert.match(widget, /onWaiting/);
  assert.match(widget, /t\("loading"\)/);
  assert.match(arMessages["player.loading"], /جارٍ تحميل المقطع الصوتي/);
  assert.match(widget, /aria-busy/);

  // Missing-media: empty URL renders a notice, never a broken <audio>
  assert.match(widget, /if\s*\(!track\.audio_file_url\)/);
  assert.match(widget, /t\("unavailable"\)/);
  assert.match(arMessages["player.unavailable"], /المقطع الصوتي غير متوفر حالياً/);

  // Playback-error with retry
  assert.match(widget, /onError/);
  assert.match(widget, /role="alert"/);
  assert.match(widget, /t\("retry"\)/);
  assert.equal(arMessages["player.retry"], "إعادة المحاولة");
  assert.match(widget, /audio\.load\(\)/);

  // Play promise rejection (autoplay policy / decode failure) surfaces error
  assert.match(widget, /audio\.play\(\)\.catch/);

  // Ended resets to replayable state
  assert.match(widget, /onEnded/);
});

test("Task 39 — 4. Keyboard access & bidi-safe timeline", () => {
  const widget = fs.readFileSync(
    path.join(root, "src/components/public/AudioPlayerWidget.tsx"),
    "utf-8"
  );

  // Play/pause is a native button with label + pressed state
  assert.match(widget, /<button/);
  assert.match(widget, /aria-label=\{isPlaying \? t\("pause"\) : t\("play"\)\}/);
  assert.equal(arMessages["player.pause"], "إيقاف مؤقت");
  assert.equal(arMessages["player.play"], "تشغيل");
  assert.match(widget, /aria-pressed=\{isPlaying\}/);

  // Seek uses a native range slider (arrow-key operable) with an Arabic label
  assert.match(widget, /type="range"/);
  assert.match(widget, /aria-label=\{t\("seek", \{ title: track\.title \}\)\}/);
  assert.match(arMessages["player.seek"], /^التقديم في المقطع/);
  assert.match(widget, /onTimeUpdate/);

  // mm:ss readout isolated from RTL paragraph direction
  assert.match(widget, /dir="ltr"/);
  assert.match(widget, /<bdi>/);

  // PauseIcon exists alongside PlayIcon in the shared icon set
  const icons = fs.readFileSync(path.join(root, "src/components/ui/Icons.tsx"), "utf-8");
  assert.match(icons, /export function PauseIcon/);
  assert.match(widget, /PauseIcon/);
});

test("Task 39 — 5. Scope guard: only Figma-confirmed media", () => {
  // CONTENT_INVENTORY.md confirms ONLY the audio player (134:4420). No gallery
  // grid and no video providers carry Figma node IDs — they must not exist as
  // speculative components.
  const publicDir = path.join(root, "src/components/public");
  const files = fs.readdirSync(publicDir, { recursive: true }) as string[];
  const names = files.join("\n").toLowerCase();
  assert.doesNotMatch(names, /gallery/, "No speculative gallery component allowed");
  assert.doesNotMatch(names, /video|youtube|vimeo/, "No speculative video provider allowed");

  // tracks table carries exactly the fields the widget consumes
  const types = fs.readFileSync(path.join(root, "src/lib/supabase/types.ts"), "utf-8");
  assert.match(types, /audio_file_url: string/);
  assert.match(types, /duration_seconds: number/);
});

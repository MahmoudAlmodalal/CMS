import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages } from "./helpers/i18n.ts";
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
  // Media surfaces exist only where a Figma node draws them: the audio player,
  // and the three-up plate grid the الفنان frame draws at node 134:4644. No
  // video provider carries a node ID, and no other gallery may be invented.
  const publicDir = path.join(root, "src/components/public");
  const files = fs.readdirSync(publicDir, { recursive: true }) as string[];
  const confirmedGallery = "artist/ArtistGallery.tsx";
  assert.ok(
    files.some((f) => f.replace(/\\/g, "/") === confirmedGallery),
    "The Figma-confirmed gallery (134:4644) must live at " + confirmedGallery
  );
  const names = files
    .filter((f) => f.replace(/\\/g, "/") !== confirmedGallery)
    .join("\n")
    .toLowerCase();
  assert.doesNotMatch(names, /gallery/, "No speculative gallery component allowed");
  assert.doesNotMatch(names, /video|youtube|vimeo/, "No speculative video provider allowed");

  // tracks table carries exactly the fields the widget consumes
  const types = fs.readFileSync(path.join(root, "src/lib/supabase/types.ts"), "utf-8");
  assert.match(types, /audio_file_url: string/);
  assert.match(types, /duration_seconds: number/);
});

test("Media Picker — MediaPickerField client component & form integrations", () => {
  const pickerPath = path.join(root, "src/components/admin/media/MediaPickerField.tsx");
  assert.ok(fs.existsSync(pickerPath), "MediaPickerField.tsx must exist");

  const picker = fs.readFileSync(pickerPath, "utf-8");
  assert.match(picker, /"use client"/, "MediaPickerField must be a Client Component");
  assert.match(picker, /listFolderMedia/, "MediaPickerField must use listFolderMedia");
  assert.match(picker, /<dialog/, "MediaPickerField must render a native <dialog> element");
  assert.match(picker, /onChange\([^)]*publicUrl[^)]*\)/, "MediaPickerField must call onChange with publicUrl");

  // MediaUploadZone export & usage
  const uploadZonePath = path.join(root, "src/components/admin/media/MediaUploadZone.tsx");
  assert.ok(fs.existsSync(uploadZonePath), "MediaUploadZone.tsx must exist");
  const uploadZone = fs.readFileSync(uploadZonePath, "utf-8");
  assert.match(uploadZone, /export const MEDIA_LIBRARY_ENTITY_ID = ["']media-library["']/, "MediaUploadZone must export MEDIA_LIBRARY_ENTITY_ID");
  assert.doesNotMatch(uploadZone, /uploadMediaAction\(\{[\s\S]*entityId:\s*["']media-library["']/, "uploadMediaAction call must not hardcode 'media-library' literal");
  assert.match(uploadZone, /uploadMediaAction\(\{[\s\S]*entityId:\s*MEDIA_LIBRARY_ENTITY_ID/, "uploadMediaAction call must use MEDIA_LIBRARY_ENTITY_ID");

  // SiteSettingsForm integrations (site/hero, site/about)
  const siteSettings = fs.readFileSync(
    path.join(root, "src/components/admin/SiteSettingsForm.tsx"),
    "utf-8"
  );
  assert.match(siteSettings, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(siteSettings, /bucket=["']site["'][^>]*folder=["']hero["']|folder=["']hero["'][^>]*bucket=["']site["']/);
  assert.match(siteSettings, /bucket=["']site["'][^>]*folder=["']about["']|folder=["']about["'][^>]*bucket=["']site["']/);

  // ArtistsManager integration (artists/portraits)
  const artistsManager = fs.readFileSync(
    path.join(root, "src/components/admin/ArtistsManager.tsx"),
    "utf-8"
  );
  assert.match(artistsManager, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(artistsManager, /bucket=["']artists["'][^>]*folder=["']portraits["']|folder=["']portraits["'][^>]*bucket=["']artists["']/);

  // ArticlesManager integration (articles/covers)
  const articlesManager = fs.readFileSync(
    path.join(root, "src/components/admin/ArticlesManager.tsx"),
    "utf-8"
  );
  assert.match(articlesManager, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(articlesManager, /bucket=["']articles["'][^>]*folder=["']covers["']|folder=["']covers["'][^>]*bucket=["']articles["']/);

  // EventForm integration (events/posters)
  const eventForm = fs.readFileSync(
    path.join(root, "src/components/admin/events/EventForm.tsx"),
    "utf-8"
  );
  assert.match(eventForm, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(eventForm, /bucket=["']events["'][^>]*folder=["']posters["']|folder=["']posters["'][^>]*bucket=["']events["']/);

  // TracksManager integration (releases/covers)
  const tracksManager = fs.readFileSync(
    path.join(root, "src/components/admin/TracksManager.tsx"),
    "utf-8"
  );
  assert.match(tracksManager, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(tracksManager, /bucket=["']releases["'][^>]*folder=["']covers["']|folder=["']covers["'][^>]*bucket=["']releases["']/);

  // ReleasesManager integration (releases/covers)
  const releasesManager = fs.readFileSync(
    path.join(root, "src/components/admin/ReleasesManager.tsx"),
    "utf-8"
  );
  assert.match(releasesManager, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(releasesManager, /bucket=["']releases["'][^>]*folder=["']covers["']|folder=["']covers["'][^>]*bucket=["']releases["']/);

  // AcademyManager integration (academy/tracks)
  const academyManager = fs.readFileSync(
    path.join(root, "src/components/admin/AcademyManager.tsx"),
    "utf-8"
  );
  assert.match(academyManager, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(academyManager, /bucket=["']academy["'][^>]*folder=["']tracks["']|folder=["']tracks["'][^>]*bucket=["']academy["']/);

  // TestimonialsManager integration (site/avatars)
  const testimonialsManager = fs.readFileSync(
    path.join(root, "src/components/admin/TestimonialsManager.tsx"),
    "utf-8"
  );
  assert.match(testimonialsManager, /import \{[^}]*MediaPickerField[^}]*\} from ["']@\/components\/admin\/media\/MediaPickerField["']/);
  assert.match(testimonialsManager, /bucket=["']site["'][^>]*folder=["']avatars["']|folder=["']avatars["'][^>]*bucket=["']site["']/);
});

test("Admin Media Library — page, MediaLibrary client component & listFolderMedia", () => {
  // page.tsx renders MediaLibrary
  const pagePath = path.join(root, "src/app/(admin)/admin/media/page.tsx");
  assert.ok(fs.existsSync(pagePath), "page.tsx must exist");
  const pageSrc = fs.readFileSync(pagePath, "utf-8");
  assert.doesNotMatch(pageSrc, /"use client"/, "page.tsx must remain a Server Component");
  assert.match(pageSrc, /<MediaLibrary\s*\/>/, "page.tsx must render MediaLibrary");
  assert.match(pageSrc, /export const metadata/, "page.tsx must keep metadata export");

  // MediaLibrary uses MediaBucketTabs, MediaFileGrid, MediaUploadZone, BUCKET_FOLDERS, listFolderMedia and role="tabpanel"
  const libraryPath = path.join(root, "src/components/admin/media/MediaLibrary.tsx");
  assert.ok(fs.existsSync(libraryPath), "MediaLibrary.tsx must exist");
  const librarySrc = fs.readFileSync(libraryPath, "utf-8");
  assert.match(librarySrc, /"use client"/, "MediaLibrary must be a Client Component");
  assert.match(librarySrc, /MediaBucketTabs/, "MediaLibrary must use MediaBucketTabs");
  assert.match(librarySrc, /MediaFileGrid/, "MediaLibrary must use MediaFileGrid");
  assert.match(librarySrc, /MediaUploadZone/, "MediaLibrary must use MediaUploadZone");
  assert.match(librarySrc, /BUCKET_FOLDERS/, "MediaLibrary must use BUCKET_FOLDERS");
  assert.match(librarySrc, /listFolderMedia/, "MediaLibrary must use listFolderMedia");
  assert.match(librarySrc, /role=["']tabpanel["']/, "MediaLibrary must use role='tabpanel'");
  assert.match(
    librarySrc,
    /!loading\s*&&\s*!error[\s\S]*?<MediaFileGrid/,
    "MediaLibrary must render MediaFileGrid only when !loading && !error"
  );

  // listFolderMedia references MEDIA_LIBRARY_ENTITY_ID and listMediaAction
  const listPath = path.join(root, "src/components/admin/media/listFolderMedia.ts");
  assert.ok(fs.existsSync(listPath), "listFolderMedia.ts must exist");
  const listSrc = fs.readFileSync(listPath, "utf-8");
  assert.match(listSrc, /MEDIA_LIBRARY_ENTITY_ID/, "listFolderMedia must reference MEDIA_LIBRARY_ENTITY_ID");
  assert.match(listSrc, /listMediaAction/, "listFolderMedia must reference listMediaAction");
});

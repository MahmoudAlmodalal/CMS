/**
 * YouTube link handling — the single source of truth for turning an editor's
 * pasted URL into a video id, a thumbnail and an embed URL.
 *
 * Deliberately universal (no `server-only`): the Zod schema that validates a
 * work, the server component that lists them and the client card that plays one
 * all parse with the same function, so the browser can never accept a link the
 * server would reject.
 */

/** YouTube ids are exactly 11 chars of the URL-safe base64 alphabet. */
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Hosts whose paths we know how to read, after stripping a www/m/music prefix. */
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
]);

/** `/embed/ID`, `/shorts/ID`, `/live/ID` and the legacy `/v/ID`. */
const PATH_PREFIXES = ["embed", "shorts", "live", "v"];

/**
 * Extracts the video id from any YouTube URL shape an editor is likely to
 * paste, or returns null.
 *
 * Parsed with `new URL` rather than a regex over the raw string so that
 * `javascript:`-style payloads and lookalike hosts (`notyoutube.com`) can never
 * match: only the http(s) scheme and the exact host set below are accepted.
 */
export function parseYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase().replace(/^(www|m|music)\./, "");
  if (!YOUTUBE_HOSTS.has(host)) return null;

  // youtu.be/ID — the id is the whole path.
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  // youtube.com/watch?v=ID (plus any &t=, &list=, &si= the share sheet adds).
  const v = url.searchParams.get("v");
  if (v && VIDEO_ID_RE.test(v)) return v;

  // youtube.com/embed|shorts|live|v/ID
  const [prefix, id] = url.pathname.split("/").filter(Boolean);
  if (prefix && id && PATH_PREFIXES.includes(prefix.toLowerCase())) {
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  return null;
}

/** True when the string is a YouTube link this module can render. */
export function isYouTubeUrl(input: string | null | undefined): boolean {
  return parseYouTubeId(input) !== null;
}

/**
 * Poster frame for the click-to-play facade. `hqdefault` exists for every
 * video; `maxresdefault` does not, so it is opt-in.
 */
export function youTubeThumbnailUrl(id: string, quality: "hq" | "maxres" = "hq"): string {
  const file = quality === "maxres" ? "maxresdefault" : "hqdefault";
  return `https://i.ytimg.com/vi/${id}/${file}.jpg`;
}

/**
 * Embed URL on the no-cookie host: nothing is written to the visitor's browser
 * until they actually press play, which is the whole point of the facade.
 */
export function youTubeEmbedUrl(id: string, opts: { autoplay?: boolean } = {}): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (opts.autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/**
 * Embed URL for a decorative, non-interactive backdrop: muted, autoplaying and
 * looping, with every piece of player furniture the API can switch off already
 * off (controls, keyboard, fullscreen, annotations, captions, end-screen
 * suggestions). `loop` only loops when `playlist` names the same id, which is
 * why the id is passed twice.
 *
 * What the parameters cannot remove — the hover title card and the corner
 * watermark — the caller crops away by overscaling the frame inside an
 * `overflow-hidden` box, so the band does not read as an embed.
 */
export function youTubeBackdropEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    showinfo: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    cc_load_policy: "0",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/** Canonical watch link, for a "open on YouTube" affordance. */
export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

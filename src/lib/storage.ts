/**
 * Task 29 — Supabase Storage policy module (STORAGE_ARCHITECTURE.md, Task 20A).
 *
 * Canonical source for: 7 buckets, byte quotas, MIME allowlists, deterministic
 * paths, public-URL helpers, upload validation (size / MIME / spoofed content /
 * SVG safety / dimensions), DB reference map, and orphan set-difference.
 *
 * Universal (edge-safe): no server-only imports. Server Actions live in
 * `src/actions/storage.ts` and consume these pure helpers.
 */

export const STORAGE_BUCKETS = [
  "site",
  "artists",
  "releases",
  "events",
  "academy",
  "articles",
  "audio",
] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

/** 5 MB image/content buckets. */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5242880
/** 30 MB audio bucket. */
export const AUDIO_MAX_BYTES = 30 * 1024 * 1024; // 31457280

export const BUCKET_BYTE_LIMITS: Record<StorageBucket, number> = {
  site: IMAGE_MAX_BYTES,
  artists: IMAGE_MAX_BYTES,
  releases: IMAGE_MAX_BYTES,
  events: IMAGE_MAX_BYTES,
  academy: IMAGE_MAX_BYTES,
  articles: IMAGE_MAX_BYTES,
  audio: AUDIO_MAX_BYTES,
};

/** Canonical MIME allowlists — mirrors migration 20260910001300. */
export const BUCKET_ALLOWED_MIMES: Record<StorageBucket, readonly string[]> = {
  site: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"],
  artists: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  releases: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  events: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  academy: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  articles: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4", "audio/aac"],
};

/** Deterministic extension per MIME (lowercase, §5.1 whitelist). */
export const MIME_CANONICAL_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/mp4": "mp4",
  "audio/aac": "aac",
};

/** Approved folders per bucket (§4); first entry is the default. */
export const BUCKET_FOLDERS: Record<StorageBucket, readonly string[]> = {
  site: ["hero", "about", "avatars", "branding"],
  artists: ["portraits", "gallery"],
  releases: ["covers"],
  events: ["posters", "gallery"],
  academy: ["tracks"],
  articles: ["covers", "inline"],
  audio: ["tracks"],
};

/** Advisory recommended dimensions per folder (§2 matrix) for CMS UI hints. */
export const RECOMMENDED_DIMENSIONS: Record<string, { w: number; h: number; label: string }> = {
  "site/hero": { w: 1920, h: 1080, label: "16:9 hero" },
  "site/about": { w: 1200, h: 1500, label: "4:5 about" },
  "site/avatars": { w: 400, h: 400, label: "1:1 avatar" },
  "artists/portraits": { w: 800, h: 1000, label: "4:5 portrait" },
  "artists/gallery": { w: 1200, h: 800, label: "3:2 gallery" },
  "releases/covers": { w: 1000, h: 1000, label: "1:1 sleeve" },
  "events/posters": { w: 1200, h: 800, label: "3:2 poster" },
  "academy/tracks": { w: 800, h: 600, label: "4:3 track" },
  "articles/covers": { w: 1200, h: 800, label: "3:2 cover" },
};

/** Hard guardrails (engineering decision): reject corrupt/absurd images. */
export const MIN_IMAGE_DIMENSION = 32;
export const MAX_IMAGE_DIMENSION = 4096;

/** Grace period before an unreferenced object counts as an orphan (§6.3). */
export const ORPHAN_GRACE_HOURS = 24;

// ---------------------------------------------------------------------------
// Path generation (§5.1): <folder>/<entity_id>/<timestamp>_<slug>.<ext>
// Client filenames are discarded; entity scoping prevents collisions.
// ---------------------------------------------------------------------------

export function sanitizeSlug(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "file";
}

const ENTITY_ID_RE = /^[A-Za-z0-9-]{1,64}$/;

export interface BuildPathInput {
  bucket: StorageBucket;
  folder?: string;
  entityId: string;
  label: string;
  mime: string;
  /** 10-digit unix seconds; defaults to now. Injectable for tests. */
  timestamp?: number;
}

export function buildStoragePath(input: BuildPathInput): string {
  const folders = BUCKET_FOLDERS[input.bucket];
  const folder = input.folder ?? folders[0];
  if (!folders.includes(folder)) {
    throw new Error(`[storage] Folder "${folder}" is not allowed in bucket "${input.bucket}".`);
  }
  if (!ENTITY_ID_RE.test(input.entityId) || input.entityId.includes("..")) {
    throw new Error("[storage] Invalid entity id for storage path.");
  }
  const ext = MIME_CANONICAL_EXT[input.mime];
  if (!ext) throw new Error(`[storage] No canonical extension for MIME "${input.mime}".`);
  const ts = input.timestamp ?? Math.floor(Date.now() / 1000);
  if (!Number.isInteger(ts) || ts <= 0) throw new Error("[storage] Invalid timestamp.");
  return `${folder}/${input.entityId}/${ts}_${sanitizeSlug(input.label)}.${ext}`;
}

// ---------------------------------------------------------------------------
// URL helpers (§7.2): DB stores a path or full URL; resolve to absolute CDN URL.
// ---------------------------------------------------------------------------

/** CDN base for public reads. Returns null when unconfigured (build/preview
 *  without Supabase env) — read-path callers must degrade, never crash. */
export function storageBaseUrl(): string | null {
  const direct = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
  if (direct) return direct.replace(/\/+$/, "");
  const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (project) return `${project.replace(/\/+$/, "")}/storage/v1/object/public`;
  return null;
}

/** Strict variant for write paths (upload/replace/delete/orphan cleanup):
 *  env misconfiguration must fail loudly at runtime, never silently. */
export function requireStorageBaseUrl(): string {
  const base = storageBaseUrl();
  if (!base) throw new Error("[storage] Missing NEXT_PUBLIC_SUPABASE_URL (or _STORAGE_URL).");
  return base;
}

/** Absolute URLs pass through; relative paths resolve against the CDN base.
 *  Without a configured base (e.g. static build with no env), the stored
 *  path is returned unchanged so prerendering never crashes. */
export function resolveMediaUrl(
  bucket: StorageBucket,
  pathOrUrl: string | null | undefined,
): string | null {
  if (!pathOrUrl) return null;
  const v = pathOrUrl.trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const base = storageBaseUrl();
  if (!base) return v;
  return `${base}/${bucket}/${v.replace(/^\/+/, "")}`;
}

const PUBLIC_URL_RE =
  /\/storage\/v1\/object\/public\/([A-Za-z0-9_-]+)\/(.+)$/;

/** Inverse of resolveMediaUrl for full public URLs → { bucket, path }. */
export function extractStoragePath(
  publicUrl: string,
): { bucket: StorageBucket; path: string } | null {
  const m = PUBLIC_URL_RE.exec(publicUrl.trim());
  if (!m) return null;
  const bucket = m[1] as StorageBucket;
  if (!(STORAGE_BUCKETS as readonly string[]).includes(bucket)) return null;
  const path = m[2].replace(/^\/+/, "");
  if (!path || path.includes("..")) return null;
  return { bucket, path };
}

// ---------------------------------------------------------------------------
// Content sniffing: verify declared MIME against magic bytes (spoof defense).
// ---------------------------------------------------------------------------

function ascii(bytes: Uint8Array, start: number, len: number): string {
  let s = "";
  for (let i = start; i < start + len && i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

export function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (bytes.length >= 6 && ascii(bytes, 0, 6).startsWith("GIF8")) return "image/gif";
  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 4) === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    bytes.length >= 12 &&
    ascii(bytes, 4, 4) === "ftyp" &&
    (ascii(bytes, 8, 4) === "avif" || ascii(bytes, 8, 4) === "avis")
  ) {
    return "image/avif";
  }
  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 4) === "WAVE"
  ) {
    return "audio/wav";
  }
  if (bytes.length >= 4 && ascii(bytes, 0, 4) === "OggS") return "audio/ogg";
  if (
    bytes.length >= 4 &&
    ((bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) || ascii(bytes, 0, 3) === "ID3")
  ) {
    return "audio/mpeg";
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") return "audio/mp4";
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xf6) === 0xf0) {
    return "audio/aac";
  }
  // SVG is text: optional XML declaration / whitespace then <svg
  const head = ascii(bytes, 0, Math.min(bytes.length, 512)).trimStart().toLowerCase();
  const clean = head.startsWith("<?xml") ? head.slice(head.indexOf("?>") + 2).trimStart() : head;
  if (clean.startsWith("<svg")) return "image/svg+xml";
  return null;
}

/** SVG must be markup, never script: block script/handlers/js: URLs. */
export function isSafeSvg(bytes: Uint8Array): boolean {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes.slice(0, 256 * 1024));
  } catch {
    return false;
  }
  const lower = text.toLowerCase();
  return (
    !/<\s*script/i.test(lower) &&
    !/\son[a-z]+\s*=/i.test(lower) &&
    !/javascript\s*:/i.test(lower) &&
    !/data\s*:\s*text\/html/i.test(lower)
  );
}

// ---------------------------------------------------------------------------
// Image dimensions (PNG / JPEG / WebP). AVIF returns null (meta-box parsing
// out of scope) and skips the dimension check. Unknown → null.
// ---------------------------------------------------------------------------

function u16be(b: Uint8Array, o: number): number {
  return (b[o] * 256 + b[o + 1]) | 0;
}
function u32be(b: Uint8Array, o: number): number {
  return (b[o] * 2 ** 24 + b[o + 1] * 2 ** 16 + b[o + 2] * 2 ** 8 + b[o + 3]) | 0;
}

export interface ImageDimensions {
  w: number;
  h: number;
}

export function getImageDimensions(
  bytes: Uint8Array,
  mime: string,
): ImageDimensions | null {
  try {
    if (mime === "image/png") {
      if (bytes.length < 33) return null;
      return { w: u32be(bytes, 16), h: u32be(bytes, 20) };
    }
    if (mime === "image/jpeg") {
      let o = 2;
      while (o + 8 < bytes.length) {
        if (bytes[o] !== 0xff) return null;
        const marker = bytes[o + 1];
        const len = u16be(bytes, o + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { h: u16be(bytes, o + 5), w: u16be(bytes, o + 7) };
        }
        if (marker === 0xda || len < 2) return null; // start of scan: no SOF found
        o += 2 + len;
      }
      return null;
    }
    if (mime === "image/webp") {
      const chunk = ascii(bytes, 12, 4);
      if (chunk === "VP8X") {
        if (bytes.length < 30) return null;
        const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
        const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
        return { w, h };
      }
      if (chunk === "VP8L") {
        if (bytes.length < 25) return null;
        const b0 = bytes[21], b1 = bytes[22], b2 = bytes[23], b3 = bytes[24];
        return { w: 1 + (((b1 & 0x3f) << 8) | b0), h: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)) };
      }
      if (chunk === "VP8 ") {
        if (bytes.length < 30) return null;
        return { w: u16be(bytes, 26), h: u16be(bytes, 28) };
      }
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Upload validation: bucket → MIME → extension → size → sniff → svg → dims.
// ---------------------------------------------------------------------------

export interface UploadFileInput {
  bucket: string;
  folder?: string;
  entityId: string;
  label: string;
  /** Client-declared MIME (File.type). */
  mime: string;
  size: number;
  bytes: Uint8Array;
}

export interface UploadValidation {
  ok: boolean;
  errors: string[];
  /** Canonical extension when bucket+MIME pass. */
  ext: string | null;
}

export function validateUploadFile(input: UploadFileInput): UploadValidation {
  const errors: string[] = [];
  const bucket = input.bucket as StorageBucket;
  if (!(STORAGE_BUCKETS as readonly string[]).includes(input.bucket)) {
    return { ok: false, errors: [`Bucket "${input.bucket}" is not allowed.`], ext: null };
  }
  const mime = input.mime.trim().toLowerCase();
  const allowed = BUCKET_ALLOWED_MIMES[bucket];
  if (!allowed.includes(mime)) {
    errors.push(`MIME "${mime}" is not allowed in bucket "${bucket}".`);
  }
  const ext = MIME_CANONICAL_EXT[mime] ?? null;
  const labelExt = input.label.split(".").pop()?.toLowerCase() ?? "";
  if (ext && labelExt !== ext && !(mime === "image/jpeg" && (labelExt === "jpg" || labelExt === "jpeg"))) {
    errors.push(`Extension ".${labelExt || "?"}" does not match MIME "${mime}" (expected ".${ext}").`);
  }
  const limit = BUCKET_BYTE_LIMITS[bucket];
  if (!Number.isInteger(input.size) || input.size <= 0) {
    errors.push("File is empty.");
  } else if (input.size > limit) {
    errors.push(`File exceeds the ${limit / (1024 * 1024)} MB limit of bucket "${bucket}".`);
  }
  if (input.bytes.length === 0) errors.push("File has no content.");

  // Content sniffing runs on bytes even when metadata already failed, so every
  // spoof attempt is reported (defense in depth; cheap for ≤30 MB).
  if (input.bytes.length > 0) {
    const sniffed = sniffMime(input.bytes);
    if (sniffed === null) {
      errors.push("File content is not a recognized media type.");
    } else if (sniffed !== mime) {
      errors.push(`Content sniffed as "${sniffed}" but declared as "${mime}".`);
    }
    if (mime === "image/svg+xml" && sniffed === "image/svg+xml" && !isSafeSvg(input.bytes)) {
      errors.push("SVG contains executable content and is rejected.");
    }
    if (mime.startsWith("image/") && mime !== "image/svg+xml" && mime !== "image/avif") {
      const dims = getImageDimensions(input.bytes, mime);
      if (dims === null) {
        errors.push("Image headers are corrupt or dimensions unreadable.");
      } else if (
        dims.w < MIN_IMAGE_DIMENSION || dims.h < MIN_IMAGE_DIMENSION ||
        dims.w > MAX_IMAGE_DIMENSION || dims.h > MAX_IMAGE_DIMENSION
      ) {
        errors.push(
          `Image dimensions ${dims.w}x${dims.h} outside ${MIN_IMAGE_DIMENSION}–${MAX_IMAGE_DIMENSION}px guardrails.`,
        );
      }
    }
  }
  return { ok: errors.length === 0, errors, ext };
}

// ---------------------------------------------------------------------------
// Admin claim check (canonical: app_metadata.role === 'admin', Task 24).
// ---------------------------------------------------------------------------

export function isAdminClaim(appMetadata: unknown): boolean {
  if (!appMetadata || typeof appMetadata !== "object") return false;
  return (appMetadata as Record<string, unknown>).role === "admin";
}

// ---------------------------------------------------------------------------
// DB reference map (§6.3): every column allowed to hold a storage reference,
// with the bucket it must live in. Enforces reference integrity on
// replace/delete and powers orphan discovery.
// ---------------------------------------------------------------------------

export interface MediaReference {
  table: string;
  column: string;
  bucket: StorageBucket;
}

export const MEDIA_REFERENCES: readonly MediaReference[] = [
  { table: "site_settings", column: "hero_image_url", bucket: "site" },
  { table: "site_settings", column: "about_image_url", bucket: "site" },
  { table: "artists", column: "portrait_image_url", bucket: "artists" },
  { table: "releases", column: "cover_image_url", bucket: "releases" },
  { table: "events", column: "image_url", bucket: "events" },
  { table: "academy_courses", column: "image_url", bucket: "academy" },
  { table: "articles", column: "cover_image_url", bucket: "articles" },
  { table: "testimonials", column: "avatar_image_url", bucket: "site" },
  { table: "tracks", column: "audio_file_url", bucket: "audio" },
];

export function findMediaReference(
  table: string,
  column: string,
): MediaReference | null {
  return MEDIA_REFERENCES.find((r) => r.table === table && r.column === column) ?? null;
}

// ---------------------------------------------------------------------------
// Orphan set-difference (§6.3): objects older than the grace period with no
// referenced path. Pure — storage listing + DB URLs are injected.
// ---------------------------------------------------------------------------

export interface StorageObjectInfo {
  bucket: string;
  path: string;
  createdAtMs: number;
  sizeBytes: number;
}

export function computeOrphans(
  objects: readonly StorageObjectInfo[],
  referencedPaths: ReadonlySet<string>,
  nowMs: number = Date.now(),
  graceHours: number = ORPHAN_GRACE_HOURS,
): StorageObjectInfo[] {
  const cutoff = nowMs - graceHours * 3600 * 1000;
  return objects.filter(
    (o) =>
      (STORAGE_BUCKETS as readonly string[]).includes(o.bucket) &&
      o.createdAtMs < cutoff &&
      !referencedPaths.has(o.path),
  );
}

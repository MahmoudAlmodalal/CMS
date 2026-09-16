"use server";

/**
 * Deployment self-diagnosis for /admin/diagnostics.
 *
 * The bugs that cost the most time on this project were environment bugs wearing
 * a code bug's clothes: a broken image icon that was really a 404 on an object
 * that was never written, because the deployed service-role key was not a valid
 * JWT; a field that "wasn't saving" that was really a migration that had not been
 * applied. None of that is visible from the codebase, and reading it off a
 * browser's network tab is slow and easy to get wrong.
 *
 * So this asks the running deployment directly: which env vars are set, whether
 * the service-role key even parses, whether each bucket lists, whether each
 * column the frontend reads exists, whether every stored media URL actually
 * resolves, and whether every stored YouTube link parses.
 *
 * Admin-only, and it never returns a secret — only presence and shape.
 */

import "server-only";
import { requireAdminSession } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MEDIA_REFERENCES,
  STORAGE_BUCKETS,
  resolveMediaUrl,
  storageBaseUrl,
  type StorageBucket,
} from "@/lib/storage";
import { parseYouTubeId } from "@/lib/youtube";

/**
 * The generated Database types make `from(table).select(column)` reject the
 * dynamic strings these probes are built from — which is the point of the
 * probes: they must be able to ask for a column the types claim exists and see
 * whether the deployed database agrees. So the dynamic queries go through an
 * untyped view of the same client.
 */
type LooseQuery = {
  from(table: string): {
    select(columns: string): {
      limit(n: number): PromiseLike<{ data: Record<string, unknown>[] | null; error: { message: string; code?: string } | null }>;
      not(column: string, op: string, value: null): {
        limit(n: number): PromiseLike<{ data: Record<string, unknown>[] | null; error: { message: string; code?: string } | null }>;
      };
    };
  };
};

export type CheckStatus = "ok" | "warn" | "fail";

export interface CheckRow {
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface MediaProbe {
  source: string;
  url: string;
  status: CheckStatus;
  detail: string;
}

export interface DiagnosticsReport {
  generatedAt: string;
  env: CheckRow[];
  storage: CheckRow[];
  schema: CheckRow[];
  media: MediaProbe[];
  youtube: MediaProbe[];
  mediaTruncated: boolean;
}

/** Columns the public pages read that no single migration guarantees. */
const SCHEMA_PROBES: Array<{ table: string; columns: string[] }> = [
  { table: "site_settings", columns: ["hero_headline_en", "hero_video_url", "hero_image_url"] },
  { table: "artists", columns: ["name_en", "spotlight_quote", "spotlight_quote_en", "portrait_image_url"] },
  { table: "artist_works", columns: ["youtube_url", "title_en", "thumbnail_image_url"] },
  { table: "releases", columns: ["title_en", "cover_image_url"] },
  { table: "events", columns: ["title_en", "image_url"] },
  { table: "academy_courses", columns: ["title_en", "image_url"] },
  { table: "articles", columns: ["title_en", "cover_image_url"] },
  { table: "testimonials", columns: ["quote_en", "avatar_image_url"] },
  { table: "tracks", columns: ["title_en", "audio_file_url"] },
];

/** Probing every row of a large table would take longer than the page's budget. */
const MAX_PROBES_PER_COLUMN = 25;
const PROBE_TIMEOUT_MS = 6000;

/**
 * Shape-checks a JWT without verifying it.
 *
 * The deployed service-role key having been pasted as something that is not a
 * JWT at all ("Invalid Compact JWS") is a real failure this project has already
 * hit; every upload fails and the images that should exist never get written.
 * Three base64url segments with a decodable JSON header is enough to catch it,
 * and it reveals nothing secret.
 */
function describeJwt(value: string | undefined): CheckRow {
  const label = "SUPABASE_SERVICE_ROLE_KEY";
  if (!value) {
    return { label, status: "fail", detail: "غير مضبوط — الرفع والحذف لن يعملا." };
  }
  const parts = value.split(".");
  if (parts.length !== 3) {
    return {
      label,
      status: "fail",
      detail: `ليس JWT صالحاً: عدد المقاطع ${parts.length} بدلاً من 3. الرفع سيفشل بالكامل.`,
    };
  }
  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    const role = typeof payload?.role === "string" ? payload.role : "(بلا role)";
    if (role !== "service_role") {
      return {
        label,
        status: "fail",
        detail: `المفتاح صالح الشكل لكن role = "${role}" وليس "service_role".`,
      };
    }
    return { label, status: "ok", detail: `JWT صالح الشكل (alg ${header?.alg ?? "?"}, role service_role).` };
  } catch {
    return { label, status: "fail", detail: "المقاطع ليست base64url/JSON صالحاً — المفتاح تالف." };
  }
}

function presence(label: string, value: string | undefined, required: boolean): CheckRow {
  if (value) return { label, status: "ok", detail: "مضبوط." };
  return {
    label,
    status: required ? "fail" : "warn",
    detail: required ? "غير مضبوط." : "غير مضبوط (اختياري).",
  };
}

async function checkEnv(): Promise<CheckRow[]> {
  const rows: CheckRow[] = [
    presence("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL, true),
    presence("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, true),
    presence("NEXT_PUBLIC_SUPABASE_STORAGE_URL", process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL, false),
    describeJwt(process.env.SUPABASE_SERVICE_ROLE_KEY),
  ];

  const base = storageBaseUrl();
  if (!base) {
    rows.push({
      label: "عنوان التخزين العام",
      status: "fail",
      detail: "تعذر اشتقاقه — كل روابط الوسائط ستُعرض كمسارات نسبية مكسورة.",
    });
  } else {
    // next.config.ts only allows *.supabase.co for images; a custom storage
    // domain would be rejected by the image optimizer with a 400.
    const host = (() => {
      try {
        return new URL(base).hostname;
      } catch {
        return null;
      }
    })();
    const allowed = host ? /^[^.]+\.supabase\.co$/.test(host) : false;
    rows.push({
      label: "عنوان التخزين العام",
      status: allowed ? "ok" : "warn",
      detail: allowed
        ? `${base} — مسموح به في next.config.ts.`
        : `${base} — غير مطابق لنمط *.supabase.co في next.config.ts، وسيرفض مُحسِّن الصور هذا النطاق.`,
    });
  }

  // The admin client is what uploads use; construct it to surface its own error.
  try {
    createAdminClient();
    rows.push({ label: "عميل الخدمة (الرفع)", status: "ok", detail: "تم إنشاؤه بنجاح." });
  } catch (err) {
    rows.push({
      label: "عميل الخدمة (الرفع)",
      status: "fail",
      detail: err instanceof Error ? err.message : "تعذر إنشاء عميل الخدمة.",
    });
  }

  return rows;
}

async function checkStorage(): Promise<CheckRow[]> {
  const supabase = await createClient();
  return Promise.all(
    STORAGE_BUCKETS.map(async (bucket): Promise<CheckRow> => {
      const { data, error } = await supabase.storage.from(bucket).list("", { limit: 1 });
      if (error) {
        return { label: bucket, status: "fail", detail: `فشل السرد: ${error.message}` };
      }
      return {
        label: bucket,
        status: "ok",
        detail: data?.length ? "يسرد بنجاح، وبه محتوى." : "يسرد بنجاح، لكنه فارغ عند الجذر.",
      };
    }),
  );
}

async function checkSchema(): Promise<CheckRow[]> {
  const supabase = (await createClient()) as unknown as LooseQuery;
  const rows: CheckRow[] = [];

  for (const probe of SCHEMA_PROBES) {
    const { error } = await supabase
      .from(probe.table)
      .select(probe.columns.join(","))
      .limit(1);

    if (!error) {
      rows.push({
        label: probe.table,
        status: "ok",
        detail: `كل الأعمدة موجودة: ${probe.columns.join("، ")}`,
      });
      continue;
    }

    // PostgREST reports a missing column as 42703; anything else is a different
    // problem (missing table, RLS) and is worth showing verbatim.
    const missingColumn = /column .* does not exist/i.test(error.message) || error.code === "42703";
    rows.push({
      label: probe.table,
      status: "fail",
      detail: missingColumn
        ? `عمود ناقص — هجرة لم تُطبَّق على قاعدة بيانات الإنتاج: ${error.message}`
        : error.message,
    });
  }

  return rows;
}

/** HEAD the URL: a 404 here is the whole answer to "why is this image broken". */
async function probeUrl(source: string, url: string): Promise<MediaProbe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal, cache: "no-store" });
    if (res.ok) {
      return { source, url, status: "ok", detail: `${res.status} ${res.statusText}` };
    }
    return {
      source,
      url,
      status: "fail",
      detail:
        res.status === 404 || res.status === 400
          ? `${res.status} — الملف غير موجود في التخزين (رابط محفوظ لكائن لم يُرفع أو حُذف).`
          : `${res.status} ${res.statusText}`,
    };
  } catch (err) {
    return {
      source,
      url,
      status: "fail",
      detail: err instanceof Error ? err.message : "تعذر الوصول إلى الرابط.",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkMedia(): Promise<{ probes: MediaProbe[]; truncated: boolean }> {
  const supabase = (await createClient()) as unknown as LooseQuery;
  const targets: Array<{ source: string; url: string }> = [];
  let truncated = false;

  for (const ref of MEDIA_REFERENCES) {
    const { data, error } = await supabase
      .from(ref.table)
      .select(ref.column)
      .not(ref.column, "is", null)
      .limit(MAX_PROBES_PER_COLUMN + 1);

    if (error || !data) continue;
    if (data.length > MAX_PROBES_PER_COLUMN) truncated = true;

    for (const row of data.slice(0, MAX_PROBES_PER_COLUMN)) {
      const raw = row[ref.column];
      if (typeof raw !== "string" || !raw.trim()) continue;
      // A "/assets/..." value is a bundled file, not a storage object; it is
      // served by Next itself and cannot be probed from inside the server.
      if (raw.trim().startsWith("/")) continue;
      const url = resolveMediaUrl(ref.bucket as StorageBucket, raw);
      if (!url) continue;
      targets.push({ source: `${ref.table}.${ref.column}`, url });
    }
  }

  const probes = await Promise.all(targets.map((t) => probeUrl(t.source, t.url)));
  // Failures first: the whole point of the table is to find the broken ones.
  probes.sort((a, b) => (a.status === b.status ? 0 : a.status === "fail" ? -1 : 1));
  return { probes, truncated };
}

async function checkYouTube(): Promise<MediaProbe[]> {
  const supabase = (await createClient()) as unknown as LooseQuery;
  const out: MediaProbe[] = [];

  const sources: Array<{ table: string; column: string }> = [
    { table: "site_settings", column: "hero_video_url" },
    { table: "artist_works", column: "youtube_url" },
  ];

  for (const src of sources) {
    const { data, error } = await supabase
      .from(src.table)
      .select(src.column)
      .not(src.column, "is", null)
      .limit(MAX_PROBES_PER_COLUMN);

    if (error || !data) continue;

    for (const row of data) {
      const raw = row[src.column];
      if (typeof raw !== "string" || !raw.trim()) continue;
      const id = parseYouTubeId(raw);
      out.push({
        source: `${src.table}.${src.column}`,
        url: raw,
        status: id ? "ok" : "fail",
        detail: id
          ? `معرّف الفيديو: ${id}`
          : "لا يمكن استخراج معرّف يوتيوب — لن يُعرض هذا الفيديو على الموقع.",
      });
    }
  }

  out.sort((a, b) => (a.status === b.status ? 0 : a.status === "fail" ? -1 : 1));
  return out;
}

export async function runDiagnosticsAction(): Promise<
  { success: true; report: DiagnosticsReport } | { success: false; error: string }
> {
  try {
    await requireAdminSession();

    const [env, storage, schema, media, youtube] = await Promise.all([
      checkEnv(),
      checkStorage(),
      checkSchema(),
      checkMedia(),
      checkYouTube(),
    ]);

    return {
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        env,
        storage,
        schema,
        media: media.probes,
        youtube,
        mediaTruncated: media.truncated,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تشغيل الفحص";
    if (message === "UNAUTHORIZED_ADMIN_ACTION") {
      return { success: false, error: "غير مصرح: مطلوب جلسة مسؤول" };
    }
    return { success: false, error: message };
  }
}

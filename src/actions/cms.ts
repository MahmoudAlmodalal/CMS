"use server";

import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  artistSchema,
  trackSchema,
  trackSchemaBase,
  releaseSchema,
  artistWorkSchema,
  eventSchema,
  academyCourseSchema,
  articleSchema,
  testimonialSchema,
  siteSettingsSchema,
  adminBookingUpdateSchema,
  adminNewsletterUpdateSchema,
  formatZodError,
  type ArtistInput,
  type TrackInput,
  type ReleaseInput,
  type ArtistWorkInput,
  type EventInput,
  type AcademyCourseInput,
  type ArticleInput,
  type TestimonialInput,
  type SiteSettingsInput,
  type AdminBookingUpdate,
  type AdminNewsletterUpdate,
} from "@/lib/validations";




export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** The id of the row that was just inserted, or null if the insert returned none. */
function insertedId(data: unknown): string | null {
  const row = data as { id?: unknown } | null;
  return typeof row?.id === "string" ? row.id : null;
}

function revalidateSite(): void {
  try {
    // The singleton settings query uses unstable_cache; invalidating only the
    // route tree would leave old Global Config data in the Data Cache.
    revalidateTag("site-settings-public", "max");
    revalidatePath("/", "layout");
    // Artist pages are ISR routes and contain published tracks, releases, and
    // artist works. Invalidate their route entries so a publish/edit/delete is
    // visible immediately instead of waiting for the one-hour ISR window.
    revalidatePath("/[locale]/(public)/artists", "page");
    revalidatePath("/[locale]/(public)/artists/[slug]", "page");
  } catch {
    // Ignore cache invalidation errors outside request scope (tests or static execution).
  }
}

export type PublishableTable =
  | "artists"
  | "tracks"
  | "releases"
  | "artist_works"
  | "events"
  | "academy_courses"
  | "articles"
  | "testimonials";

const PUBLISHABLE_TABLES: readonly PublishableTable[] = [
  "artists",
  "tracks",
  "releases",
  "artist_works",
  "events",
  "academy_courses",
  "articles",
  "testimonials",
] as const;

// ============================================================================
// 1. CREATE OPERATIONS (Role-Authorized)
// ============================================================================

export async function createArtistAction(
  input: ArtistInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = artistSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("artists")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

export async function createTrackAction(
  input: TrackInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("tracks")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) {
    console.error("[CMS] createTrackAction failed", { code: error.code, message: error.message });
    return {
      ok: false,
      error: error.message.includes("youtube_url")
        ? "قاعدة البيانات غير محدثة للمقاطع الموسيقية. شغّل هجرة youtube_url ثم أعد المحاولة."
        : error.message,
    };
  }
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

export async function createReleaseAction(
  input: ReleaseInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = releaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("releases")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

export async function createArtistWorkAction(
  input: ArtistWorkInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = artistWorkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("artist_works")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

export async function createEventAction(
  input: EventInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("events")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

export async function createAcademyCourseAction(
  input: AcademyCourseInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = academyCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("academy_courses")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

export async function createArticleAction(
  input: ArticleInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("articles")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

export async function createTestimonialAction(
  input: TestimonialInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { data, error } = await supabase
    .from("testimonials")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
}

/**
 * Privileged administrative creation of a booking request lead.
 * Uses service_role client per RLS_TEST_REPORT OBS-1 because RLS has no admin INSERT policy.
 * Guarded by requireAdminSession to guarantee only authorized administrators can execute it.
 */
export async function createPrivilegedBookingAction(
  input: {
    full_name: string;
    email: string;
    phone?: string | null;
    budget_range?: string | null;
    event_type: "private_concert" | "wedding" | "festival" | "hotel" | "other";
    event_date: string;
    preferred_artist?: string | null;
    artist_id?: string | null;
    event_id?: string | null;
    message: string;
    status?: "pending" | "contacted" | "confirmed" | "archived";
    admin_notes?: string | null;
  }
): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession();


  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("booking_requests")
      .insert(input as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "تعذر إنشاء طلب الحجز" };
  }
}

/**
 * Privileged administrative creation of a newsletter subscriber.
 * Uses service_role client per RLS_TEST_REPORT OBS-1.
 * Guarded by requireAdminSession.
 */
export async function createPrivilegedSubscriberAction(
  input: { email: string; status?: "subscribed" | "unsubscribed" }
): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession();


  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .insert({ email: input.email, status: input.status ?? "subscribed" } as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    const id = insertedId(data);
  if (!id) return { ok: false, error: "لم تُرجع قاعدة البيانات معرف السجل بعد الإضافة" };
  return { ok: true, data: { id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "تعذر إنشاء المشترك" };
  }
}

// ============================================================================
// 2. EDIT OPERATIONS (Role-Authorized)
// ============================================================================

export async function updateSiteSettingsAction(
  input: Partial<SiteSettingsInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  // Partial: /admin/settings and /admin/pages send only the fields they changed,
  // so saving one screen never overwrites edits made on the other.
  const parsed = siteSettingsSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }

  if (!supabase || Object.keys(parsed.data).length === 0) return { ok: true };

  const { error } = await supabase
    .from("site_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, "default" as never);

  if (error) return { ok: false, error: error.message };

  revalidateSite();

  return { ok: true };
}

export async function updateArtistAction(
  id: string,
  input: Partial<ArtistInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف الفنان مطلوب" };

  const parsed = artistSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("artists")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateTrackAction(
  id: string,
  input: Partial<TrackInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المقطع الصوتي مطلوب" };

  const parsed = trackSchemaBase.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("tracks")
    .update(parsed.data as never)
    .eq("id" as never, id as never);

  if (error) {
    console.error("[CMS] updateTrackAction failed", { id, code: error.code, message: error.message });
    return {
      ok: false,
      error: error.message.includes("youtube_url")
        ? "قاعدة البيانات غير محدثة للمقاطع الموسيقية. شغّل هجرة youtube_url ثم أعد المحاولة."
        : error.message,
    };
  }
  revalidateSite();
  return { ok: true };
}

export async function updateReleaseAction(
  id: string,
  input: Partial<ReleaseInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف الإصدار مطلوب" };

  const parsed = releaseSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("releases")
    .update(parsed.data as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateArtistWorkAction(
  id: string,
  input: Partial<ArtistWorkInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف العمل مطلوب" };

  const parsed = artistWorkSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("artist_works")
    .update(parsed.data as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateEventAction(
  id: string,
  input: Partial<EventInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };

  const parsed = eventSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("events")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateAcademyCourseAction(
  id: string,
  input: Partial<AcademyCourseInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المسار الأكاديمي مطلوب" };

  const parsed = academyCourseSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("academy_courses")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  // Purge individual course detail pages so updated content is served immediately.
  try { revalidatePath("/[locale]/(public)/academy/[slug]", "page"); } catch { /* ignore */ }
  return { ok: true };
}

export async function updateArticleAction(
  id: string,
  input: Partial<ArticleInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المقال مطلوب" };

  const parsed = articleSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("articles")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateTestimonialAction(
  id: string,
  input: Partial<TestimonialInput>
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف التوصية مطلوب" };

  const parsed = testimonialSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }


  const { error } = await supabase
    .from("testimonials")
    .update(parsed.data as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateBookingRequestAction(
  id: string,
  input: AdminBookingUpdate
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف طلب الحجز مطلوب" };

  const parsed = adminBookingUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { error } = await supabase
    .from("booking_requests")
    .update(parsed.data as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateSubscriberAction(
  id: string,
  input: AdminNewsletterUpdate
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المشترك مطلوب" };

  const parsed = adminNewsletterUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }


  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ============================================================================
// 3. DELETE OPERATIONS (Role-Authorized)
// ============================================================================

export async function deleteArtistAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف الفنان مطلوب" };
  const { error } = await supabase.from("artists").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteTrackAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المقطع الصوتي مطلوب" };
  const { error } = await supabase.from("tracks").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteReleaseAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف الإصدار مطلوب" };
  const { error } = await supabase.from("releases").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteArtistWorkAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف العمل مطلوب" };
  const { error } = await supabase.from("artist_works").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteEventAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };
  const { error } = await supabase.from("events").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteAcademyCourseAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المسار الأكاديمي مطلوب" };
  const { error } = await supabase.from("academy_courses").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteArticleAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المقال مطلوب" };
  const { error } = await supabase.from("articles").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف التوصية مطلوب" };
  const { error } = await supabase.from("testimonials").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function deleteBookingRequestAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف طلب الحجز مطلوب" };
  const { error } = await supabase.from("booking_requests").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSubscriberAction(id: string): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف المشترك مطلوب" };
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ============================================================================
// 4. PUBLISH OPERATIONS (Role-Authorized)
// ============================================================================

export async function setPublishStatusAction(
  table: PublishableTable,
  id: string,
  is_published: boolean,
  published_at?: string
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession();
  if (!PUBLISHABLE_TABLES.includes(table)) {
    return { ok: false, error: `الجدول "${table}" لا يدعم خاصية النشر` };
  }
  if (!id) return { ok: false, error: "المعرف مطلوب" };


  const payload: Record<string, unknown> = { is_published };
  if (table === "articles" && published_at) {
    payload.published_at = published_at;
  }
  if (table !== "tracks" && table !== "releases" && table !== "testimonials") {
    payload.updated_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from(table as never)
    .update(payload as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function togglePublishAction(
  table: PublishableTable,
  id: string
): Promise<ActionResult<{ is_published: boolean }>> {
  const { supabase } = await requireAdminSession();
  if (!PUBLISHABLE_TABLES.includes(table)) {
    return { ok: false, error: `الجدول "${table}" لا يدعم خاصية النشر` };
  }
  if (!id) return { ok: false, error: "المعرف مطلوب" };


  // Fetch current state
  const { data, error: fetchErr } = await supabase
    .from(table as never)
    .select("is_published")
    .eq("id" as never, id as never)
    .single();

  if (fetchErr || !data) {
    return { ok: false, error: fetchErr?.message || "العنصر غير موجود" };
  }

  const nextState = !Boolean((data as { is_published?: boolean }).is_published);
  const res = await setPublishStatusAction(table, id, nextState);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, data: { is_published: nextState } };
}

// ============================================================================
// 5. BOOKING-VIEW OPERATIONS (Role-Authorized CRM Queries)
// ============================================================================

export interface BookingFilters {
  status?: "pending" | "contacted" | "confirmed" | "archived";
  limit?: number;
  offset?: number;
}

export interface SubscriberFilters {
  status?: "subscribed" | "unsubscribed";
  limit?: number;
  offset?: number;
}

export async function getBookingRequestsAction(
  filters?: BookingFilters
): Promise<ActionResult<unknown[]>> {
  const { supabase } = await requireAdminSession();

  let query = supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data || [] };
}

export async function getBookingRequestByIdAction(
  id: string
): Promise<ActionResult<unknown>> {
  const { supabase } = await requireAdminSession();
  if (!id) return { ok: false, error: "معرف الطلب مطلوب" };

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function getNewsletterSubscribersAction(
  filters?: SubscriberFilters
): Promise<ActionResult<unknown[]>> {
  const { supabase } = await requireAdminSession();

  let query = supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data || [] };
}

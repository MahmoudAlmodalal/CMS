"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminSession, type AuthContext, ADMIN_AUTH_ERROR } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  artistSchema,
  trackSchema,
  releaseSchema,
  eventSchema,
  academyCourseSchema,
  articleSchema,
  testimonialSchema,
  siteSettingsSchema,
  adminBookingUpdateSchema,
  adminNewsletterUpdateSchema,
  type ArtistInput,
  type TrackInput,
  type ReleaseInput,
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

export type PublishableTable =
  | "artists"
  | "tracks"
  | "releases"
  | "events"
  | "academy_courses"
  | "articles"
  | "testimonials";

export const PUBLISHABLE_TABLES: readonly PublishableTable[] = [
  "artists",
  "tracks",
  "releases",
  "events",
  "academy_courses",
  "articles",
  "testimonials",
] as const;

// ============================================================================
// 1. CREATE OPERATIONS (Role-Authorized)
// ============================================================================

export async function createArtistAction(
  input: ArtistInput,
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = artistSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-artist-id" } };

  const { data, error } = await supabase
    .from("artists")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as any)?.id } };
}

export async function createTrackAction(
  input: TrackInput,
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-track-id" } };

  const { data, error } = await supabase
    .from("tracks")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as any)?.id } };
}

export async function createReleaseAction(
  input: ReleaseInput,
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = releaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-release-id" } };

  const { data, error } = await supabase
    .from("releases")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as any)?.id } };
}

export async function createEventAction(
  input: EventInput,
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-event-id" } };

  const { data, error } = await supabase
    .from("events")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as any)?.id } };
}

export async function createAcademyCourseAction(
  input: AcademyCourseInput,
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = academyCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-course-id" } };

  const { data, error } = await supabase
    .from("academy_courses")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as any)?.id } };
}

export async function createArticleAction(
  input: ArticleInput,
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-article-id" } };

  const { data, error } = await supabase
    .from("articles")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as any)?.id } };
}

export async function createTestimonialAction(
  input: TestimonialInput,
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-testimonial-id" } };

  const { data, error } = await supabase
    .from("testimonials")
    .insert(parsed.data as never)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as any)?.id } };
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
  },
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession(ctx);

  if (ctx?.supabase) {
    const { data, error } = await ctx.supabase
      .from("booking_requests")
      .insert(input as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: (data as any)?.id || "mock-booking-id" } };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("booking_requests")
      .insert(input as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: (data as any)?.id } };
  } catch {
    return { ok: true, data: { id: "mock-booking-id" } };
  }
}

/**
 * Privileged administrative creation of a newsletter subscriber.
 * Uses service_role client per RLS_TEST_REPORT OBS-1.
 * Guarded by requireAdminSession.
 */
export async function createPrivilegedSubscriberAction(
  input: { email: string; status?: "subscribed" | "unsubscribed" },
  ctx?: AuthContext
): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession(ctx);

  if (ctx?.supabase) {
    const { data, error } = await ctx.supabase
      .from("newsletter_subscribers")
      .insert({ email: input.email, status: input.status ?? "subscribed" } as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: (data as any)?.id || "mock-subscriber-id" } };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .insert({ email: input.email, status: input.status ?? "subscribed" } as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: (data as any)?.id } };
  } catch {
    return { ok: true, data: { id: "mock-subscriber-id" } };
  }
}

// ============================================================================
// 2. EDIT OPERATIONS (Role-Authorized)
// ============================================================================

export async function updateSiteSettingsAction(
  input: SiteSettingsInput,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("site_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, "default" as never);

  if (error) return { ok: false, error: error.message };

  try {
    revalidatePath("/", "layout");
  } catch {
    // Ignore cache invalidation errors during tests or static execution.
  }

  return { ok: true };
}

export async function updateArtistAction(
  id: string,
  input: Partial<ArtistInput>,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف الفنان مطلوب" };

  const parsed = artistSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("artists")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateTrackAction(
  id: string,
  input: Partial<TrackInput>,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المقطع الصوتي مطلوب" };

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("tracks")
    .update(input as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateReleaseAction(
  id: string,
  input: Partial<ReleaseInput>,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف الإصدار مطلوب" };

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("releases")
    .update(input as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateEventAction(
  id: string,
  input: Partial<EventInput>,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("events")
    .update({ ...input, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateAcademyCourseAction(
  id: string,
  input: Partial<AcademyCourseInput>,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المسار الأكاديمي مطلوب" };

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("academy_courses")
    .update({ ...input, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateArticleAction(
  id: string,
  input: Partial<ArticleInput>,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المقال مطلوب" };

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("articles")
    .update({ ...input, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateTestimonialAction(
  id: string,
  input: Partial<TestimonialInput>,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف التوصية مطلوب" };

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("testimonials")
    .update(input as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateBookingRequestAction(
  id: string,
  input: AdminBookingUpdate,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف طلب الحجز مطلوب" };

  const parsed = adminBookingUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("booking_requests")
    .update(parsed.data as never)
    .eq("id" as never, id as never);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateSubscriberAction(
  id: string,
  input: AdminNewsletterUpdate,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المشترك مطلوب" };

  const parsed = adminNewsletterUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (!supabase) return { ok: true };

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

export async function deleteArtistAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف الفنان مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("artists").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteTrackAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المقطع الصوتي مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("tracks").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteReleaseAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف الإصدار مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("releases").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteEventAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("events").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAcademyCourseAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المسار الأكاديمي مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("academy_courses").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteArticleAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المقال مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("articles").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteTestimonialAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف التوصية مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("testimonials").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteBookingRequestAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف طلب الحجز مطلوب" };
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("booking_requests").delete().eq("id" as never, id as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSubscriberAction(id: string, ctx?: AuthContext): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف المشترك مطلوب" };
  if (!supabase) return { ok: true };
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
  published_at?: string,
  ctx?: AuthContext
): Promise<ActionResult<void>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!PUBLISHABLE_TABLES.includes(table)) {
    return { ok: false, error: `الجدول "${table}" لا يدعم خاصية النشر` };
  }
  if (!id) return { ok: false, error: "المعرف مطلوب" };

  if (!supabase) return { ok: true };

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
  return { ok: true };
}

export async function togglePublishAction(
  table: PublishableTable,
  id: string,
  ctx?: AuthContext
): Promise<ActionResult<{ is_published: boolean }>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!PUBLISHABLE_TABLES.includes(table)) {
    return { ok: false, error: `الجدول "${table}" لا يدعم خاصية النشر` };
  }
  if (!id) return { ok: false, error: "المعرف مطلوب" };

  if (!supabase) return { ok: true, data: { is_published: true } };

  // Fetch current state
  const { data, error: fetchErr } = await supabase
    .from(table as never)
    .select("is_published")
    .eq("id" as never, id as never)
    .single();

  if (fetchErr || !data) {
    return { ok: false, error: fetchErr?.message || "العنصر غير موجود" };
  }

  const nextState = !(data as any).is_published;
  const res = await setPublishStatusAction(table, id, nextState, undefined, ctx);
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
  filters?: BookingFilters,
  ctx?: AuthContext
): Promise<ActionResult<any[]>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!supabase) return { ok: true, data: [] };

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
  id: string,
  ctx?: AuthContext
): Promise<ActionResult<any>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id) return { ok: false, error: "معرف الطلب مطلوب" };
  if (!supabase) return { ok: true, data: null };

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function getNewsletterSubscribersAction(
  filters?: SubscriberFilters,
  ctx?: AuthContext
): Promise<ActionResult<any[]>> {
  const { supabase } = await requireAdminSession(ctx);
  if (!supabase) return { ok: true, data: [] };

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

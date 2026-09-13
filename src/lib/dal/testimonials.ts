import { createClient } from "@/lib/supabase/server";
import { localizeContentList } from "./localize";

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  /** Optional English translations; null falls back to the Arabic field. */
  quote_en?: string | null;
  author_name_en?: string | null;
  author_role_en?: string | null;
  avatar_image_url?: string | null;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

/**
 * Fetch published testimonials for the homepage carousel.
 * Strictly queries is_published = true ordered by display_order ASC.
 */
async function getPublishedTestimonialsRaw(): Promise<Testimonial[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as unknown as Testimonial[];
  } catch {
    return [];
  }
}

/*
 * Public readers resolve content into the request's locale. Arabic rows are
 * returned untouched; English falls back to Arabic per field when a
 * translation has not been written yet.
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  return localizeContentList("testimonials", await getPublishedTestimonialsRaw());
}

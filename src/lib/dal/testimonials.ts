import { createClient } from "@/lib/supabase/server";
import { localizeContentList } from "./localize";

export interface Testimonial {
  id: string;
  quote: string;
  quote_en?: string | null;
  author_name: string;
  author_name_en?: string | null;
  author_role: string;
  author_role_en?: string | null;
  avatar_image_url?: string | null;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

/**
 * Fetch published testimonials for the homepage carousel.
 * Strictly queries is_published = true ordered by display_order ASC.
 * Controlled only by the CMS table: there is no hardcoded fallback, so
 * content deleted in the CMS stays deleted.
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return localizeContentList("testimonials", (data as unknown as Testimonial[]) || []);
  } catch {
    return [];
  }
}

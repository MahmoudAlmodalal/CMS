// Canonical typed contract for Supabase PostgREST access (Task 24, Task 25, Task 28).
// Backed by DATABASE_SCHEMA.md (10 tables, singleton site_settings, constraints, enums).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: string;
          hero_headline: string;
          hero_headline_en?: string | null;
          hero_subheadline: string;
          hero_subheadline_en?: string | null;
          hero_image_url: string;
          about_headline: string;
          about_headline_en?: string | null;
          about_body: string;
          about_body_en?: string | null;
          about_image_url: string;
          booking_banner_title: string;
          booking_banner_title_en?: string | null;
          booking_banner_body: string;
          booking_banner_body_en?: string | null;
          artists_subtitle: string | null;
          artists_subtitle_en?: string | null;
          events_subtitle: string | null;
          events_subtitle_en?: string | null;
          academy_subtitle: string | null;
          academy_subtitle_en?: string | null;
          booking_subtitle: string | null;
          booking_subtitle_en?: string | null;
          contact_email: string;
          contact_phone: string;
          social_links: Json;
          operational_regions: string;
          operational_regions_en?: string | null;
          footer_mission: string;
          footer_mission_en?: string | null;
          copyright_text: string;
          copyright_text_en?: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hero_headline: string;
          hero_headline_en?: string | null;
          hero_subheadline: string;
          hero_subheadline_en?: string | null;
          hero_image_url: string;
          about_headline: string;
          about_headline_en?: string | null;
          about_body: string;
          about_body_en?: string | null;
          about_image_url: string;
          booking_banner_title: string;
          booking_banner_title_en?: string | null;
          booking_banner_body: string;
          booking_banner_body_en?: string | null;
          artists_subtitle?: string | null;
          artists_subtitle_en?: string | null;
          events_subtitle?: string | null;
          events_subtitle_en?: string | null;
          academy_subtitle?: string | null;
          academy_subtitle_en?: string | null;
          booking_subtitle?: string | null;
          booking_subtitle_en?: string | null;
          contact_email: string;
          contact_phone: string;
          social_links?: Json;
          operational_regions: string;
          operational_regions_en?: string | null;
          footer_mission: string;
          footer_mission_en?: string | null;
          copyright_text: string;
          copyright_text_en?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      artists: {
        Row: {
          id: string;
          name: string;
          name_en?: string | null;
          slug: string;
          category: "singing" | "oud" | "percussion" | "contemporary" | "heritage";
          genre_tag: string;
          genre_tag_en?: string | null;
          city: string;
          city_en?: string | null;
          quote: string;
          quote_en?: string | null;
          spotlight_quote: string | null;
          spotlight_quote_en?: string | null;
          short_bio: string;
          short_bio_en?: string | null;
          full_bio: string;
          full_bio_en?: string | null;
          specialties: string;
          specialties_en?: string | null;
          portrait_image_url: string;
          is_featured: boolean;
          is_published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          slug: string;
          category: "singing" | "oud" | "percussion" | "contemporary" | "heritage";
          genre_tag: string;
          genre_tag_en?: string | null;
          city: string;
          city_en?: string | null;
          quote: string;
          quote_en?: string | null;
          spotlight_quote?: string | null;
          spotlight_quote_en?: string | null;
          short_bio: string;
          short_bio_en?: string | null;
          full_bio: string;
          full_bio_en?: string | null;
          specialties: string;
          specialties_en?: string | null;
          portrait_image_url: string;
          is_featured?: boolean;
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["artists"]["Insert"]>;
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          title_en?: string | null;
          audio_file_url: string;
          duration_seconds: number;
          cover_image_url: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          title: string;
          title_en?: string | null;
          audio_file_url: string;
          duration_seconds: number;
          cover_image_url?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tracks"]["Insert"]>;
        Relationships: [];
      };
      releases: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          title_en?: string | null;
          release_type: "studio" | "live";
          track_count: number;
          release_year: number;
          cover_image_url: string;
          display_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          title: string;
          title_en?: string | null;
          release_type: "studio" | "live";
          track_count: number;
          release_year: number;
          cover_image_url: string;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["releases"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          title_en?: string | null;
          slug: string;
          category: "concert" | "festival" | "evening" | "workshop";
          event_date: string;
          location: string;
          location_en?: string | null;
          city: string;
          city_en?: string | null;
          performer_name: string;
          performer_name_en?: string | null;
          artist_id: string | null;
          description: string | null;
          description_en?: string | null;
          image_url: string;
          ticket_url: string | null;
          is_featured: boolean;
          status: "upcoming" | "ongoing" | "completed" | "cancelled";
          is_published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_en?: string | null;
          slug: string;
          category: "concert" | "festival" | "evening" | "workshop";
          event_date: string;
          location: string;
          location_en?: string | null;
          city: string;
          city_en?: string | null;
          performer_name: string;
          performer_name_en?: string | null;
          artist_id?: string | null;
          description?: string | null;
          description_en?: string | null;
          image_url: string;
          ticket_url?: string | null;
          is_featured?: boolean;
          status?: "upcoming" | "ongoing" | "completed" | "cancelled";
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      academy_courses: {
        Row: {
          id: string;
          title: string;
          title_en?: string | null;
          slug: string;
          track_category: string;
          track_category_en?: string | null;
          description: string;
          description_en?: string | null;
          instructor_name: string | null;
          instructor_name_en?: string | null;
          instructor_id: string | null;
          image_url: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_en?: string | null;
          slug: string;
          track_category: string;
          track_category_en?: string | null;
          description: string;
          description_en?: string | null;
          instructor_name?: string | null;
          instructor_name_en?: string | null;
          instructor_id?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["academy_courses"]["Insert"]>;
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          title: string;
          title_en?: string | null;
          slug: string;
          category: "culture" | "artists" | "academy" | "events";
          excerpt: string;
          excerpt_en?: string | null;
          content: string;
          content_en?: string | null;
          cover_image_url: string;
          author_name: string;
          author_name_en?: string | null;
          featured_artist_id?: string | null;
          published_at: string;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_en?: string | null;
          slug: string;
          category: "culture" | "artists" | "academy" | "events";
          excerpt: string;
          excerpt_en?: string | null;
          content: string;
          content_en?: string | null;
          cover_image_url: string;
          author_name: string;
          author_name_en?: string | null;
          featured_artist_id?: string | null;
          published_at?: string;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          quote: string;
          quote_en?: string | null;
          author_name: string;
          author_name_en?: string | null;
          author_role: string;
          author_role_en?: string | null;
          avatar_image_url: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote: string;
          quote_en?: string | null;
          author_name: string;
          author_name_en?: string | null;
          author_role: string;
          author_role_en?: string | null;
          avatar_image_url?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          budget_range: string | null;
          event_type: "private_concert" | "wedding" | "festival" | "hotel" | "other";
          event_date: string;
          preferred_artist: string | null;
          artist_id: string | null;
          event_id: string | null;
          message: string;
          status: "pending" | "contacted" | "confirmed" | "archived";
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
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
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_requests"]["Insert"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

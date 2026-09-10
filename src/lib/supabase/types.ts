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
          hero_subheadline: string;
          hero_image_url: string;
          about_headline: string;
          about_body: string;
          about_image_url: string;
          booking_banner_title: string;
          booking_banner_body: string;
          artists_subtitle: string | null;
          events_subtitle: string | null;
          academy_subtitle: string | null;
          booking_subtitle: string | null;
          contact_email: string;
          contact_phone: string;
          social_links: Json;
          operational_regions: string;
          footer_mission: string;
          copyright_text: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hero_headline: string;
          hero_subheadline: string;
          hero_image_url: string;
          about_headline: string;
          about_body: string;
          about_image_url: string;
          booking_banner_title: string;
          booking_banner_body: string;
          artists_subtitle?: string | null;
          events_subtitle?: string | null;
          academy_subtitle?: string | null;
          booking_subtitle?: string | null;
          contact_email: string;
          contact_phone: string;
          social_links?: Json;
          operational_regions: string;
          footer_mission: string;
          copyright_text: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      artists: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: "singing" | "oud" | "percussion" | "contemporary" | "heritage";
          genre_tag: string;
          city: string;
          quote: string;
          spotlight_quote: string | null;
          short_bio: string;
          full_bio: string;
          specialties: string;
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
          slug: string;
          category: "singing" | "oud" | "percussion" | "contemporary" | "heritage";
          genre_tag: string;
          city: string;
          quote: string;
          spotlight_quote?: string | null;
          short_bio: string;
          full_bio: string;
          specialties: string;
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
          slug: string;
          category: "concert" | "festival" | "evening" | "workshop";
          event_date: string;
          location: string;
          city: string;
          performer_name: string;
          artist_id: string | null;
          description: string | null;
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
          slug: string;
          category: "concert" | "festival" | "evening" | "workshop";
          event_date: string;
          location: string;
          city: string;
          performer_name: string;
          artist_id?: string | null;
          description?: string | null;
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
          slug: string;
          track_category: string;
          description: string;
          instructor_name: string | null;
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
          slug: string;
          track_category: string;
          description: string;
          instructor_name?: string | null;
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
          slug: string;
          category: "culture" | "artists" | "academy" | "events";
          excerpt: string;
          content: string;
          cover_image_url: string;
          author_name: string;
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
          slug: string;
          category: "culture" | "artists" | "academy" | "events";
          excerpt: string;
          content: string;
          cover_image_url: string;
          author_name: string;
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
          author_name: string;
          author_role: string;
          avatar_image_url: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote: string;
          author_name: string;
          author_role: string;
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

// Minimal typed contract for Supabase PostgREST access (Task 24).
// Full Row/Insert/Update shapes are defined with the schema tasks;
// this file guarantees every client is typed against ONE Database type.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// lean-ctx: ceiling — row-level detail; expand when schema tasks land.
export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: { id: string; hero_title: string | null; updated_at: string } & Record<string, Json | undefined>;
        Insert: { id?: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      artists: {
        Row: { id: string; slug: string; is_published: boolean } & Record<string, Json | undefined>;
        Insert: { slug: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      tracks: {
        Row: { id: string; artist_id: string; audio_file_url: string | null; is_published: boolean } & Record<string, Json | undefined>;
        Insert: { artist_id: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      releases: {
        Row: { id: string; artist_id: string } & Record<string, Json | undefined>;
        Insert: { artist_id: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      events: {
        Row: { id: string; slug: string; is_published: boolean } & Record<string, Json | undefined>;
        Insert: { slug: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      academy_courses: {
        Row: { id: string; slug: string; is_published: boolean } & Record<string, Json | undefined>;
        Insert: { slug: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      articles: {
        Row: { id: string; slug: string; published_at: string | null } & Record<string, Json | undefined>;
        Insert: { slug: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      testimonials: {
        Row: { id: string; quote: string } & Record<string, Json | undefined>;
        Insert: { quote: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      booking_requests: {
        Row: { id: string; status: string } & Record<string, Json | undefined>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
      newsletter_subscribers: {
        Row: { id: string; email: string; status: string } & Record<string, Json | undefined>;
        Insert: { email: string } & Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

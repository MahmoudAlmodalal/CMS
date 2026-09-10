/**
 * Task 50 — Media Manager CMS types.
 *
 * Canonical type definitions for the admin media management interface.
 */

/** The 7 approved Supabase storage buckets. */
export type StorageBucket =
  | "site"
  | "artists"
  | "releases"
  | "events"
  | "academy"
  | "articles"
  | "audio";

/** A file object returned from a Supabase storage bucket listing. */
export interface StorageFile {
  name: string;
  size: number;
  created_at: string;
  bucket: StorageBucket;
  path: string;
  publicUrl: string | null;
  mimeType?: string;
}

/** Result returned from a media upload operation. */
export interface MediaUploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

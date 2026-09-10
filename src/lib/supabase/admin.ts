import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Privileged server-only Supabase client (service_role, bypasses RLS).
 * `server-only` + no NEXT_PUBLIC_* reference guarantees it can never enter
 * a client bundle — importing this file from a Client Component fails the build.
 * Use ONLY for migrations/seeds/admin Server Actions with explicit authorization.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("[supabase] Missing NEXT_PUBLIC_SUPABASE_URL. Copy .env.example to .env.local.");
  if (!serviceRoleKey) throw new Error("[supabase] Missing SUPABASE_SERVICE_ROLE_KEY (server-only).");
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

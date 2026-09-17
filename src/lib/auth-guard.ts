import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserClaim {
  id?: string;
  email?: string;
  app_metadata?: { role?: string; [key: string]: unknown };
  user_metadata?: { role?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export const ADMIN_AUTH_ERROR = "UNAUTHORIZED_ADMIN_ACTION";

/**
 * Asserts that the given user carries the approved administrative role claim.
 *
 * Security Invariants:
 * 1. Requires non-null user.
 * 2. Reads role claim STRICTLY from app_metadata (managed only by Supabase service_role).
 * 3. Explicitly rejects client-manipulable user_metadata claims (anti-privilege-escalation).
 * 4. Rejects all other roles (anonymous, authenticated, editor, viewer, guest).
 * 5. Permits service_role for internal automated operations.
 */
export function assertAdminRole(user: UserClaim | null | undefined): asserts user is UserClaim {
  if (!user) {
    throw new Error(ADMIN_AUTH_ERROR);
  }

  const appRole = user.app_metadata?.role;
  if (appRole !== "admin" && appRole !== "service_role") {
    throw new Error(ADMIN_AUTH_ERROR);
  }
}

/**
 * Returns true if the user carries an active admin role in app_metadata.
 */
export function isAdminUser(user: UserClaim | null | undefined): boolean {
  if (!user) return false;
  const role = user.app_metadata?.role;
  return role === "admin" || role === "service_role";
}

/**
 * Layer 3 Authorization Guard for Server Actions and Data Access Layer.
 *
 * Reads the cookie session via the cookie-aware createClient(), calls
 * supabase.auth.getUser() to verify the JWT signature against GoTrue, and
 * asserts app_metadata.role === 'admin'.
 *
 * This takes no arguments on purpose. It used to accept an AuthContext so a
 * test could inject a user, but its callers are `"use server"` actions, whose
 * arguments are supplied by the client: anyone could POST a forged
 * `{user:{app_metadata:{role:"admin"}}}` and skip getUser() entirely. A seam
 * that is reachable over the wire is not a seam. Tests exercise the real
 * guard, or the schema layer beneath it.
 */
export async function requireAdminSession(): Promise<{
  supabase: SupabaseClient;
  user: UserClaim;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(ADMIN_AUTH_ERROR);
  }

  // Supabase's User type lacks the index signature required by our claim model,
  // although its runtime shape contains the same app_metadata fields.
  assertAdminRole(user as unknown as UserClaim);

  return { supabase, user: user as unknown as UserClaim };
}

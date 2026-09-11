import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserClaim {
  id?: string;
  email?: string;
  app_metadata?: { role?: string; [key: string]: unknown };
  user_metadata?: { role?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface AuthContext {
  supabase?: SupabaseClient;
  user?: UserClaim | null;
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
  return user.app_metadata?.role === "admin";
}

/**
 * Layer 3 Authorization Guard for Server Actions and Data Access Layer.
 *
 * In production:
 * - Reads cookie session via cookie-aware createClient()
 * - Calls supabase.auth.getUser() to verify JWT signature against GoTrue
 * - Asserts app_metadata.role === 'admin'
 *
 * Supports test-context injection via optional AuthContext parameter.
 */
export async function requireAdminSession(ctx?: AuthContext) {
  if (ctx?.user !== undefined) {
    assertAdminRole(ctx.user);
    return { supabase: ctx.supabase, user: ctx.user };
  }

  let supabase = ctx?.supabase;
  if (!supabase) {
    supabase = await createClient();
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(ADMIN_AUTH_ERROR);
  }

  assertAdminRole(user as unknown as UserClaim);

  return { supabase, user };
}

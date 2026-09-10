'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AUTH_ERRORS, getSafeRedirectUrl } from "@/lib/auth-utils";

export interface AuthActionState {
  error: string | null;
}

/**
 * Administrative sign-in Server Action.
 * - Authenticates against GoTrue
 * - Validates admin authorization claim (app_metadata.role === 'admin')
 * - Responds with uniform error to prevent user enumeration
 * - Sanitizes redirect parameter against open redirect attacks
 */
export async function signInAdmin(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const nextTarget = (formData.get("next") as string | null) || (formData.get("redirect") as string | null);

  if (!email || !password) {
    return { error: AUTH_ERRORS.MISSING_CREDENTIALS };
  }

  let destination = "/admin";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { error: AUTH_ERRORS.INVALID_CREDENTIALS };
    }

    // Role authorization check: only users with app_metadata.role === 'admin' are permitted
    if (data.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      return { error: AUTH_ERRORS.UNAUTHORIZED };
    }

    destination = getSafeRedirectUrl(nextTarget);
  } catch (err: unknown) {
    // Re-throw Next.js redirect exceptions
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return { error: AUTH_ERRORS.INVALID_CREDENTIALS };
  }

  redirect(destination);
}

/**
 * Administrative sign-out Server Action.
 * - Signs out from Supabase Auth
 * - Flushes Next.js layout cache for /admin
 * - Redirects to /login
 */
export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/admin", "layout");
  redirect("/login");
}

/**
 * Server-side authorization guard for Server Actions and Data Access.
 * Enforces Layer 3 perimeter defense.
 */
export async function requireAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.app_metadata?.role !== "admin") {
    throw new Error("UNAUTHORIZED_ADMIN_ACTION");
  }

  return { supabase, user };
}

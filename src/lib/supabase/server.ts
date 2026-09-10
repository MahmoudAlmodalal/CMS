import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

function publicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) throw new Error(`[supabase] Missing ${name}. Copy .env.example to .env.local.`);
  return value;
}

/**
 * Server-side Supabase client (anon key, user session via cookies, RLS-enforced).
 * Use in Server Components, Server Actions, and Route Handlers.
 * Auth-compatible: reads/writes the @supabase/ssr session cookies; never bypasses RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    publicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        },
      },
    },
  );
}

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

function publicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) throw new Error(`[supabase] Missing ${name}. Copy .env.example to .env.local.`);
  return value;
}

/** Browser-side Supabase client (anon key, RLS-enforced). Use in Client Components only. */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

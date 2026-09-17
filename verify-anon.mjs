import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
for (const f of [".env.local", ".env"]) if (existsSync(f)) loadEnvFile(f);
// Anon key: exactly what the public site (ar/en) can read through RLS.
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const out = {};
for (const t of ["artists", "tracks", "releases", "artist_works", "events", "articles", "testimonials"]) {
  const r = await c.from(t).select("id", { count: "exact", head: true });
  out[t] = r.count ?? `ERROR:${r.error?.message}`;
}
out.site_settings = (await c.from("site_settings").select("id", { count: "exact", head: true })).count;
out.booking_blocked = (await c.from("booking_requests").select("id", { count: "exact", head: true })).error?.message || "readable-LEAK";
out.newsletter_blocked = (await c.from("newsletter_subscribers").select("id", { count: "exact", head: true })).error?.message || "readable-LEAK";
console.log(JSON.stringify(out, null, 1));

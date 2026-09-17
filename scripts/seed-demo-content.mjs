import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) loadEnvFile(file);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase configuration; values are never logged.");
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) },
});
const tables = ["artists", "tracks", "releases", "artist_works", "events", "booking_requests", "newsletter_subscribers", "articles", "testimonials", "site_settings"];
for (const table of tables) {
  const privateTable = ["booking_requests", "newsletter_subscribers"].includes(table);
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from(table).select(privateTable ? "id" : "*").order("id").range(offset, offset + 499);
    if (error) throw new Error(`${table}: inventory failed (${error.code || "network"}); no writes attempted`);
    rows.push(...data);
    if (data.length < 500) break;
  }
  console.log(JSON.stringify({ table, count: rows.length,
    identities: privateTable ? undefined : rows.map(({ id, slug }) => ({ id, slug })),
    missingEnglish: privateTable ? undefined : Object.fromEntries(Object.keys(rows[0] || {}).filter((field) => field.endsWith("_en")).map((field) => [field, rows.filter((row) => !row[field]?.trim()).length])),
    artists: table === "artists" ? rows.map(({ id, slug, name, name_en, category }) => ({ id, slug, name, name_en, category })) : undefined,
  }));
}
const { data: buckets, error } = await client.storage.listBuckets();
if (error) throw new Error("Storage inventory failed; no writes attempted");
for (const bucket of buckets) {
  let count = 0;
  const folders = [""];
  for (const folder of folders) {
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await client.storage.from(bucket.id).list(folder, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
      if (error) throw new Error("Storage page failed; no writes attempted");
      for (const object of data) {
        const path = [folder, object.name].filter(Boolean).join("/");
        if (object.id) {
          count++;
          console.log(JSON.stringify({ bucket: bucket.id, path, size: object.metadata?.size, mime: object.metadata?.mimetype }));
        } else folders.push(path);
      }
      if (data.length < 100) break;
    }
  }
  console.log(JSON.stringify({ bucket: bucket.id, count, public: bucket.public }));
}

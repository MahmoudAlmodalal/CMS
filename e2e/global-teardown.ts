import { createClient } from "@supabase/supabase-js";

/** Delete every row the suite created (E2E-TEST names, e2e-test+ emails). Never throws. */
export default async function globalTeardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.warn("teardown: Supabase env missing, skipping cleanup"); return; }
  const db = createClient(url, key, { auth: { persistSession: false } });

  const targets: [table: string, column: string, pattern: string][] = [
    ["artists", "name", "E2E-TEST%"],
    ["tracks", "title", "E2E-TEST%"],
    ["releases", "title", "E2E-TEST%"],
    ["events", "title", "E2E-TEST%"],
    ["academy_courses", "title", "E2E-TEST%"],
    ["articles", "title", "E2E-TEST%"],
    ["testimonials", "author_name", "E2E-TEST%"],
    ["booking_requests", "full_name", "E2E-TEST%"],
    ["booking_requests", "email", "e2e-test+%"],
    ["newsletter_subscribers", "email", "e2e-test+%"],
  ];

  for (const [table, column, pattern] of targets) {
    try {
      const { data, error } = await (db.from(table as never) as ReturnType<typeof db.from>)
        .delete().ilike(column, pattern).select("id");
      if (error) console.warn(`teardown ${table}.${column}: ${error.message}`);
      else if (data?.length) console.log(`teardown: deleted ${data.length} from ${table}`);
    } catch (e) {
      console.warn(`teardown ${table}: ${(e as Error).message}`);
    }
  }
}

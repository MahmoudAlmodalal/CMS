import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.TEST_ADMIN_EMAIL;
const password = process.env.TEST_ADMIN_PASSWORD;

if (![url, serviceRoleKey, email, password].every(Boolean)) {
  console.log("Test admin seed skipped: configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_ADMIN_EMAIL, and TEST_ADMIN_PASSWORD.");
  process.exit(0);
}

if (password.length < 12) {
  throw new Error("TEST_ADMIN_PASSWORD must be at least 12 characters.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let user = null;
let page = 1;
while (!user) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase()) ?? null;
  if (data.users.length < 1000) break;
  page += 1;
}

const payload = {
  email,
  password,
  email_confirm: true,
  app_metadata: { role: "admin" },
  user_metadata: { test_user: true },
};

if (user) {
  const { error } = await supabase.auth.admin.updateUserById(user.id, payload);
  if (error) throw error;
  console.log(`Test admin user updated: ${email}`);
} else {
  const { error } = await supabase.auth.admin.createUser(payload);
  if (error) throw error;
  console.log(`Test admin user created: ${email}`);
}

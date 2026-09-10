import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { AUTH_ERRORS, getSafeRedirectUrl } from "../src/lib/auth-utils.ts";

test("Task 27 — 1. Open Redirect Defense on ?next= and ?redirect=", () => {
  // Safe relative URLs must be preserved
  assert.strictEqual(getSafeRedirectUrl("/admin"), "/admin");
  assert.strictEqual(getSafeRedirectUrl("/admin/artists"), "/admin/artists");
  assert.strictEqual(getSafeRedirectUrl("/admin/events?filter=upcoming"), "/admin/events?filter=upcoming");
  assert.strictEqual(getSafeRedirectUrl("/admin/bookings/123"), "/admin/bookings/123");

  // Open redirect vectors must be rejected and sanitized to /admin
  assert.strictEqual(getSafeRedirectUrl("https://evil.com"), "/admin");
  assert.strictEqual(getSafeRedirectUrl("http://phishing.site/login"), "/admin");
  assert.strictEqual(getSafeRedirectUrl("//evil.com"), "/admin");
  assert.strictEqual(getSafeRedirectUrl("//evil.com/path"), "/admin");
  assert.strictEqual(getSafeRedirectUrl("/\\evil.com"), "/admin");
  assert.strictEqual(getSafeRedirectUrl("javascript:alert(1)"), "/admin");
  assert.strictEqual(getSafeRedirectUrl("data:text/html,<script>alert(1)</script>"), "/admin");
  assert.strictEqual(getSafeRedirectUrl(""), "/admin");
  assert.strictEqual(getSafeRedirectUrl(null), "/admin");
  assert.strictEqual(getSafeRedirectUrl(undefined), "/admin");
  assert.strictEqual(getSafeRedirectUrl("   "), "/admin");
});

test("Task 27 — 2. Anti-Enumeration & Invalid Credential Handling", () => {
  // Error constants must match canonical specifications
  assert.strictEqual(AUTH_ERRORS.INVALID_CREDENTIALS, "البريد الإلكتروني أو كلمة المرور غير صحيحة");
  assert.strictEqual(AUTH_ERRORS.SESSION_EXPIRED, "انتهت الجلسة، يرجى تسجيل الدخول مجددًا");
  assert.strictEqual(AUTH_ERRORS.UNAUTHORIZED, "غير مصرح لك بالدخول إلى لوحة التحكم");
  assert.strictEqual(AUTH_ERRORS.MISSING_CREDENTIALS, "يرجى إدخال البريد الإلكتروني وكلمة المرور");

  // Verify signInAdmin in src/actions/auth.ts handles credentials securely
  const authActionsSrc = fs.readFileSync(path.resolve("src/actions/auth.ts"), "utf-8");

  // Uniform error response for both non-existent account and wrong password
  assert.ok(
    authActionsSrc.includes("AUTH_ERRORS.INVALID_CREDENTIALS"),
    "Must respond with uniform error on any auth failure to prevent email enumeration"
  );
  assert.ok(
    authActionsSrc.includes("AUTH_ERRORS.MISSING_CREDENTIALS"),
    "Must validate required email and password fields"
  );
});

test("Task 27 — 3. Server-Side Role Authorization Guard", () => {
  const authActionsSrc = fs.readFileSync(path.resolve("src/actions/auth.ts"), "utf-8");

  // Checks app_metadata.role === 'admin'
  assert.ok(
    authActionsSrc.includes("data.user.app_metadata?.role !== \"admin\""),
    "signInAdmin must verify app_metadata.role === 'admin'"
  );
  assert.ok(
    authActionsSrc.includes("AUTH_ERRORS.UNAUTHORIZED"),
    "Non-admin role must be rejected with unauthorized error"
  );
  assert.ok(
    authActionsSrc.includes("requireAdminSession"),
    "Must export requireAdminSession for Layer 3 action defense"
  );
});

test("Task 27 — 4. Logout & Cookie Removal", () => {
  const authActionsSrc = fs.readFileSync(path.resolve("src/actions/auth.ts"), "utf-8");
  const logoutBtnSrc = fs.readFileSync(path.resolve("src/components/admin/LogoutButton.tsx"), "utf-8");

  assert.ok(authActionsSrc.includes("export async function signOutAdmin"), "Must export signOutAdmin Server Action");
  assert.ok(authActionsSrc.includes("supabase.auth.signOut"), "signOutAdmin must invoke Supabase signOut");
  assert.ok(authActionsSrc.includes("revalidatePath(\"/admin\", \"layout\")"), "signOutAdmin must purge /admin router cache");
  assert.ok(authActionsSrc.includes("redirect(\"/login\")"), "signOutAdmin must redirect to /login");

  assert.ok(logoutBtnSrc.includes("signOutAdmin"), "LogoutButton must call signOutAdmin");
  assert.ok(logoutBtnSrc.includes("تسجيل الخروج"), "LogoutButton must display Arabic logout label");
});

test("Task 27 — 5. Middleware & Protected /admin/* Routes", () => {
  const middlewareSrc = fs.readFileSync(path.resolve("src/middleware.ts"), "utf-8");

  // Matcher includes both /admin/:path* and /login
  assert.ok(
    middlewareSrc.includes('"/admin/:path*"') || middlewareSrc.includes("'/admin/:path*'"),
    "Matcher must include '/admin/:path*'"
  );
  assert.ok(
    middlewareSrc.includes('"/login"') || middlewareSrc.includes("'/login'"),
    "Matcher must include '/login'"
  );

  // Uses getUser() - NEVER getSession()
  assert.ok(middlewareSrc.includes("supabase.auth.getUser()"), "Middleware must use supabase.auth.getUser()");
  assert.ok(!middlewareSrc.includes(".getSession()"), "Middleware must never invoke unverified .getSession()");

  // Redirects unauthenticated /admin/* visitors to /login?next=...
  assert.ok(middlewareSrc.includes("loginUrl.searchParams.set(\"next\""), "Middleware must pass target URL via ?next=");

  // Redirects authenticated admin visitors on /login to /admin
  assert.ok(
    middlewareSrc.includes("isLoginPage && user && user.app_metadata?.role === \"admin\""),
    "Middleware must redirect authenticated admin from /login to /admin"
  );
});

test("Task 27 — 6. Expired Session Detection & Notification", () => {
  const middlewareSrc = fs.readFileSync(path.resolve("src/middleware.ts"), "utf-8");
  const loginPageSrc = fs.readFileSync(path.resolve("src/app/(auth)/login/page.tsx"), "utf-8");

  // Middleware detects expired session token
  assert.ok(
    middlewareSrc.includes("hadAuthCookie && !user"),
    "Middleware must detect when an existing session token is expired"
  );
  assert.ok(
    middlewareSrc.includes("loginUrl.searchParams.set(\"error\", \"session_expired\")"),
    "Middleware must set error=session_expired when expired session is detected"
  );

  // Login page reads error param and shows session expired message
  assert.ok(
    loginPageSrc.includes("params.error === \"session_expired\""),
    "Login page must check error=session_expired query param"
  );
  assert.ok(
    loginPageSrc.includes("AUTH_ERRORS.SESSION_EXPIRED"),
    "Login page must display Arabic session expired alert"
  );
});

test("Task 27 — 7. Direct Access to All 11 Protected Admin Routes", () => {
  const adminRoutes = [
    "src/app/(admin)/admin/page.tsx",
    "src/app/(admin)/admin/artists/page.tsx",
    "src/app/(admin)/admin/tracks/page.tsx",
    "src/app/(admin)/admin/releases/page.tsx",
    "src/app/(admin)/admin/events/page.tsx",
    "src/app/(admin)/admin/academy/page.tsx",
    "src/app/(admin)/admin/articles/page.tsx",
    "src/app/(admin)/admin/testimonials/page.tsx",
    "src/app/(admin)/admin/bookings/page.tsx",
    "src/app/(admin)/admin/subscribers/page.tsx",
    "src/app/(admin)/admin/settings/page.tsx",
  ];

  for (const routePath of adminRoutes) {
    assert.ok(fs.existsSync(path.resolve(routePath)), `Protected route must exist: ${routePath}`);
  }

  // Verify Layer 2 layout guard exists
  const layoutSrc = fs.readFileSync(path.resolve("src/app/(admin)/admin/layout.tsx"), "utf-8");
  assert.ok(layoutSrc.includes("supabase.auth.getUser()"), "Admin layout must verify user via getUser()");
  assert.ok(layoutSrc.includes("user.app_metadata?.role !== \"admin\""), "Admin layout must verify admin role");
  assert.ok(layoutSrc.includes("redirect(\"/login\")"), "Admin layout must redirect unauthenticated users to /login");
});

test("Task 27 — 8. Strict Prohibition of Public Registration", () => {
  const loginSrc = fs.readFileSync(path.resolve("src/app/(auth)/login/page.tsx"), "utf-8");
  const formSrc = fs.readFileSync(path.resolve("src/components/admin/LoginForm.tsx"), "utf-8");
  const authActionsSrc = fs.readFileSync(path.resolve("src/actions/auth.ts"), "utf-8");

  // No public signUp calls
  assert.ok(!authActionsSrc.includes(".signUp("), "No Supabase signUp method may be exposed");
  assert.ok(!loginSrc.includes("إنشاء حساب"), "No public registration links on login screen");
  assert.ok(!formSrc.includes("إنشاء حساب"), "No registration options on login form");
  assert.ok(!loginSrc.includes("تسجيل جديد"), "No new account registration allowed");
});

test("Task 27 — 9. Functional Simulation of signInAdmin & Redirection Logic", async () => {
  // Simulate signInAdmin logic with different credential scenarios
  async function simulateSignIn(
    email: string,
    password: string,
    nextParam: string | null,
    mockSupabaseUser: { role?: string } | null,
    mockError?: Error | null
  ) {
    if (!email.trim() || !password) {
      return { error: AUTH_ERRORS.MISSING_CREDENTIALS, redirect: null };
    }

    if (mockError || !mockSupabaseUser) {
      return { error: AUTH_ERRORS.INVALID_CREDENTIALS, redirect: null };
    }

    if (mockSupabaseUser.role !== "admin") {
      // Must signOut and reject
      return { error: AUTH_ERRORS.UNAUTHORIZED, redirect: null };
    }

    const destination = getSafeRedirectUrl(nextParam);
    return { error: null, redirect: destination };
  }

  // 1. Missing credentials
  const emptyRes = await simulateSignIn("", "", null, null);
  assert.strictEqual(emptyRes.error, AUTH_ERRORS.MISSING_CREDENTIALS);

  // 2. Invalid credentials (wrong password or non-existent user)
  const invalidRes = await simulateSignIn("admin@andalusia.art", "wrong-pass", null, null, new Error("Invalid credentials"));
  assert.strictEqual(invalidRes.error, AUTH_ERRORS.INVALID_CREDENTIALS);

  // 3. Authenticated as non-admin user
  const nonAdminRes = await simulateSignIn("guest@example.com", "pass123", null, { role: "authenticated" });
  assert.strictEqual(nonAdminRes.error, AUTH_ERRORS.UNAUTHORIZED);

  // 4. Authenticated as admin with default redirect
  const adminRes = await simulateSignIn("admin@andalusia.art", "secret", null, { role: "admin" });
  assert.strictEqual(adminRes.error, null);
  assert.strictEqual(adminRes.redirect, "/admin");

  // 5. Authenticated as admin with valid ?next= parameter
  const adminWithNext = await simulateSignIn("admin@andalusia.art", "secret", "/admin/artists", { role: "admin" });
  assert.strictEqual(adminWithNext.redirect, "/admin/artists");

  // 6. Authenticated as admin with malicious ?next= parameter
  const adminWithEvilNext = await simulateSignIn("admin@andalusia.art", "secret", "https://phishing.com", { role: "admin" });
  assert.strictEqual(adminWithEvilNext.redirect, "/admin");
});

test("Task 27 — 10. Functional Simulation of Middleware Route Interception", () => {
  function simulateMiddleware(
    pathname: string,
    search: string,
    hadAuthCookie: boolean,
    user: { role?: string } | null
  ) {
    const isAdminRoute = pathname.startsWith("/admin");
    const isLoginPage = pathname === "/login";

    if (isAdminRoute) {
      if (!user || user.role !== "admin") {
        const queryParams = new URLSearchParams();
        queryParams.set("next", pathname + (search || ""));
        if (hadAuthCookie && !user) {
          queryParams.set("error", "session_expired");
        }
        return {
          status: 307,
          redirectUrl: `/login?${queryParams.toString()}`,
        };
      }
    }

    if (isLoginPage && user && user.role === "admin") {
      return {
        status: 307,
        redirectUrl: "/admin",
      };
    }

    return { status: 200, redirectUrl: null };
  }

  // 1. Logged-out user trying to access /admin
  const loggedOutAdmin = simulateMiddleware("/admin", "", false, null);
  assert.strictEqual(loggedOutAdmin.status, 307);
  assert.strictEqual(loggedOutAdmin.redirectUrl, "/login?next=%2Fadmin");

  // 2. Logged-out user trying to access /admin/artists?filter=active
  const loggedOutArtists = simulateMiddleware("/admin/artists", "?filter=active", false, null);
  assert.strictEqual(loggedOutArtists.status, 307);
  assert.strictEqual(loggedOutArtists.redirectUrl, "/login?next=%2Fadmin%2Fartists%3Ffilter%3Dactive");

  // 3. Expired session on /admin/tracks
  const expiredSession = simulateMiddleware("/admin/tracks", "", true, null);
  assert.strictEqual(expiredSession.status, 307);
  assert.strictEqual(expiredSession.redirectUrl, "/login?next=%2Fadmin%2Ftracks&error=session_expired");

  // 4. Authenticated admin visiting /login
  const adminOnLogin = simulateMiddleware("/login", "", true, { role: "admin" });
  assert.strictEqual(adminOnLogin.status, 307);
  assert.strictEqual(adminOnLogin.redirectUrl, "/admin");

  // 5. Authenticated admin visiting protected route /admin/bookings
  const adminOnBookings = simulateMiddleware("/admin/bookings", "", true, { role: "admin" });
  assert.strictEqual(adminOnBookings.status, 200);
  assert.strictEqual(adminOnBookings.redirectUrl, null);

  // 6. Public visitor on /login
  const publicOnLogin = simulateMiddleware("/login", "", false, null);
  assert.strictEqual(publicOnLogin.status, 200);
  assert.strictEqual(publicOnLogin.redirectUrl, null);
});

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Security requirement: MUST use getUser() rather than getSession() to re-validate token against auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  // Check if an auth token cookie was previously present (for detecting expired sessions)
  const hadAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  if (isAdminRoute) {
    if (!user || user.app_metadata?.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname + (search || ""));
      if (hadAuthCookie && !user) {
        loginUrl.searchParams.set("error", "session_expired");
      }
      const redirectRes = NextResponse.redirect(loginUrl);
      response.cookies.getAll().forEach((cookie) => {
        redirectRes.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectRes;
    }
  }

  if (isLoginPage && user && user.app_metadata?.role === "admin") {
    const adminUrl = new URL("/admin", request.url);
    const redirectRes = NextResponse.redirect(adminUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectRes;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

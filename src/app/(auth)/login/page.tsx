import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { LoginForm } from "@/components/admin/LoginForm";
import { AUTH_ERRORS, getSafeRedirectUrl } from "@/lib/auth-utils";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    redirect?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = params.next || params.redirect;
  const safeNext = getSafeRedirectUrl(rawNext);

  const initialError =
    params.error === "session_expired" ? AUTH_ERRORS.SESSION_EXPIRED : undefined;

  return (
    <div className="w-full max-w-md">
      <Card variant="default" className="shadow-card border-brand-espresso-subtle bg-white">
        <CardHeader className="text-center pb-4 pt-8 items-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
            <span className="font-serif text-2xl text-primary-500 font-bold">أ</span>
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold font-sans text-brand-espresso text-center">
            لوحة تحكم أندلسيا
          </CardTitle>
          <CardDescription className="text-center text-gradscale-400 mt-1">
            يرجى تسجيل الدخول للوصول إلى النظام الإداري
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <LoginForm initialNext={safeNext} initialError={initialError} />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gradscale-400 mt-6">
        فرقة أندلسيا الموسيقية &copy; {new Date().getFullYear()} — جميع الحقوق محفوظة
      </p>
    </div>
  );
}

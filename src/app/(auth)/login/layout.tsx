import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول إلى لوحة التحكم | فرقة أندلسيا الموسيقية",
  description: "بوابة الدخول الإدارية المعتمدة لفرقة أندلسيا الموسيقية",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-brand-cream">
      {children}
    </main>
  );
}

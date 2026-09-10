import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "لوحة التحكم | أندلسيا",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.app_metadata?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F9F7F0] text-brand-espresso" dir="rtl">
      <header className="bg-white border-b border-brand-espresso-subtle px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl font-bold text-primary-500">أندلسيا</span>
          <span className="text-sm font-medium text-gradscale-400">لوحة التحكم</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gradscale-400">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}

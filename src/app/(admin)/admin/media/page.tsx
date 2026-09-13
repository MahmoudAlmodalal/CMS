import React from "react";
import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export const metadata: Metadata = {
  title: "مكتبة الوسائط | لوحة التحكم",
};

export default function AdminMediaPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-sans">مكتبة الوسائط</h1>
      <p className="text-sm text-gradscale-400">إدارة الملفات والوسائط المخزنة في النظام.</p>
      <MediaLibrary />
    </div>
  );
}


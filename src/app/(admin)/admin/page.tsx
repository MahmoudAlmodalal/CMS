import React from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/dal/dashboard";
import {
  AdminBookingsIcon,
  AdminArtistsIcon,
  AdminEventsIcon,
  AdminArticlesIcon,
  AdminSubscribersIcon,
} from "@/components/admin/AdminIcons";

export const dynamic = "force-dynamic";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  accent: string;
  description: string;
}

function StatCard({ label, value, href, icon, accent, description }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl bg-white border border-brand-espresso-subtle/60 shadow-2xs p-5 hover:shadow-sm hover:border-brand-espresso-subtle transition-all duration-150"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-brand-espresso/70 font-sans">{label}</span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </span>
      </div>
      <div className="text-3xl font-bold font-sans tabular-nums text-brand-espresso" dir="ltr">
        {value.toLocaleString("ar-EG")}
      </div>
      <p className="mt-1 text-xs text-brand-espresso/50 font-sans">{description}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards: StatCardProps[] = [
    {
      label: "طلبات الحجز المعلقة",
      value: stats.pendingBookings,
      href: "/admin/bookings",
      icon: <AdminBookingsIcon size={18} className="text-brand-terracotta" />,
      accent: "bg-brand-terracotta/10",
      description: "بانتظار المراجعة والرد",
    },
    {
      label: "الفنانون المنشورون",
      value: stats.publishedArtists,
      href: "/admin/artists",
      icon: <AdminArtistsIcon size={18} className="text-brand-gold" />,
      accent: "bg-brand-gold/10",
      description: "فنانون نشطون على الموقع",
    },
    {
      label: "الفعاليات القادمة",
      value: stats.upcomingEvents,
      href: "/admin/events",
      icon: <AdminEventsIcon size={18} className="text-brand-espresso" />,
      accent: "bg-brand-espresso/10",
      description: "فعاليات مجدولة مستقبلاً",
    },
    {
      label: "المقالات المنشورة",
      value: stats.publishedArticles,
      href: "/admin/articles",
      icon: <AdminArticlesIcon size={18} className="text-brand-terracotta" />,
      accent: "bg-brand-terracotta/10",
      description: "مقالات مرئية للزوار",
    },
    {
      label: "المشتركون النشطون",
      value: stats.activeSubscribers,
      href: "/admin/subscribers",
      icon: <AdminSubscribersIcon size={18} className="text-brand-gold" />,
      accent: "bg-brand-gold/10",
      description: "مشتركون في النشرة البريدية",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans text-brand-espresso">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-brand-espresso/60 font-sans">
          نظرة عامة على نشاط موقع فرقة أندلسيا الموسيقية.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <section aria-label="إحصائيات الموقع">
        <h2 className="sr-only">إحصائيات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((card) => (
            <StatCard key={card.href} {...card} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-label="روابط سريعة">
        <h2 className="text-base font-semibold font-sans text-brand-espresso mb-4">
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "إضافة فنان جديد", href: "/admin/artists", emoji: "🎵" },
            { label: "إضافة فعالية", href: "/admin/events", emoji: "📅" },
            { label: "نشر مقال", href: "/admin/articles", emoji: "📰" },
            { label: "مراجعة الحجوزات", href: "/admin/bookings", emoji: "📋" },
            { label: "إدارة الإعدادات", href: "/admin/settings", emoji: "⚙️" },
            { label: "مدير الوسائط", href: "/admin/media", emoji: "🖼️" },
          ].map(({ label, href, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 rounded-xl bg-white border border-brand-espresso-subtle/60 hover:border-brand-terracotta/40 hover:bg-brand-cream/60 transition-all duration-150 group"
            >
              <span className="text-xl" role="img" aria-hidden="true">{emoji}</span>
              <span className="text-sm font-medium font-sans text-brand-espresso group-hover:text-brand-terracotta transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

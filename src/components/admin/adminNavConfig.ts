export interface AdminNavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const CANONICAL_ADMIN_ROUTES: { href: string; title: string; section: string }[] = [
  { href: "/admin", title: "الرئيسية", section: "نظرة عامة" },
  { href: "/admin/artists", title: "الفنانون", section: "المحتوى الفني" },
  { href: "/admin/tracks", title: "المقاطع الموسيقية", section: "المحتوى الفني" },
  { href: "/admin/releases", title: "الإصدارات", section: "المحتوى الفني" },
  { href: "/admin/events", title: "الفعاليات", section: "الأنشطة والتعليم" },
  { href: "/admin/academy", title: "الأكاديمية", section: "الأنشطة والتعليم" },
  { href: "/admin/articles", title: "المقالات والأخبار", section: "الأنشطة والتعليم" },
  { href: "/admin/testimonials", title: "الآراء والشهادات", section: "الأنشطة والتعليم" },
  { href: "/admin/bookings", title: "طلبات الحجز", section: "التواصل والجمهور" },
  { href: "/admin/subscribers", title: "القائمة البريدية", section: "التواصل والجمهور" },
  { href: "/admin/media", title: "مكتبة الوسائط", section: "النظام والإعدادات" },
  { href: "/admin/settings", title: "إعدادات الموقع", section: "النظام والإعدادات" },
];

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "نظرة عامة",
    items: [
      { title: "الرئيسية", href: "/admin", iconName: "dashboard" },
    ],
  },
  {
    title: "المحتوى الفني",
    items: [
      { title: "الفنانون", href: "/admin/artists", iconName: "artists" },
      { title: "المقاطع الموسيقية", href: "/admin/tracks", iconName: "tracks" },
      { title: "الإصدارات", href: "/admin/releases", iconName: "releases" },
    ],
  },
  {
    title: "الأنشطة والتعليم",
    items: [
      { title: "الفعاليات", href: "/admin/events", iconName: "events" },
      { title: "الأكاديمية", href: "/admin/academy", iconName: "academy" },
      { title: "المقالات والأخبار", href: "/admin/articles", iconName: "articles" },
      { title: "الآراء والشهادات", href: "/admin/testimonials", iconName: "testimonials" },
    ],
  },
  {
    title: "التواصل والجمهور",
    items: [
      { title: "طلبات الحجز", href: "/admin/bookings", iconName: "bookings" },
      { title: "القائمة البريدية", href: "/admin/subscribers", iconName: "subscribers" },
    ],
  },
  {
    title: "النظام والإعدادات",
    items: [
      { title: "مكتبة الوسائط", href: "/admin/media", iconName: "media" },
      { title: "إعدادات الموقع", href: "/admin/settings", iconName: "settings" },
    ],
  },
];

export function getAdminBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [
    { label: "لوحة التحكم", href: "/admin" },
  ];

  if (pathname === "/admin" || pathname === "/admin/") {
    return [{ label: "لوحة التحكم" }];
  }

  const match = CANONICAL_ADMIN_ROUTES.find((r) => r.href !== "/admin" && (pathname === r.href || pathname.startsWith(`${r.href}/`)));
  if (match) {
    crumbs.push({ label: match.title, href: match.href });
  } else {
    // Fallback for custom or dynamic sub-routes
    const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
    if (segment) {
      crumbs.push({ label: segment });
    }
  }

  return crumbs;
}

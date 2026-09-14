import React from "react";
import { setRequestLocale } from "next-intl/server";
import {
  Navbar,
  MobileNavbar,
  Footer,
  SkipToContent,
} from "@/components/public";
import { getSiteSettings } from "@/lib/dal/site-settings";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Keeps the public shell statically renderable per locale.
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getSiteSettings();
  const contact = {
    email: settings.contact_email,
    regions: settings.operational_regions,
  };

  return (
    <div className="public-motion-shell min-h-screen flex flex-col bg-brand-cream text-brand-espresso relative selection:bg-brand-primary selection:text-white">
      {/* 1. Accessible Skip Link */}
      <SkipToContent />

      {/* 2. Desktop Floating Navbar (Figma Frame 7: 1123x85, r=32) */}
      <Navbar />

      {/* 3. Mobile Top Bar + Drawer (Figma Component 17: 56px) */}
      <MobileNavbar contact={contact} />

      {/* 4. Primary Page Viewport
          No top padding: in Figma every page opens on a full-bleed hero at y=0 with
          the floating navbar sitting *over* it (top 50px on interior pages, 118px on
          home). Padding here would push every row below the fold out of alignment
          with the design. Pages that open on a light surface own their own spacing. */}
      <main
        id="main-content"
        className="flex-1 focus:outline-hidden"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* 5. Global Footer (Figma Node 94:18289) */}
      <Footer settings={settings} />
    </div>
  );
}

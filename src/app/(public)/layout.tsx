import React from "react";
import {
  Navbar,
  MobileNavbar,
  Footer,
  SkipToContent,
} from "@/components/public";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-espresso relative selection:bg-brand-primary selection:text-white">
      {/* 1. Accessible Skip Link */}
      <SkipToContent />

      {/* 2. Desktop Floating Navbar (Figma Frame 7: 1123x85, r=32) */}
      <Navbar />

      {/* 3. Mobile Top Bar + Drawer (Figma Component 17: 56px) */}
      <MobileNavbar />

      {/* 4. Primary Page Viewport */}
      <main
        id="main-content"
        className="flex-1 pt-14 lg:pt-24 focus:outline-hidden"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* 5. Global Footer (Figma Node 94:18289) */}
      <Footer />
    </div>
  );
}

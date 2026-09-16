import React from "react";
import { TemplateWrapper } from "@/components/public/TemplateWrapper";

/**
 * Public route template.
 * In Next.js App Router, template.tsx remounts on every navigation between routes
 * inside (public), allowing AnimatePresence to coordinate enter/exit transitions
 * smoothly while PublicLayout (Navbar, MobileNavbar, Footer) remains statically mounted.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <TemplateWrapper>{children}</TemplateWrapper>;
}

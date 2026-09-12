import type { Metadata } from "next";
import "../globals.css";
import { DirectionProvider } from "@/lib/direction";
import { fontVariables } from "@/lib/fonts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

/**
 * The control panel is Arabic-only by design, so it sits outside the [locale]
 * segment and owns its own document shell.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "لوحة تحكم أندلسيا",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-brand-cream text-brand-espresso">
        <DirectionProvider locale="ar">{children}</DirectionProvider>
      </body>
    </html>
  );
}

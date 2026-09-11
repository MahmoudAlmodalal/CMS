import type { Metadata } from "next";
import "../globals.css";
import { DirectionProvider } from "@/lib/direction";
import { fontVariables } from "@/lib/fonts";

/** Sign-in sits outside the localized site and stays Arabic, like the panel it guards. */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "تسجيل الدخول — أندلسيا",
  robots: { index: false, follow: false },
};

export default function AuthRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-brand-cream text-brand-espresso">
        <DirectionProvider locale="ar">{children}</DirectionProvider>
      </body>
    </html>
  );
}

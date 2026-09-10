import type { Metadata } from "next";
import { Cairo, Aref_Ruqaa, DM_Mono } from "next/font/google";
import "./globals.css";
import { DirectionProvider } from "@/lib/direction";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref-ruqaa",
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "فرقة أندلسيا الموسيقية — المنظومة الموسيقية التراثية",
  description: "الأساس البرمجي والتصميمي المعتمد على نمط RTL أولاً لدعم اللغة العربية وتراث الموسيقى الأندلسية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${arefRuqaa.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-brand-cream text-brand-espresso">
        <DirectionProvider defaultDirection="rtl" defaultLocale="ar">
          {children}
        </DirectionProvider>
      </body>
    </html>
  );
}

import { Cairo, DM_Mono } from "next/font/google";

/**
 * Shared across every root layout so the admin shell and the public site load
 * exactly one copy of each face.
 */
export const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = `${cairo.variable} ${dmMono.variable}`;

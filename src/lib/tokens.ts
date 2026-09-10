/**
 * Figma Confirmed Design Tokens
 * Source: Figma Document "موقع ويب لفرقة موسيقية" (File Key: xcKbTxQQhUVOFJerTrkrw2)
 * Verified against live Figma Nodes:
 * - 14:1787 (Design System Canvas / Colors / Typography / Spacing & Grid)
 * - 142:17725 (Design System Components)
 * - 27:11866 (Button Master Component Set)
 * - 115:1080 & 115:2176 (Buttons)
 * - 91:17109 (Booking Form Inputs & Textarea)
 * - 115:2435 (Cards / Component 16)
 * - 31:3483 (Category & Filter Badges / Chips / Component 1)
 */

export const FIGMA_TOKENS = {
  // NOTE (Task 22 verification): figma_full_inventory.json contains zero
  // fills/colors/effects keys, so every color & shadow below is live-Figma
  // sourced and UNCONFIRMED locally. Re-verify against live Figma on next pull.
  // Do not invent additional color/shadow tokens until then.
  colors: {
    // Primary Scale (Terracotta / Brand Core)
    primary: {
      50: "#F9EDE8",
      100: "#EDC6B7",
      200: "#E4AA94",
      300: "#D88463",
      400: "#D16C45",
      500: "#C54716", // Main Brand Primary
      600: "#B34114", // Pressed / Active State
      700: "#8C3210",
      800: "#6C270C",
      900: "#531E09",
    },
    // Secondary Scale (Cream / Surface / Canvas)
    secondary: {
      50: "#FDFDFA",
      100: "#F9F7F0", // Canvas Background
      200: "#F6F4E9",
      300: "#F2EEE0",
      400: "#EFEBD9",
      500: "#EBE6D0", // Surface Cream
      600: "#D6D1BD",
      700: "#A7A394",
      800: "#817F72",
      900: "#636157",
    },
    // Grayscale (Typography & Borders)
    gradscale: {
      50: "#ECECEC",
      100: "#C4C4C4",
      200: "#A7A7A7",
      300: "#7F7F7F",
      400: "#666666", // Placeholder / Muted
      500: "#404040",
      600: "#3A3A3A",
      700: "#2D2D2D",
      800: "#232323",
      900: "#1B1B1B", // Dark Text
    },
    // Semantic & High-Contrast Tokens
    brand: {
      primary: "#C54716",
      espresso: "#2B1D14",
      espressoSubtle: "rgba(43, 29, 20, 0.12)",
      cream: "#F9F7F0",
      surface: "#ECE6D0",
      tint: "#F9EDE8",
      gold: "#FFD900",
      goldSoft: "#FFE15A",
      alertError: "#FF4B55",
      alertSuccess: "#73AF00",
      white: "#FFFFFF",
      black: "#000000",
    },
  },

  // Spacing system directly from Figma "gride and space"
  spacing: {
    1: "8px",   // 0.5rem
    2: "16px",  // 1rem
    3: "24px",  // 1.5rem
    4: "32px",  // 2rem
    5: "40px",  // 2.5rem
    6: "48px",  // 3rem
    7: "56px",  // 3.5rem
    8: "64px",  // 4rem
    9: "72px",  // 4.5rem
    10: "84px",
    11: "88px",
    12: "96px", // 6rem
    13: "104px",
    14: "112px",// 7rem
  },

  // Corner radii from Figma.
  // CONFIRMED in-repo (figma_full_inventory.json): 5, 8, 16, 24, 32, 50(+2 section).
  // button 12 / drawer 20 / modal 24: sourced from live Figma nodes
  // (27:11866, 139:12348), absent from in-repo inventory — re-verify on next live pull.
  // bar 32: Frame 7 wide bars (1123x85, 11 instances, e.g. 186:2).
  radii: {
    sm: "5px",
    md: "8px",
    button: "12px", // Button Master (27:11866) — live-sourced, unconfirmed locally
    card: "16px",   // Card Master (115:2435) — CONFIRMED (5 instances)
    input: "16px",  // Form Inputs (91:17109)
    badge: "16px",  // Filter Chips (31:3483) — CONFIRMED (2 instances)
    drawer: "20px", // Mobile Navigation (139:12348) — live-sourced, unconfirmed locally
    modal: "24px", // live-sourced, unconfirmed locally (24 seen on Container frames)
    bar: "32px", // Frame 7 bars — CONFIRMED (11 instances)
    full: "9999px", // Pill Buttons & Badges
  },

  // Drop shadows from Figma Effects
  shadows: {
    subtle: "0px 2px 12px 0px rgba(0, 0, 0, 0.06)",
    card: "0px 4px 12px 0px rgba(0, 0, 0, 0.04)",
    cardHover: "9px 12px 57px 0px rgba(197, 71, 22, 0.8)",
    nav: "0px 4px 12px 0px rgba(0, 0, 0, 0.10)",
    dropdown: "0px 4px 30px 0px rgba(0, 0, 0, 0.25)",
    glow: "0px 4px 35px 0px rgba(198, 72, 23, 0.40)",
  },

  // Typography scale from Figma TEXT styles
  typography: {
    fonts: {
      sans: "Cairo, sans-serif",
      calligraphic: "Aref Ruqaa, Qahwa Arabic, serif",
      mono: "DM Mono, monospace",
      system: "SF Pro, -apple-system, BlinkMacSystemFont, Inter, sans-serif",
    },
    scale: {
      display: { size: "64px", lineHeight: "93px", weight: 700 },
      h1: { size: "48px", lineHeight: "91.5px", weight: 700 },
      h2: { size: "31px", lineHeight: "46.5px", weight: 700 },
      h3: { size: "20px", lineHeight: "30.4px", weight: 700 },
      bodyLg: { size: "20px", lineHeight: "30.4px", weight: 500 },
      body: { size: "16px", lineHeight: "24px", weight: 400 },
      bodyBold: { size: "16px", lineHeight: "24px", weight: 700 },
      bodySm: { size: "14px", lineHeight: "20px", weight: 400 },
      caption: { size: "12px", lineHeight: "16px", weight: 400 },
      badge: { size: "12.28px", lineHeight: "13.92px", weight: 700, letterSpacing: "1.11px" },
      micro: { size: "10px", lineHeight: "15px", weight: 400 },
    },
  },

  // Layout & Container Grid from Figma "gride and space"
  containers: {
    desktop: {
      maxWidth: "1280px",
      columns: 12,
      gutter: "32px",
      offset: "70px",
    },
    mobile: {
      maxWidth: "390px",
      columns: 4,
      gutter: "24px",
      offset: "20px",
    },
  },
} as const;

export type FigmaTokens = typeof FIGMA_TOKENS;

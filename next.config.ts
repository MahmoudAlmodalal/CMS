import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Uploads travel through Server Actions, whose body defaults to 1 MB — so
    // every image over ~1 MB died at the action boundary with React error #441
    // ("An error occurred in the Server Components render") before any of our
    // code ran. 50 MB matches VIDEO_MAX_BYTES, the largest thing the storage
    // layer accepts. NOTE: a Vercel serverless function still caps the request
    // body at ~4.5 MB, so files above that need a direct-to-storage signed
    // upload; this setting is what unblocks everything below it.
    serverActions: { bodySizeLimit: "50mb" },
  },
  images: {
    remotePatterns: [
      // YouTube poster frames for the artist works section.
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cms-drab-eight.vercel.app",
        pathname: "/assets/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // The default 75 visibly softens the portrait and cover photography the design
    // leads with; 90 is the quality those images are served at.
    qualities: [75, 90],
  },
};

export default withNextIntl(nextConfig);

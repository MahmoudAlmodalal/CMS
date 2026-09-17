"use client";

import React, { useState } from "react";
import Image from "next/image";
import { repairLegacyMediaUrl, resolveMediaUrl, type StorageBucket } from "@/lib/storage";
import { SpotifyVinylDisc } from "./SpotifyVinylDisc";

export interface SafeImageProps {
  src?: string | null;
  /**
   * The bucket a bare storage key belongs to. Required to resolve a value that
   * is a key rather than a full URL: `portraits/<id>/x.jpg` is only reachable at
   * `…/object/public/artists/portraits/<id>/x.jpg`, and the bucket segment
   * cannot be guessed from the key. Callers that always store absolute URLs can
   * omit it. See MEDIA_REFERENCES in @/lib/storage for the column→bucket map.
   */
  bucket?: StorageBucket;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // e.g. "3/4", "16/9", "1/1", "4/3"
  priority?: boolean;
  loading?: "lazy" | "eager";
  sizes?: string;
  quality?: number;
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
  fallbackTestId?: string;
  audioUrl?: string | null;
}

const VIDEO_PAGE_HOSTS = ["youtube.com", "youtu.be", "youtube-nocookie.com", "vimeo.com"];

function isVideoPageUrl(val: string): boolean {
  try {
    const host = new URL(val).hostname.toLowerCase().replace(/^(www|m|music)\./, "");
    return VIDEO_PAGE_HOSTS.includes(host);
  } catch {
    return false;
  }
}

/**
 * Normalizes media URLs: absolute https/http, protocol-relative (//),
 * storage CDN paths, and relative /uploads/... or /assets/...
 */
export function normalizeMediaUrl(
  url: string | null | undefined,
  bucket?: StorageBucket,
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isVideoPageUrl(trimmed)) return null;

  // Blob URLs that may have expired or data URLs
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Protocol relative
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // Absolute URLs — repaired if they carry the wrong host (see storage.ts).
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return repairLegacyMediaUrl(trimmed);
  }

  // If relative path starts with /, keep it if in public or prefix storage base
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Stored path without host or leading slash (e.g. "portraits/<id>/x.jpg").
  // With a bucket, resolveMediaUrl inserts the bucket segment the CDN needs;
  // without one we can only join the base, which is a 404 unless the stored key
  // already happens to start with its bucket name.
  if (bucket) {
    return resolveMediaUrl(bucket, trimmed);
  }

  const direct = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
  if (direct) {
    return `${direct.replace(/\/+$/, "")}/${trimmed}`;
  }
  const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (project) {
    return `${project.replace(/\/+$/, "")}/storage/v1/object/public/${trimmed}`;
  }

  return `/${trimmed}`;
}

/**
 * SafeImage Component
 * Enforces resilient CMS image loading:
 * - Never breaks the UI or renders native broken image icons.
 * - Handles empty, whitespace, 404, corrupt URLs with Andalusia cream/brown gradient fallback.
 * - Enforces object-fit: cover and rounded wrapper overflow: hidden.
 * - Supports decorative fallback or initial letter / geometric mark.
 */
export function SafeImage({
  src,
  bucket,
  alt,
  fill = true,
  width,
  height,
  className = "object-cover",
  containerClassName = "",
  aspectRatio,
  priority = false,
  loading,
  sizes,
  quality = 90,
  fallbackText,
  fallbackIcon,
  fallbackTestId,
  audioUrl,
}: SafeImageProps) {
  const normalizedSrc = normalizeMediaUrl(src, bucket);
  const [hasError, setHasError] = useState(!normalizedSrc);

  const initialChar = fallbackText?.trim() ? fallbackText.trim().charAt(0) : "";

  // Render branded fallback container
  const renderFallback = () => {
    if (fallbackIcon || initialChar) {
      return (
        <div
          data-testid={fallbackTestId}
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2B1D14] to-[#1F0900] text-brand-surface selection:bg-transparent"
          aria-label={alt ? alt : undefined}
          role={alt ? "img" : undefined}
          aria-hidden={alt ? undefined : true}
        >
          <div className="relative flex flex-col items-center justify-center text-center p-2">
            {fallbackIcon ? (
              fallbackIcon
            ) : (
              <span className="font-display font-bold text-2xl sm:text-3xl text-primary-500 select-none">
                {initialChar}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <SpotifyVinylDisc
        alt={alt}
        audioUrl={audioUrl}
        testId={fallbackTestId}
      />
    );
  };

  const containerStyles: React.CSSProperties = aspectRatio
    ? { aspectRatio }
    : {};

  const effectiveLoading = priority ? "eager" : loading || "lazy";

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${containerClassName}`}
      style={containerStyles}
    >
      {!hasError && normalizedSrc ? (
        fill ? (
          <Image
            src={normalizedSrc}
            alt={alt || ""}
            fill
            sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
            quality={quality}
            loading={effectiveLoading}
            priority={priority}
            onError={() => setHasError(true)}
            className={`motion-image w-full h-full object-cover object-center ${className}`}
          />
        ) : (
          <Image
            src={normalizedSrc}
            alt={alt || ""}
            width={width || 400}
            height={height || 300}
            sizes={sizes}
            quality={quality}
            loading={effectiveLoading}
            priority={priority}
            onError={() => setHasError(true)}
            className={`motion-image w-full h-full object-cover object-center ${className}`}
          />
        )
      ) : (
        renderFallback()
      )}
    </div>
  );
}

export default SafeImage;

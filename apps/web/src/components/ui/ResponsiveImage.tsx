"use client";

import { getOptimizedResponsiveImageUrl } from "@/utils/assetUtils";
import type React from "react";

const DEFAULT_WIDTHS = [640, 1080, 1600, 2560];

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  quality?: number;
  widths?: number[];
  fallbackWidth?: number;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  quality = 80,
  widths = DEFAULT_WIDTHS,
  fallbackWidth,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw",
  loading = "lazy",
  decoding,
  ...rest
}) => {
  const effectiveDecoding = decoding ?? (loading === "eager" ? "auto" : "async");
  const normalizedWidths = Array.from(new Set(widths)).sort((a, b) => a - b);
  const buildUrl = (width: number) => getOptimizedResponsiveImageUrl(src, { width, quality });

  const variants = normalizedWidths.map((width) => ({ width, url: buildUrl(width) }));
  const uniqueUrls = new Set(variants.map((v) => v.url));
  const fallbackTarget = fallbackWidth ?? 1600;
  const fallbackVariant =
    variants.find((v) => v.width >= fallbackTarget) ?? variants[variants.length - 1];
  const fallbackSrc = fallbackVariant?.url ?? src;
  const srcSet =
    uniqueUrls.size > 1 ? variants.map((v) => `${v.url} ${v.width}w`).join(", ") : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    // biome-ignore lint/a11y/useAltText: alt is a required prop enforced by the interface
    <img
      src={fallbackSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding={effectiveDecoding as "auto" | "async" | "sync"}
      {...rest}
    />
  );
};

export default ResponsiveImage;

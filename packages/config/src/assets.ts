export interface BunnyImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string | false;
}

// Accepts native bunny domain or custom proxy domains
const BUNNY_HOST_PATTERN = /(b-cdn\.net|bunnycdn\.com|thecolonelsacademy\.com)$/i;

const withBunnyImageParams = (urlValue: string, options: BunnyImageOptions = {}): string => {
  try {
    const url = new URL(urlValue);
    if (!BUNNY_HOST_PATTERN.test(url.hostname)) return urlValue;

    if (options.width) url.searchParams.set("width", String(options.width));
    if (options.height) url.searchParams.set("height", String(options.height));
    if (options.quality) url.searchParams.set("quality", String(options.quality));

    const fmt =
      options.format === false
        ? undefined
        : (options.format ?? (options.width ? "webp" : undefined));
    if (fmt) url.searchParams.set("format", fmt);

    return url.toString();
  } catch {
    return urlValue;
  }
};

export const getAssetUrl = (path: string, baseCdnUrl?: string): string => {
  // Support explicitly passed URL or fallback to environment prefixes
  const cdnUrl =
    baseCdnUrl ||
    process.env.BUNNY_CDN_URL ||
    process.env.NEXT_PUBLIC_BUNNY_CDN_URL ||
    process.env.EXPO_PUBLIC_BUNNY_CDN_URL;
  if (!cdnUrl) return path;

  // Normalize absolute Bunny URLs: extract the path and re-apply the configured CDN.
  // This handles stale absolute URLs in contract fallback data pointing at old pull zones.
  let resolvedPath = path;
  if (path.startsWith("http")) {
    try {
      const parsed = new URL(path);
      if (BUNNY_HOST_PATTERN.test(parsed.hostname)) {
        resolvedPath = parsed.pathname;
      } else {
        return path; // Non-Bunny absolute URL — leave it alone
      }
    } catch {
      return path;
    }
  }

  if (!resolvedPath.startsWith("/images/")) return path;

  const cleanCdn = cdnUrl.endsWith("/") ? cdnUrl.slice(0, -1) : cdnUrl;
  return `${cleanCdn}${resolvedPath}`;
};

export const getOptimizedAssetUrl = (
  path: string,
  options: BunnyImageOptions = {},
  baseCdnUrl?: string
): string => {
  return withBunnyImageParams(getAssetUrl(path, baseCdnUrl), options);
};

export const getOptimizedImageUrl = (url: string, options: BunnyImageOptions = {}): string => {
  return withBunnyImageParams(url, options);
};

export const getOptimizedResponsiveImageUrl = (
  src: string,
  options: BunnyImageOptions = {},
  baseCdnUrl?: string
): string => {
  return src.startsWith("/")
    ? getOptimizedAssetUrl(src, options, baseCdnUrl)
    : getOptimizedImageUrl(src, options);
};

interface BunnyImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string | false;
}

const BUNNY_HOST_PATTERN = /(b-cdn\.net|bunnycdn\.com)$/i;

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

export const getAssetUrl = (path: string): string => {
  const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
  if (!cdnUrl || !path.startsWith("/images/")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const cleanCdn = cdnUrl.endsWith("/") ? cdnUrl.slice(0, -1) : cdnUrl;
  return `${cleanCdn}/${cleanPath}`;
};

export const getOptimizedAssetUrl = (path: string, options: BunnyImageOptions = {}): string => {
  return withBunnyImageParams(getAssetUrl(path), options);
};

export const getOptimizedImageUrl = (url: string, options: BunnyImageOptions = {}): string => {
  return withBunnyImageParams(url, options);
};

export const getOptimizedResponsiveImageUrl = (
  src: string,
  options: BunnyImageOptions = {}
): string => {
  return src.startsWith("/")
    ? getOptimizedAssetUrl(src, options)
    : getOptimizedImageUrl(src, options);
};

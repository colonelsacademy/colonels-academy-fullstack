'use client';

import { useState, useCallback } from 'react';
import ResponsiveImage from './ResponsiveImage';
import Skeleton from './Skeleton';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  quality?: number;
  sizes?: string;
  widths?: number[];
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  skeletonClassName?: string;
}

const ImageWithSkeleton = ({
  src,
  alt,
  className = '',
  quality,
  sizes,
  widths,
  loading = 'lazy',
  fetchPriority = 'auto',
  skeletonClassName,
}: ImageWithSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => { setHasError(true); setIsLoaded(true); }, []);

  const isEager = loading === 'eager';
  const visibilityClass = isEager
    ? ''
    : `transition-opacity duration-150 ${isLoaded ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <Skeleton className={`absolute inset-0 ${skeletonClassName ?? ''}`} />
      )}

      {!hasError && (
        <ResponsiveImage
          src={src}
          alt={alt}
          {...(quality !== undefined && { quality })}
          {...(sizes !== undefined && { sizes })}
          {...(widths !== undefined && { widths })}
          loading={loading}
          fetchPriority={fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
          className={`${visibilityClass} ${className}`}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <span className="text-xs text-gray-400 font-medium">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithSkeleton;

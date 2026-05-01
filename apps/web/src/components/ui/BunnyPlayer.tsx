"use client";

import type { BunnyPlaybackResponse } from "@colonels-academy/contracts";
import { useEffect, useState } from "react";
import Skeleton from "./Skeleton";

interface BunnyPlayerProps {
  bunnyVideoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

export default function BunnyPlayer({
  bunnyVideoId,
  title = "Video player",
  className = "",
  autoplay = false
}: BunnyPlayerProps) {
  const [playback, setPlayback] = useState<BunnyPlaybackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPlayback() {
      try {
        const res = await fetch(`/api/media/video/${bunnyVideoId}`);
        if (!res.ok) throw new Error(`Failed to load video (${res.status})`);
        const data: BunnyPlaybackResponse = await res.json();
        if (!cancelled) setPlayback(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load video.");
      }
    }

    fetchPlayback();
    return () => {
      cancelled = true;
    };
  }, [bunnyVideoId]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    );
  }

  if (!playback?.embedUrl) {
    return <Skeleton className={`rounded-xl ${className}`} />;
  }

  const embedSrc = autoplay ? `${playback.embedUrl}?autoplay=true` : playback.embedUrl;

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`}>
      <iframe
        src={embedSrc}
        title={title}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

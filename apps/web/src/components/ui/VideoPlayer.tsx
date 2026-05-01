"use client";

import { Play } from "lucide-react";
import { memo, useRef, useState } from "react";

interface VideoPlayerProps {
  videoId?: string | undefined;
  poster?: string | undefined;
  autoplay?: boolean | undefined;
  className?: string | undefined;
}

const BUNNY_LIBRARY_ID = "596237";
const _BUNNY_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE ?? "";

// ─── Thumbnail Overlay ────────────────────────────────────────────────────────
const ThumbnailOverlay = ({
  poster,
  onPlay
}: { poster?: string | undefined; onPlay: () => void }) => (
  <button
    type="button"
    className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform duration-700 z-10 w-full h-full p-0 border-0 bg-transparent"
    onClick={onPlay}
    aria-label="Play video"
  >
    <div className="w-full h-full relative">
      <img
        src={
          poster ??
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600"
        }
        alt="Video Poster"
        className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        loading="eager"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-[#D4AF37]/90 rounded-full flex items-center justify-center pl-2 hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm shadow-xl hover:shadow-[#D4AF37]/50 group-hover:bg-[#D4AF37]">
          <Play className="w-8 h-8 text-[#0B1120] fill-current" />
        </div>
      </div>
    </div>
  </button>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const VideoSkeleton = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-30">
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center animate-pulse">
          <Play className="w-10 h-10 text-[#D4AF37]/60" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 animate-ping" />
      </div>
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-[#D4AF37]/40 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// ─── Main VideoPlayer ─────────────────────────────────────────────────────────
const VideoPlayer = memo(({ videoId, poster, autoplay = false, className }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isLoading, setIsLoading] = useState(true);
  const [prevVideoId, setPrevVideoId] = useState(videoId);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (videoId !== prevVideoId) {
    setPrevVideoId(videoId);
    setIsPlaying(autoplay);
    setIsLoading(true);
  }

  const handleStartPlayback = () => {
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const isBunny =
    videoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoId);
  const isYouTube = videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  const isDirectUrl = videoId && (/^https?:\/\//.test(videoId) || videoId.startsWith("/"));

  // Bunny Stream
  if (isBunny && videoId && BUNNY_LIBRARY_ID) {
    const iframeUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=${isPlaying}&loop=false&muted=false&preload=true&responsive=true`;
    return (
      <div
        className={`relative w-full aspect-video bg-black overflow-hidden group ${className ?? "rounded-xl shadow-2xl"}`}
      >
        {!isPlaying ? (
          <ThumbnailOverlay poster={poster} onPlay={handleStartPlayback} />
        ) : (
          <>
            {isLoading && <VideoSkeleton />}
            <iframe
              ref={iframeRef}
              key={videoId}
              src={iframeUrl}
              loading="eager"
              title="Course Video"
              className="w-full h-full border-0 absolute top-0 left-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          </>
        )}
      </div>
    );
  }

  // YouTube
  if (isYouTube && videoId) {
    return (
      <div
        className={`relative w-full aspect-video bg-black overflow-hidden group ${className ?? "rounded-xl shadow-2xl"}`}
      >
        {!isPlaying ? (
          <ThumbnailOverlay poster={poster} onPlay={handleStartPlayback} />
        ) : (
          <>
            {isLoading && <VideoSkeleton />}
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
              title="Course Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          </>
        )}
      </div>
    );
  }

  // Direct URL
  if (isDirectUrl && videoId) {
    return (
      <div
        className={`relative w-full aspect-video bg-black overflow-hidden ${className ?? "rounded-xl shadow-2xl"}`}
      >
        <video src={videoId} poster={poster} className="w-full h-full" controls autoPlay={autoplay}>
          <track kind="captions" />
        </video>
      </div>
    );
  }

  // Fallback
  return (
    <div
      className={`relative w-full aspect-video bg-black overflow-hidden group ${className ?? "rounded-xl shadow-2xl"}`}
    >
      <ThumbnailOverlay poster={poster} onPlay={() => {}} />
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;

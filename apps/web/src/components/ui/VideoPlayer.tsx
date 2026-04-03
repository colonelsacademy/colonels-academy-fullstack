"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Maximize, Pause, Play, Settings, Volume2, VolumeX } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoId?: string | undefined;
  poster?: string | undefined;
  autoplay?: boolean | undefined;
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

// ─── Loading Spinner ──────────────────────────────────────────────────────────
const _LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-transparent z-20 pointer-events-none backdrop-blur-sm">
    <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
  </div>
);

// ─── Countdown Intro ──────────────────────────────────────────────────────────
const CountdownIntro = ({ onFinish }: { onFinish: () => void }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(onFinish, 800);
    return () => clearTimeout(timer);
  }, [count, onFinish]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-7xl font-black text-[#D4AF37] italic uppercase tracking-tighter">
            {count > 0 ? count : "Go"}
          </span>
          <div className="text-[#D4AF37]/50 text-xs mt-1 uppercase tracking-widest font-medium">
            {count > 0 ? "Session Starting" : "Let's Learn"}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Main VideoPlayer ─────────────────────────────────────────────────────────
const VideoPlayer = memo(({ videoId, poster, autoplay = false }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [prevVideoId, setPrevVideoId] = useState(videoId);

  if (videoId !== prevVideoId) {
    setPrevVideoId(videoId);
    setIsPlaying(autoplay);
    setIsCountingDown(false);
  }

  const handleStartPlayback = () => {
    setIsPlaying(true);
    setIsCountingDown(true);
  };

  const isBunny =
    videoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoId);
  const isYouTube = videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  const isDirectUrl = videoId && (/^https?:\/\//.test(videoId) || videoId.startsWith("/"));

  // Bunny Stream
  if (isBunny && videoId && BUNNY_LIBRARY_ID) {
    const iframeUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=${isPlaying}&loop=false&muted=false&preload=true&responsive=true`;
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
        {!isPlaying ? (
          <ThumbnailOverlay poster={poster} onPlay={handleStartPlayback} />
        ) : (
          <>
            <iframe
              src={iframeUrl}
              loading="eager"
              title="Course Video"
              className="w-full h-full border-0 absolute top-0 left-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
            {isCountingDown && <CountdownIntro onFinish={() => setIsCountingDown(false)} />}
          </>
        )}
      </div>
    );
  }

  // YouTube
  if (isYouTube && videoId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
        {!isPlaying ? (
          <ThumbnailOverlay poster={poster} onPlay={handleStartPlayback} />
        ) : (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
              title="Course Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {isCountingDown && <CountdownIntro onFinish={() => setIsCountingDown(false)} />}
          </>
        )}
      </div>
    );
  }

  // Direct URL
  if (isDirectUrl && videoId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        <video src={videoId} poster={poster} className="w-full h-full" controls autoPlay={autoplay}>
          <track kind="captions" />
        </video>
      </div>
    );
  }

  // Fallback - just show thumbnail
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
      <ThumbnailOverlay poster={poster} onPlay={() => {}} />
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;

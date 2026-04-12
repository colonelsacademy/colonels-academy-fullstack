"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { LessonContent, LessonContentBlock } from "@colonels-academy/contracts";

type TextLessonStageProps = {
  title: string;
  courseTitle: string;
  content: LessonContent;
};

const BASE_SCROLL_PX_PER_SECOND = 28;
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;
const CUE_SEGMENT_GAP_PX = 24;

function getCueSegmentClassName(text: string) {
  if (text.endsWith(":")) {
    return "font-['Rajdhani'] text-[clamp(1.45rem,1.1rem+1.2vw,2.35rem)] font-bold tracking-[0.04em] text-slate-950";
  }

  return "text-[clamp(1.05rem,0.78rem+1.05vw,1.9rem)] leading-[1.48] text-slate-700";
}

function renderBlock(block: LessonContentBlock, index: number) {
  switch (block.type) {
    case "heading":
      return (
        <h3
          key={`${block.type}-${index}`}
          className="font-['Rajdhani'] text-2xl font-bold text-slate-950 md:text-3xl"
        >
          {block.text}
        </h3>
      );
    case "bulletList":
      return (
        <ul
          key={`${block.type}-${index}`}
          className="grid gap-3 text-base leading-7 text-slate-800 md:grid-cols-2 md:text-lg"
        >
          {block.items.map((item: string) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p
          key={`${block.type}-${index}`}
          className="text-[clamp(1.05rem,0.8rem+0.9vw,1.7rem)] leading-[1.55] text-slate-800"
        >
          {block.text}
        </p>
      );
  }
}

export default function TextLessonStage({ title, courseTitle, content }: TextLessonStageProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const cueViewportRef = useRef<HTMLDivElement | null>(null);
  const cueMeasureItemRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const cueElapsedRef = useRef(0);
  const [cueElapsedMs, setCueElapsedMs] = useState(0);
  const [cuePages, setCuePages] = useState<number[][]>([]);

  useEffect(() => {
    function measure() {
      if (content.mode !== "reading") {
        return;
      }

      const viewport = viewportRef.current;
      const innerContent = contentRef.current;

      if (!viewport || !innerContent) {
        return;
      }

      const nextMaxOffset = Math.max(innerContent.scrollHeight - viewport.clientHeight, 0);
      setMaxOffset(nextMaxOffset);
      setOffset((current) => {
        const clamped = Math.min(current, nextMaxOffset);
        offsetRef.current = clamped;
        return clamped;
      });
    }

    const measureFrame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(measureFrame);
      window.removeEventListener("resize", measure);
    };
  }, [content]);

  useEffect(() => {
    function measureCuePages() {
      if (content.mode !== "cue") {
        return;
      }

      const viewport = cueViewportRef.current;
      if (!viewport) {
        return;
      }

      const availableHeight = viewport.clientHeight;
      if (availableHeight <= 0) {
        return;
      }

      const nextPages: number[][] = [];
      let currentPage: number[] = [];
      let currentHeight = 0;

      for (let index = 0; index < content.segments.length; index += 1) {
        const segmentElement = cueMeasureItemRefs.current[index];
        if (!segmentElement) {
          continue;
        }

        const segmentHeight = segmentElement.getBoundingClientRect().height;
        const nextHeight =
          currentPage.length === 0
            ? segmentHeight
            : currentHeight + CUE_SEGMENT_GAP_PX + segmentHeight;

        if (currentPage.length > 0 && nextHeight > availableHeight) {
          nextPages.push(currentPage);
          currentPage = [index];
          currentHeight = segmentHeight;
          continue;
        }

        currentPage.push(index);
        currentHeight = nextHeight;
      }

      if (currentPage.length > 0) {
        nextPages.push(currentPage);
      }

      setCuePages(nextPages);
    }

    const measureFrame = window.requestAnimationFrame(measureCuePages);
    window.addEventListener("resize", measureCuePages);

    return () => {
      window.cancelAnimationFrame(measureFrame);
      window.removeEventListener("resize", measureCuePages);
    };
  }, [content]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: content is a trigger — resets playback state when lesson content changes
  useEffect(() => {
    setOffset(0);
    offsetRef.current = 0;
    setIsPlaying(false);
    lastTimestampRef.current = null;
    cueElapsedRef.current = 0;
    setCueElapsedMs(0);
    setCuePages([]);
  }, [content]);

  useEffect(() => {
    if (!isPlaying) {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const previousTimestamp = lastTimestampRef.current ?? timestamp;
      const deltaSeconds = (timestamp - previousTimestamp) / 1000;
      lastTimestampRef.current = timestamp;

      if (content.mode === "reading") {
        const nextOffset = Math.min(
          offsetRef.current + deltaSeconds * BASE_SCROLL_PX_PER_SECOND * speed,
          maxOffset
        );

        offsetRef.current = nextOffset;
        setOffset(nextOffset);

        if (nextOffset >= maxOffset) {
          setIsPlaying(false);
          return;
        }
      } else {
        const totalDurationMs = content.segments.reduce(
          (sum, segment) => sum + segment.durationMs,
          0
        );
        const nextElapsedMs = Math.min(
          cueElapsedRef.current + deltaSeconds * 1000 * speed,
          totalDurationMs
        );
        cueElapsedRef.current = nextElapsedMs;
        setCueElapsedMs(nextElapsedMs);

        if (nextElapsedMs >= totalDurationMs) {
          setIsPlaying(false);
          return;
        }
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [content, isPlaying, maxOffset, speed]);

  const totalCueDurationMs =
    content.mode === "cue"
      ? content.segments.reduce((sum, segment) => sum + segment.durationMs, 0)
      : 0;
  const progressPercent =
    content.mode === "reading"
      ? maxOffset > 0
        ? (offset / maxOffset) * 100
        : 0
      : totalCueDurationMs > 0
        ? (cueElapsedMs / totalCueDurationMs) * 100
        : 0;

  let activeCueIndex = 0;
  if (content.mode === "cue") {
    let runningTotal = 0;
    for (let index = 0; index < content.segments.length; index += 1) {
      const segment = content.segments[index]!;
      runningTotal += segment.durationMs;
      if (cueElapsedMs < runningTotal) {
        activeCueIndex = index;
        break;
      }
      activeCueIndex = Math.min(index, content.segments.length - 1);
    }
  }

  const activeCuePageIndex =
    content.mode === "cue"
      ? Math.max(
          cuePages.findIndex((page) => page.includes(activeCueIndex)),
          0
        )
      : 0;
  const visibleCueIndices =
    content.mode === "cue"
      ? (cuePages[activeCuePageIndex] ?? content.segments.map((_, index) => index)).filter(
          (index) => index <= activeCueIndex
        )
      : [];

  const resetPlayback = () => {
    setIsPlaying(false);
    setOffset(0);
    offsetRef.current = 0;
    cueElapsedRef.current = 0;
    setCueElapsedMs(0);
  };

  const handlePlay = () => {
    if (content.mode === "reading") {
      if (offset >= maxOffset && maxOffset > 0) {
        setOffset(0);
        offsetRef.current = 0;
      }
    } else if (cueElapsedMs >= totalCueDurationMs && totalCueDurationMs > 0) {
      cueElapsedRef.current = 0;
      setCueElapsedMs(0);
    }
    setIsPlaying(true);
  };

  return (
    <div className="aspect-video w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f8f8f6_56%,_#eef3f7_100%)]">
      <div className="flex h-full flex-col">
        <div className="border-b-4 border-sky-400 px-8 pb-4 pt-8 md:px-14 md:pb-5 md:pt-10">
          <h2 className="font-['Rajdhani'] text-[clamp(2.4rem,1.6rem+3vw,5.1rem)] font-bold leading-none tracking-[0.03em] text-slate-950">
            {title}
          </h2>
        </div>

        <div className="relative flex-1 overflow-hidden px-8 py-8 md:px-14 md:py-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#f8f8f6] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-[#f8f8f6] to-transparent" />

          {!isPlaying ? (
            <button
              type="button"
              onClick={handlePlay}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 transition hover:bg-black/10"
              aria-label={offset > 0 ? "Resume text playback" : "Start text playback"}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#16161f] text-white shadow-xl transition hover:scale-105">
                <Play className="ml-1 h-10 w-10 fill-current" />
              </div>
            </button>
          ) : null}

          {content.mode === "reading" ? (
            <div ref={viewportRef} className="relative h-full overflow-hidden">
              <div
                ref={contentRef}
                className="space-y-6 will-change-transform md:space-y-7"
                style={{ transform: `translateY(-${offset}px)` }}
              >
                {content.blocks.map((block, index) => renderBlock(block, index))}
              </div>
            </div>
          ) : (
            <div ref={cueViewportRef} className="relative h-full">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-0"
              >
                <div className="mx-auto flex max-w-[72rem] flex-col gap-6 px-2">
                  {content.segments.map((segment, index) => (
                    <p
                      key={`measure-${segment.text}`}
                      ref={(element) => {
                        cueMeasureItemRefs.current[index] = element;
                      }}
                      className={getCueSegmentClassName(segment.text)}
                    >
                      {segment.text}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex h-full items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`page-${activeCuePageIndex}`}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="mx-auto w-full max-w-[72rem] px-2"
                  >
                    <div className="relative overflow-hidden rounded-[1.75rem] bg-white/58 px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-[2px] md:px-8 md:py-8">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
                      <div className="flex flex-col gap-6">
                        {visibleCueIndices.map((index) => {
                          const segment = content.segments[index];
                          if (!segment) {
                            return null;
                          }

                          return (
                            <motion.p
                              key={`${activeCuePageIndex}-${index}`}
                              initial={{ opacity: 0, y: 18 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className={getCueSegmentClassName(segment.text)}
                            >
                              {segment.text}
                            </motion.p>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="border-t-4 border-sky-400 bg-white/80 px-6 py-3 backdrop-blur-sm md:px-10">
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-500 transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false);
                    return;
                  }
                  handlePlay();
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#16161f] text-white transition hover:bg-[#222230]"
                aria-label={isPlaying ? "Pause text playback" : "Play text playback"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={resetPlayback}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
                aria-label="Restart text playback"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Speed
                </span>
                <select
                  value={speed}
                  onChange={(event) =>
                    setSpeed(Number(event.target.value) as (typeof SPEED_OPTIONS)[number])
                  }
                  className="bg-transparent text-sm font-bold text-slate-800 outline-none"
                >
                  {SPEED_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}x
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="min-w-0 flex-1 md:max-w-sm">
              <input
                type="range"
                min={0}
                max={Math.max(content.mode === "reading" ? maxOffset : totalCueDurationMs, 1)}
                step={1}
                value={Math.min(
                  content.mode === "reading" ? offset : cueElapsedMs,
                  Math.max(content.mode === "reading" ? maxOffset : totalCueDurationMs, 1)
                )}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  if (content.mode === "reading") {
                    setOffset(nextValue);
                    offsetRef.current = nextValue;
                  } else {
                    cueElapsedRef.current = nextValue;
                    setCueElapsedMs(nextValue);
                  }
                }}
                className="w-full accent-sky-500"
                aria-label="Text playback progress"
              />
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 md:text-xs">
                {courseTitle}
              </p>
              <p className="mt-1 font-['Rajdhani'] text-lg font-bold text-slate-950 md:text-2xl">
                {title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

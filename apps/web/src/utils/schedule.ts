interface ScheduleWhenIdleOptions {
  timeout?: number;
  fallbackDelayMs?: number;
}

type IdleDeadlineLike = { didTimeout: boolean; timeRemaining: () => number };
type IdleCallback = (deadline: IdleDeadlineLike) => void;
type WindowWithIdleCallback = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: IdleCallback, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

export const scheduleWhenIdle = (
  task: () => void,
  { timeout = 1500, fallbackDelayMs = 180 }: ScheduleWhenIdleOptions = {}
) => {
  if (typeof window === "undefined") {
    task();
    return () => {};
  }

  const runtimeWindow = window as WindowWithIdleCallback;

  if (typeof runtimeWindow.requestIdleCallback === "function") {
    const handle = runtimeWindow.requestIdleCallback(() => task(), { timeout });
    return () => runtimeWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(task, fallbackDelayMs);
  return () => window.clearTimeout(handle);
};

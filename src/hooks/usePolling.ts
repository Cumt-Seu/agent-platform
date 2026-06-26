// 通用轮询 Hook

import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval: number; // 轮询间隔 ms
  enabled?: boolean;
  immediate?: boolean; // 是否立即执行一次
}

export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions
) {
  const { interval, enabled = true, immediate = false } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);
  }, [interval]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      if (immediate) {
        callbackRef.current();
      }
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop, immediate]);

  return { start, stop };
}

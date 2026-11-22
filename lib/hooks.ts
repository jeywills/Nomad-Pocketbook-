"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fetchRates, type Rates } from "./fx";

/** Live exchange rates; `rates` stays null until loaded or if the fetch fails. */
export function useLiveRates(enabled: boolean): { rates: Rates | null; failed: boolean } {
  const [state, setState] = useState<{ rates: Rates | null; failed: boolean }>({
    rates: null,
    failed: false,
  });
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchRates()
      .then((rates) => !cancelled && setState({ rates, failed: false }))
      .catch(() => !cancelled && setState({ rates: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return state;
}

/* ---------- localStorage-backed state (SSR safe) ---------- */

const storeListeners = new Set<() => void>();

function subscribeStore(cb: () => void) {
  storeListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    storeListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Read a persisted value outside React (falls back if missing or unreadable). */
export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Write a persisted value outside React and refresh any component using it. */
export function writeStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  storeListeners.forEach((l) => l());
}

/**
 * Persisted state. `initial` must be a stable reference (define it outside
 * the component). Renders `initial` on the server and on first hydration.
 */
export function useStored<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const initialRaw = useMemo(() => JSON.stringify(initial), [initial]);

  const read = useCallback(() => {
    try {
      return localStorage.getItem(key) ?? initialRaw;
    } catch {
      return initialRaw;
    }
  }, [key, initialRaw]);

  const raw = useSyncExternalStore(subscribeStore, read, () => initialRaw);

  const value = useMemo(() => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  }, [raw, initial]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      let prev: T;
      try {
        prev = JSON.parse(read()) as T;
      } catch {
        prev = initial;
      }
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* storage unavailable */
      }
      storeListeners.forEach((l) => l());
    },
    [key, read, initial],
  );

  return [value, set];
}

/* ---------- a ticking clock (0 on the server) ---------- */

let nowValue = 0;
let nowTimer: ReturnType<typeof setInterval> | undefined;
const nowListeners = new Set<() => void>();

function subscribeNow(cb: () => void) {
  nowListeners.add(cb);
  if (!nowTimer) {
    nowValue = Date.now();
    nowTimer = setInterval(() => {
      nowValue = Date.now();
      nowListeners.forEach((l) => l());
    }, 15_000);
  }
  return () => {
    nowListeners.delete(cb);
    if (nowListeners.size === 0 && nowTimer) {
      clearInterval(nowTimer);
      nowTimer = undefined;
    }
  };
}

function getNow() {
  if (nowValue === 0) nowValue = Date.now();
  return nowValue;
}

/** Current time in ms, refreshed every 15s. Returns 0 during SSR. */
export function useNow(): number {
  return useSyncExternalStore(subscribeNow, getNow, () => 0);
}

/* ---------- the device's own time zone ---------- */

const noopSubscribe = () => () => {};

export function useBrowserTz(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "UTC",
  );
}

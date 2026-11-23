"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMonthly, type Monthly } from "./climate";
import type { Place } from "./places";

/** Loads the monthly climate for each place once, with a retry for failures. */
export function useClimate(places: Place[]) {
  const [data, setData] = useState<Record<string, Monthly>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const asked = useRef(new Set<string>());

  const load = useCallback((p: Place) => {
    asked.current.add(p.id);
    setFailed((f) => (f[p.id] ? { ...f, [p.id]: false } : f));
    fetchMonthly(p)
      .then((m) => setData((d) => ({ ...d, [p.id]: m })))
      .catch(() => {
        asked.current.delete(p.id);
        setFailed((f) => ({ ...f, [p.id]: true }));
      });
  }, []);

  useEffect(() => {
    for (const p of places) if (!asked.current.has(p.id)) load(p);
  }, [places, load]);

  return { data, failed, retry: load };
}

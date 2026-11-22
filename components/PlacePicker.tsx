"use client";

import { useRef, useState } from "react";
import { searchPlaces, type Place } from "@/lib/places";

type Props = {
  onPick: (place: Place) => void;
  placeholder?: string;
  /** Tap-to-add suggestions shown under the box. */
  quick?: Place[];
  disabled?: boolean;
};

export default function PlacePicker({
  onPick,
  placeholder = "Search any city…",
  quick = [],
  disabled = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestId = useRef(0);

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(timer.current);
    const id = ++requestId.current;
    if (value.trim().length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    timer.current = setTimeout(async () => {
      try {
        const found = await searchPlaces(value.trim());
        if (id !== requestId.current) return;
        setResults(found);
        setStatus(found.length ? "idle" : "empty");
      } catch {
        if (id === requestId.current) setStatus("error");
      }
    }, 300);
  }

  function pick(place: Place) {
    requestId.current++;
    clearTimeout(timer.current);
    onPick(place);
    setQuery("");
    setResults([]);
    setStatus("idle");
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={disabled ? "Limit reached: remove one first" : placeholder}
        autoComplete="off"
        autoCorrect="off"
        className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-ink placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"
      />

      {status === "loading" && <p className="mt-2 text-sm text-muted">Searching…</p>}
      {status === "empty" && <p className="mt-2 text-sm text-muted">No matches. Try another spelling.</p>}
      {status === "error" && (
        <p className="mt-2 text-sm text-warm">Search is unavailable right now. Check your connection.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-line bg-surface">
          {results.map((r) => (
            <li key={r.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => pick(r)}
                className="flex min-h-12 w-full flex-col items-start justify-center px-4 py-2 text-left active:bg-line/50"
              >
                <span className="font-medium">{r.name}</span>
                <span className="text-sm text-muted">{r.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {quick.length > 0 && !disabled && results.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {quick.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => pick(q)}
              className="min-h-9 rounded-full border border-line bg-surface px-3 text-sm text-ink active:bg-line/50"
            >
              + {q.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

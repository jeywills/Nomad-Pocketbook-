"use client";

import { useMemo, useState } from "react";
import { sovereignList } from "@/lib/countries";
import { visitedCodes, wishedCountryCodes, type GameState } from "@/lib/game";

/** A searchable list of all 195 countries. Also the keyboard and screen-reader way to use the map. */
export default function CountryList({
  game,
  onPick,
}: {
  game: GameState;
  onPick: (cc: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const all = useMemo(() => sovereignList(), []);
  const visited = visitedCodes(game);
  const wished = wishedCountryCodes(game);
  const q = query.trim().toLowerCase();
  const shown = q ? all.filter((c) => c.name.toLowerCase().includes(q)) : all;

  return (
    <div className="mt-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search countries…"
        aria-label="Search countries"
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-line bg-bg px-4 placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <ul className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-line bg-bg">
        {shown.map((c) => {
          const on = visited.has(c.cc);
          const wish = !on && wished.has(c.cc);
          return (
            <li key={c.cc} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => onPick(c.cc, c.name)}
                className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left active:bg-line/50"
              >
                <span>{c.name}</span>
                <span className={`text-sm font-semibold ${on ? "text-leaf" : wish ? "text-sky" : "text-muted"}`}>
                  {on ? "✓ Visited" : wish ? "♡ Wish list" : "Not yet"}
                </span>
              </button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-4 py-3 text-sm text-muted">No country matches that.</li>}
      </ul>
    </div>
  );
}

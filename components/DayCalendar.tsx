"use client";

import { useState } from "react";
import { countryName } from "@/lib/countries";
import { ccColor, fromDay, monthCells, type Stay } from "@/lib/days";

const WEEKDAYS = [
  ["M", "Monday"],
  ["T", "Tuesday"],
  ["W", "Wednesday"],
  ["T", "Thursday"],
  ["F", "Friday"],
  ["S", "Saturday"],
  ["S", "Sunday"],
] as const;

type Props = {
  stays: Stay[];
  /** Today as whole days since the epoch. */
  today: number;
  selectedIso: string;
  onSelect: (iso: string) => void;
};

/** One month at a time. Each day shows a coloured tag for every country you were in. */
export default function DayCalendar({ stays, today, selectedIso, onSelect }: Props) {
  const [ym, setYm] = useState(() => {
    const d = new Date(today * 86_400_000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });

  const cells = monthCells(ym.y, ym.m, stays, today);
  const todayIso = fromDay(today);
  const title = new Date(Date.UTC(ym.y, ym.m, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const shift = (n: number) =>
    setYm(({ y, m }) => {
      const t = y * 12 + m + n;
      return { y: Math.floor(t / 12), m: t % 12 };
    });

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="flex size-11 items-center justify-center rounded-xl border border-line text-lg"
        >
          ‹
        </button>
        <h3 className="font-display text-lg font-bold" aria-live="polite">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex size-11 items-center justify-center rounded-xl border border-line text-lg"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAYS.map(([short, long], i) => (
          <abbr key={i} title={long} className="text-center text-[11px] font-semibold text-muted no-underline">
            {short}
          </abbr>
        ))}
        {cells.map((c, i) =>
          c === null ? (
            <span key={`b${i}`} aria-hidden />
          ) : (
            <button
              key={c.iso}
              type="button"
              onClick={() => onSelect(c.iso)}
              aria-pressed={c.iso === selectedIso}
              aria-label={`${c.day} ${title}${c.ccs.length ? `: ${c.ccs.map(countryName).join(", ")}` : ""}${
                c.iso === todayIso ? " (today)" : ""
              }`}
              className={`flex min-h-14 flex-col items-center rounded-lg border px-0.5 py-1 ${
                c.iso === selectedIso ? "border-accent bg-accent/10" : "border-transparent bg-bg"
              } ${c.iso === todayIso ? "ring-2 ring-accent" : ""}`}
            >
              <span className="text-xs font-semibold">{c.day}</span>
              <span className="mt-0.5 flex w-full flex-col items-center gap-0.5">
                {c.ccs.slice(0, 2).map((cc) => (
                  <span
                    key={cc}
                    className="w-full rounded-[4px] py-px text-center text-[10px] leading-tight font-bold text-white"
                    style={{ background: ccColor(cc) }}
                  >
                    {cc}
                  </span>
                ))}
                {c.ccs.length > 2 && <span className="text-[10px] text-muted">+{c.ccs.length - 2}</span>}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

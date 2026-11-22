"use client";

import { useEffect } from "react";
import PageBanner from "@/components/PageBanner";
import PlacePicker from "@/components/PlacePicker";
import { CITIES } from "@/lib/costs";
import { DEFAULT_TIME_PLACES } from "@/lib/defaults";
import { trigger } from "@/lib/game";
import { useBrowserTz, useNow, useStored } from "@/lib/hooks";
import { toPlace, type Place } from "@/lib/places";
import {
  formatClock,
  formatOffset,
  localDayNumber,
  localHour,
  offsetMinutes,
  pad2,
  startOfLocalDay,
} from "@/lib/tz";

const MAX_OTHERS = 5;
const HOUR = 3_600_000;

/** Awards the "shared working window" quest once an overlap exists. */
function OverlapReward({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) trigger({ type: "once", id: "overlap" });
  }, [active]);
  return null;
}

const DEFAULT_HOME = null as Place | null;
const DEFAULT_WORK = { start: 9, end: 17 };

function dayLabel(diff: number): string {
  if (diff === 0) return "Same day";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `+${diff} days` : `${diff} days`;
}

function diffLabel(minutes: number): string {
  if (minutes === 0) return "Same time";
  const h = Math.abs(minutes) / 60;
  const text = Number.isInteger(h) ? String(h) : h.toFixed(1);
  return `${text}h ${minutes > 0 ? "ahead" : "behind"}`;
}

function ranges(flags: boolean[]): string[] {
  const out: string[] = [];
  let start = -1;
  flags.forEach((on, h) => {
    if (on && start === -1) start = h;
    if ((!on || h === flags.length - 1) && start !== -1) {
      const end = on ? h + 1 : h;
      out.push(`${pad2(start)}:00 to ${pad2(end % 24)}:00`);
      start = -1;
    }
  });
  return out;
}

export default function TimePage() {
  const now = useNow();
  const browserTz = useBrowserTz();
  const [home, setHome] = useStored<Place | null>("np.home", DEFAULT_HOME);
  const [others, setOthers] = useStored<Place[]>("np.time", DEFAULT_TIME_PLACES);
  const [work, setWork] = useStored("np.work", DEFAULT_WORK);

  const homePlace: Place = home ?? {
    id: "here",
    name: "Where you are",
    country: "From your device",
    lat: 0,
    lon: 0,
    tz: browserTz,
  };

  const addPlace = (p: Place) => {
    if (others.length >= MAX_OTHERS || others.some((x) => x.id === p.id)) return;
    setOthers((prev) => [...prev, toPlace(p)]);
  };

  const quick = CITIES.filter((c) => !others.some((p) => p.id === c.id)).slice(0, 12).map(toPlace);

  if (now === 0) {
    return (
      <div>
        <PageBanner tone="night" emoji="⏰" title="Time zones" subtitle="Loading your clocks…" />
        <div className="mt-5 h-40 animate-pulse rounded-3xl bg-line/60" />
      </div>
    );
  }

  const homeLabel = homePlace.id === "here" ? "your local" : homePlace.name;
  const everyone = [homePlace, ...others];
  const homeOffset = offsetMinutes(homePlace.tz, now);
  const dayStart = startOfLocalDay(homePlace.tz, now);
  const homeDay = localDayNumber(homePlace.tz, now);
  const currentHour = Math.floor(localHour(homePlace.tz, now));

  const inWork = (tz: string, h: number) => {
    const local = localHour(tz, dayStart + (h + 0.5) * HOUR);
    return local >= work.start && local < work.end;
  };
  const grid = everyone.map((p) => Array.from({ length: 24 }, (_, h) => inWork(p.tz, h)));
  const overlap = Array.from({ length: 24 }, (_, h) => grid.every((row) => row[h]));
  const overlapRanges = ranges(overlap);

  return (
    <div className="space-y-5">
      <OverlapReward active={others.length > 0 && overlapRanges.length > 0} />
      <PageBanner
        tone="night"
        emoji="⏰"
        title="Time zones"
        subtitle="Add the places your clients and team are based and see when you can all be at work."
      />

      <section className="card p-4" aria-label="Your base">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-accent uppercase">Your base</p>
            <p className="truncate text-lg font-semibold">{homePlace.name}</p>
            <p className="text-xs text-muted">
              {homePlace.tz} · {formatOffset(homeOffset)}
            </p>
          </div>
          <p className="text-3xl font-semibold tabular-nums">{formatClock(homePlace.tz, now)}</p>
        </div>
        <details className="mt-3">
          <summary className="min-h-10 cursor-pointer text-sm text-accent">Change base</summary>
          <div className="mt-2 space-y-2">
            <PlacePicker onPick={(p) => setHome(toPlace(p))} placeholder="Search your base city…" />
            {home && (
              <button type="button" onClick={() => setHome(null)} className="min-h-10 text-sm text-muted underline">
                Use my device location
              </button>
            )}
          </div>
        </details>
      </section>

      <section className="space-y-2" aria-label="Other places">
        {others.length === 0 && (
          <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
            Add a city to compare.
          </p>
        )}
        <ul className="space-y-2">
          {others.map((p) => {
            const off = offsetMinutes(p.tz, now);
            const dayDiff = localDayNumber(p.tz, now) - homeDay;
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {formatOffset(off)} · {diffLabel(off - homeOffset)} · {dayLabel(dayDiff)}
                  </span>
                </span>
                <span className="text-xl font-semibold tabular-nums">{formatClock(p.tz, now)}</span>
                <button
                  type="button"
                  onClick={() => setOthers((prev) => prev.filter((x) => x.id !== p.id))}
                  aria-label={`Remove ${p.name}`}
                  className="flex size-10 items-center justify-center text-xl text-muted"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
        <PlacePicker onPick={addPlace} quick={quick} disabled={others.length >= MAX_OTHERS} />
      </section>

      <section className="card p-4" aria-label="Working hours overlap">
        <h2 className="font-semibold">Shared working hours</h2>
        <p className="mt-1 text-sm text-muted">Everyone is at work between these local hours:</p>
        <div className="mt-2 flex items-center gap-2">
          <select
            aria-label="Work day starts"
            value={work.start}
            onChange={(e) => setWork((w) => ({ ...w, start: Number(e.target.value) }))}
            className="h-12 rounded-xl border border-line bg-bg px-3"
          >
            {[5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
              <option key={h} value={h}>
                {pad2(h)}:00
              </option>
            ))}
          </select>
          <span className="text-muted">to</span>
          <select
            aria-label="Work day ends"
            value={work.end}
            onChange={(e) => setWork((w) => ({ ...w, end: Number(e.target.value) }))}
            className="h-12 rounded-xl border border-line bg-bg px-3"
          >
            {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
              <option key={h} value={h}>
                {pad2(h)}:00
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 rounded-2xl bg-leaf/15 p-3">
          {others.length === 0 ? (
            <p className="text-sm text-muted">Add a city to see where your days overlap.</p>
          ) : overlapRanges.length ? (
            <>
              <p className="text-sm font-medium">Overlap in {homeLabel} time</p>
              <p className="text-lg font-semibold">{overlapRanges.join("  ·  ")}</p>
            </>
          ) : (
            <p className="text-sm font-medium">No hours when everyone is at work. Try widening the work day.</p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {everyone.map((p, r) => (
            <div key={p.id}>
              <p className="mb-1 truncate text-xs text-muted">{p.name}</p>
              <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
                {grid[r].map((on, h) => (
                  <div
                    key={h}
                    className={`h-5 ${on ? "bg-accent/70" : "bg-line"} ${h === 0 ? "rounded-l" : ""} ${
                      h === 23 ? "rounded-r" : ""
                    } ${h === currentHour ? "outline-2 outline-warm -outline-offset-1" : ""}`}
                  />
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-1 text-xs font-medium">Everyone</p>
            <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
              {overlap.map((on, h) => (
                <div
                  key={h}
                  className={`h-6 ${on ? "bg-leaf" : "bg-line"} ${h === 0 ? "rounded-l" : ""} ${
                    h === 23 ? "rounded-r" : ""
                  } ${h === currentHour ? "outline-2 outline-warm -outline-offset-1" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted" aria-hidden>
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
          <p className="text-xs text-muted">Hours shown in {homeLabel} time. The orange outline is now.</p>
        </div>
      </section>
    </div>
  );
}

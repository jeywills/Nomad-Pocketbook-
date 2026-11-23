"use client";

import Link from "next/link";
import { useState } from "react";
import { countryName } from "@/lib/countries";
import { ccColor, formatDay, plural, toDay } from "@/lib/days";
import {
  legLength,
  wetness,
  type GroupPlan,
  type Leg,
  type LegWeather,
  type VisitPlan,
  type VisitStatus,
} from "@/lib/trip";

export type LegCost = {
  /** Estimated cost of this stop, in USD. */
  stop: number;
  /** What the same days would cost at home, in USD. */
  home: number;
  /** The city used to price this stop, if it isn't the stop itself. */
  proxy: string | null;
};

type Props = {
  leg: Leg;
  index: number;
  weather: LegWeather | null;
  weatherState: "loading" | "failed" | "ok";
  unit: "C" | "F";
  visit: VisitPlan | undefined;
  group: GroupPlan | undefined;
  /** Null when no budget has been entered; `noPrice` when we have no cost data near this stop. */
  cost: LegCost | null;
  noPrice: boolean;
  money: (usd: number) => string;
  overlaps: boolean;
  onChange: (patch: { start?: string; end?: string }) => void;
  onRemove: () => void;
  onRetry: () => void;
};

const STATUS: Record<VisitStatus, { label: string; cls: string }> = {
  ok: { label: "Within your visa", cls: "bg-leaf/15 text-leaf" },
  extend: { label: "Extension needed", cls: "bg-warm/20 text-warm" },
  check: { label: "Check extension", cls: "bg-warm/20 text-warm" },
  problem: { label: "Over the limit", cls: "bg-danger/15 text-danger" },
  unknown: { label: "No visa data", cls: "bg-line text-muted" },
};

const ENTRY = {
  "visa-free": "No visa needed",
  "visa-on-arrival": "Visa on arrival",
  "e-visa": "E-visa needed",
  "visa-needed": "Visa needed in advance",
} as const;

const temp = (c: number, u: "C" | "F") => Math.round(u === "C" ? c : (c * 9) / 5 + 32);
const tag = { dry: "Mostly dry", mixed: "Some rain", wet: "Often wet" } as const;

export default function TripLegCard(p: Props) {
  const { leg, weather, visit, group } = p;
  const [confirm, setConfirm] = useState(false);
  const days = legLength(leg);
  const cc = leg.place.cc ?? "";
  const status = visit ? STATUS[visit.status] : null;
  const w = weather ? wetness(weather.rainDays, days) : null;
  const visa = visit?.visa;

  return (
    <li className="card p-4">
      <div className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
          style={{ background: ccColor(cc) }}
          aria-hidden
        >
          {cc || "??"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-wider text-muted uppercase">Stop {p.index + 1}</p>
          <h3 className="truncate font-display text-lg leading-tight font-bold">{leg.place.name}</h3>
          <p className="truncate text-sm text-muted">{cc ? countryName(cc) : leg.place.country}</p>
          <p className="mt-0.5 text-sm">
            {formatDay(toDay(leg.start))} to {formatDay(toDay(leg.end))}
            <span className="text-muted"> · {plural(days, "day")}</span>
          </p>
        </div>
        {confirm ? (
          <button
            type="button"
            onClick={p.onRemove}
            className="min-h-10 shrink-0 rounded-lg bg-danger px-2.5 text-xs font-bold"
            style={{ color: "var(--bg)" }}
          >
            Remove?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            aria-label={`Remove ${leg.place.name}`}
            className="flex size-10 shrink-0 items-center justify-center text-xl text-muted"
          >
            ×
          </button>
        )}
      </div>

      {p.overlaps && (
        <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
          These dates overlap the stop before. Change the dates so you are in one place each day.
        </p>
      )}

      <details className="mt-2">
        <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-accent">Change dates</summary>
        <div className="grid grid-cols-2 gap-3 pb-1">
          <label className="block">
            <span className="text-xs font-medium text-muted">First day</span>
            <input
              type="date"
              value={leg.start}
              onChange={(e) => e.target.value && p.onChange({ start: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Last day</span>
            <input
              type="date"
              value={leg.end}
              onChange={(e) => e.target.value && p.onChange({ end: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3"
            />
          </label>
        </div>
      </details>

      {/* ----- weather ----- */}
      <div className="mt-3 rounded-xl bg-bg p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-wider text-muted uppercase">Typical weather</p>
          {w && <span className="text-xs font-semibold text-sky">{tag[w]}</span>}
        </div>
        {weather ? (
          <>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <dd className="text-xl font-bold tabular-nums">{temp(weather.high, p.unit)}°</dd>
                <dt className="text-xs text-muted">Daytime high</dt>
              </div>
              <div>
                <dd className="text-xl font-bold tabular-nums">{temp(weather.low, p.unit)}°</dd>
                <dt className="text-xs text-muted">Night low</dt>
              </div>
              <div>
                <dd className="text-xl font-bold tabular-nums">
                  {weather.rainDays < 1 ? weather.rainDays.toFixed(1) : Math.round(weather.rainDays)}
                </dd>
                <dt className="text-xs text-muted">Rainy days</dt>
              </div>
            </dl>
            <p className="mt-1.5 text-xs text-muted">
              About {p.unit === "C" ? `${Math.round(weather.rainMm)} mm` : `${(weather.rainMm / 25.4).toFixed(1)} in`} of
              rain over the stop, from 2019 to 2023 averages.
            </p>
          </>
        ) : p.weatherState === "failed" ? (
          <p className="mt-1 text-sm text-warm">
            Couldn&apos;t load the weather.{" "}
            <button type="button" onClick={p.onRetry} className="min-h-10 font-semibold underline">
              Retry
            </button>
          </p>
        ) : days > 400 ? (
          <p className="mt-1 text-sm text-muted">Too long to average.</p>
        ) : (
          <div className="mt-2 h-12 animate-pulse rounded-lg bg-line/60" />
        )}
      </div>

      {/* ----- visa ----- */}
      <div className="mt-3 rounded-xl bg-bg p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-wider text-muted uppercase">Visa, UK passport</p>
          {status && <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.cls}`}>{status.label}</span>}
        </div>
        {!visit || !visa ? (
          <p className="mt-1.5 text-sm text-muted">
            We don&apos;t have visa data for {cc ? countryName(cc) : "this country"} yet. Check its official entry rules.
          </p>
        ) : (
          <div className="mt-1.5 space-y-1.5 text-sm">
            <p>
              <span className="font-semibold">{ENTRY[visa.entry]}</span> · {visa.stay}
            </p>
            {visit.legIds.length > 1 && (
              <p className="text-xs text-muted">
                One visit across {visit.legIds.length} stops: {formatDay(visit.start)} to {formatDay(visit.end)} (
                {plural(visit.days, "day")}).
              </p>
            )}
            {visit.limit !== null && visit.lastDay !== null && (
              <p className={visit.over > 0 ? "font-medium text-danger" : ""}>
                {visit.over > 0
                  ? `${plural(visit.days, "day")} planned, ${plural(visit.over, "day")} past the ${visit.limit}-day limit, which ends ${formatDay(visit.lastDay)}.`
                  : `${plural(visit.days, "day")} of ${visit.limit}. Last permitted day: ${formatDay(visit.lastDay)}.`}
              </p>
            )}
            {group && (
              <p className={visit.status === "problem" ? "font-medium text-danger" : ""}>
                Shared {group.key === "schengen" ? "Schengen" : countryName(group.key)} limit: {group.peak} of {group.limit} days
                in the busiest {group.window}-day stretch
                {group.exceedDay !== null ? `, passed on ${formatDay(group.exceedDay)}` : ""}
                {group.loggedDays ? `. Counts ${group.loggedDays} days from your Day tracker.` : "."}
              </p>
            )}
            {visit.applyBy !== null && (
              <p>
                <span className="font-semibold">Apply by {formatDay(visit.applyBy)}</span>
                <span className="text-muted"> (suggested about 4 weeks ahead)</span>
              </p>
            )}
            {(visit.status === "extend" || visit.status === "check") && (
              <p className="text-warm">
                <span className="font-semibold">
                  {visit.status === "check" ? "Ask about an extension" : "Extend"}
                  {visit.extendBy !== null ? ` by ${formatDay(visit.extendBy)}` : ""}.
                </span>{" "}
                <span className="text-ink">{visa.extension.text}</span>
                {visit.extTotal !== null && (
                  <span className="text-muted">
                    {" "}
                    Up to about {visit.extTotal} days in total{visit.extTypical ? " (not confirmed by the UK government)" : ""}.
                  </span>
                )}
              </p>
            )}
            {visit.status === "problem" && (
              <p className="text-danger">
                {visa.extension.can === "yes" && visit.extTotal !== null && visit.days > visit.extTotal
                  ? `Even with an extension (about ${visit.extTotal} days) this is too long.`
                  : visa.extension.can === "no"
                    ? "Extensions aren't possible here."
                    : "This goes over the limit."}{" "}
                {group
                  ? "Shorten the stay, or spend time outside the area first so earlier days drop out of the window."
                  : "Shorten the stay, split it with a stop elsewhere, or arrange a longer visa in advance."}
              </p>
            )}
            {visa.before && visa.before.length > 0 && (
              <details>
                <summary className="flex min-h-10 cursor-pointer items-center text-xs font-semibold text-accent">
                  Before you arrive
                </summary>
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted">
                  {visa.before.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </details>
            )}
            <Link href={`/visas?c=${visit.cc}`} className="inline-flex min-h-10 items-center text-xs font-semibold text-accent">
              Full visa guide <span aria-hidden>&nbsp;›</span>
            </Link>
          </div>
        )}
      </div>

      {/* ----- budget ----- */}
      <div className="mt-3 rounded-xl bg-bg p-3">
        <p className="text-xs font-bold tracking-wider text-muted uppercase">Budget</p>
        {p.cost ? (
          <>
            <p className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-xl font-bold tabular-nums">{p.money(p.cost.stop)}</span>
              <span
                className={`text-sm font-semibold ${p.cost.stop <= p.cost.home ? "text-leaf" : "text-warm"}`}
              >
                {Math.abs(p.cost.stop - p.cost.home) < p.cost.home * 0.005
                  ? "Same as home"
                  : `${p.money(Math.abs(p.cost.stop - p.cost.home))} ${p.cost.stop < p.cost.home ? "less" : "more"} than home`}
              </span>
            </p>
            <p className="text-xs text-muted">
              Your current lifestyle for {plural(days, "day")} would cost {p.money(p.cost.home)} at home.
              {p.cost.proxy ? ` Priced like ${p.cost.proxy}, the nearest city we have costs for.` : ""}
            </p>
          </>
        ) : p.noPrice ? (
          <p className="mt-1 text-sm text-muted">We don&apos;t have cost data near this stop.</p>
        ) : (
          <p className="mt-1 text-sm text-muted">Enter what you spend now above to see this.</p>
        )}
      </div>
    </li>
  );
}

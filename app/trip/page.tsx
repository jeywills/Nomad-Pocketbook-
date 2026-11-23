"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import KeyDates from "@/components/KeyDates";
import LegForm from "@/components/LegForm";
import PageBanner from "@/components/PageBanner";
import TripLegCard, { type LegCost } from "@/components/TripLegCard";
import { budgetInput, DEFAULT_BUDGET, type BudgetSaved } from "@/lib/budgetPrefs";
import { applyFx, CITIES, CITY_BY_ID, convertBudget, totalCost } from "@/lib/costs";
import { countryName } from "@/lib/countries";
import { ccColor, formatDay, fromDay, plural, toDay, type Stay } from "@/lib/days";
import { DEFAULT_CURRENCY, unitsPerUsd } from "@/lib/fx";
import { useLiveRates, useNow, useStored } from "@/lib/hooks";
import { toPlace, type Place } from "@/lib/places";
import {
  costCityFor,
  costForDays,
  legEnd,
  legLength,
  legStart,
  legWeather,
  planTrip,
  sortLegs,
  type Leg,
} from "@/lib/trip";
import { useClimate } from "@/lib/useClimate";

type Trip = { legs: Leg[] };
const NO_TRIP: Trip = { legs: [] };
const NO_STAYS: Stay[] = [];
const WEATHER_PREFS = { unit: "C" as "C" | "F" };

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function TripPage() {
  const now = useNow();
  const [trip, setTrip] = useStored<Trip>("np.trip", NO_TRIP);
  const [logged] = useStored<Stay[]>("np.stays", NO_STAYS);
  const [budget, setBudget] = useStored<BudgetSaved>("np.budget", DEFAULT_BUDGET);
  const [currency] = useStored<string>("np.currency", DEFAULT_CURRENCY);
  const [wprefs] = useStored("np.weather.prefs", WEATHER_PREFS);
  const [clearing, setClearing] = useState(false);
  const { rates } = useLiveRates(budget.live !== false);
  const liveRates = budget.live !== false && rates ? rates.rates : null;

  const legs = useMemo(() => sortLegs(trip.legs), [trip.legs]);
  const places = useMemo(() => {
    const seen = new Set<string>();
    return legs.map((l) => l.place).filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  }, [legs]);
  const { data, failed, retry } = useClimate(places);

  const rate = unitsPerUsd(currency, liveRates);
  const formatter = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }),
    [currency],
  );
  const money = (usd: number) => formatter.format(usd * rate);
  const cityOptions = useMemo(() => [...CITIES].sort((a, b) => a.name.localeCompare(b.name)), []);

  if (!now) {
    return (
      <div>
        <PageBanner tone="night" emoji="🧭" title="Trip planner" subtitle="Loading your itinerary…" />
        <div className="mt-5 h-40 animate-pulse rounded-3xl bg-line/60" />
      </div>
    );
  }

  const todayIso = new Date(now).toLocaleDateString("en-CA");
  const today = toDay(todayIso);
  const plan = planTrip(legs, logged, today, countryName);

  /* ----- budget ----- */
  const { totalUsd, input } = budgetInput(budget, rate);
  const hasSpend = totalUsd > 0;
  const fromCity = applyFx(CITY_BY_ID[budget.fromId] ?? CITIES[0], liveRates);
  const legCosts = new Map<string, { cost: LegCost | null; noPrice: boolean }>();
  let tripCost = 0;
  let homeCost = 0;
  let priced = 0;
  for (const l of legs) {
    const days = legLength(l);
    const found = costCityFor(l.place);
    if (!found) {
      legCosts.set(l.id, { cost: null, noPrice: true });
      continue;
    }
    if (!hasSpend || days < 1) {
      legCosts.set(l.id, { cost: null, noPrice: false });
      continue;
    }
    const monthly = totalCost(convertBudget(fromCity, applyFx(found.city, liveRates), input));
    const stop = costForDays(monthly, days);
    const home = costForDays(totalUsd, days);
    tripCost += stop;
    homeCost += home;
    priced += 1;
    legCosts.set(l.id, { cost: { stop, home, proxy: found.exact ? null : found.city.name }, noPrice: false });
  }

  /* ----- summary numbers ----- */
  const validLegs = legs.filter((l) => legLength(l) >= 1);
  const totalDays = validLegs.reduce((s, l) => s + legLength(l), 0);
  const first = validLegs.length ? Math.min(...validLegs.map(legStart)) : 0;
  const last = validLegs.length ? Math.max(...validLegs.map(legEnd)) : 0;
  const span = last - first + 1;
  const countries = new Set(validLegs.map((l) => l.place.cc).filter(Boolean));
  const lastEndIso = validLegs.length ? fromDay(last) : "";
  const defaultStart = lastEndIso ? fromDay(last + 1) : todayIso;

  function addLeg(place: Place, start: string, end: string) {
    setTrip((prev) => ({ legs: [...prev.legs, { id: newId(), place: toPlace(place), start, end }] }));
  }
  function patchLeg(id: string, patch: { start?: string; end?: string }) {
    setTrip((prev) => ({
      legs: prev.legs.map((l) => {
        if (l.id !== id) return l;
        let start = patch.start ?? l.start;
        let end = patch.end ?? l.end;
        if (patch.start && start > end) end = start;
        if (patch.end && end < start) start = end;
        return { ...l, start, end };
      }),
    }));
  }
  const removeLeg = (id: string) => setTrip((prev) => ({ legs: prev.legs.filter((l) => l.id !== id) }));

  const delta = tripCost - homeCost;

  return (
    <div className="space-y-5">
      <PageBanner
        tone="night"
        emoji="🧭"
        title="Trip planner"
        subtitle="Line up your stops, then see the weather, visa dates and budget for each one."
      />

      {validLegs.length > 0 && (
        <section className="card p-4" aria-labelledby="summary-title" aria-live="polite">
          <h2 id="summary-title" className="font-display text-xl font-bold">
            Your trip
          </h2>
          <p className="text-sm text-muted">
            {formatDay(first)} to {formatDay(last)} · {plural(span, "day")} in all
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-bg p-2">
              <dd className="text-2xl font-bold tabular-nums">{validLegs.length}</dd>
              <dt className="text-xs text-muted">{validLegs.length === 1 ? "stop" : "stops"}</dt>
            </div>
            <div className="rounded-xl bg-bg p-2">
              <dd className="text-2xl font-bold tabular-nums">{countries.size}</dd>
              <dt className="text-xs text-muted">{countries.size === 1 ? "country" : "countries"}</dt>
            </div>
            <div className="rounded-xl bg-bg p-2">
              <dd className="text-2xl font-bold tabular-nums">{totalDays}</dd>
              <dt className="text-xs text-muted">days booked</dt>
            </div>
          </dl>

          {/* timeline: each stop placed on the calendar */}
          <div className="relative mt-4 h-9 overflow-hidden rounded-xl bg-line" role="img" aria-label="Timeline of your stops">
            {validLegs.map((l) => (
              <span
                key={l.id}
                title={`${l.place.name}: ${formatDay(legStart(l))} to ${formatDay(legEnd(l))}`}
                className="absolute inset-y-0 flex items-center justify-center overflow-hidden border-r-2 border-bg text-[10px] font-black text-white"
                style={{
                  left: `${((legStart(l) - first) / span) * 100}%`,
                  width: `${(legLength(l) / span) * 100}%`,
                  background: ccColor(l.place.cc ?? ""),
                }}
              >
                {l.place.cc}
              </span>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>{formatDay(first)}</span>
            <span>{formatDay(last)}</span>
          </div>

          <ul className="mt-3 space-y-1.5 text-sm">
            <li className={plan.problems ? "font-semibold text-danger" : "font-semibold text-leaf"}>
              {plan.problems
                ? `${plural(plan.problems, "thing")} to fix: a visa limit is passed or stops overlap.`
                : "No visa limits passed."}
            </li>
            {plan.warnings > 0 && (
              <li className="font-semibold text-warm">
                {plural(plan.warnings, "stop")} to look at: an extension, a check, or visa data we don&apos;t have.
              </li>
            )}
            {priced > 0 && (
              <li>
                <span className="font-semibold">About {money(tripCost)}</span> for the {priced === 1 ? "stop" : "stops"} we can price,{" "}
                <span className={delta <= 0 ? "font-semibold text-leaf" : "font-semibold text-warm"}>
                  {Math.abs(delta) < homeCost * 0.005
                    ? "the same as"
                    : `${money(Math.abs(delta))} ${delta < 0 ? "less" : "more"} than`}
                </span>{" "}
                the {money(homeCost)} the same days cost at home.
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="card p-4" aria-labelledby="home-title">
        <h2 id="home-title" className="font-display text-xl font-bold">
          Your spending now
        </h2>
        <p className="mt-1 mb-3 text-sm text-muted">Shared with the Budget checker. Each stop is priced against this.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Where you live now</span>
            <select
              value={fromCity.id}
              onChange={(e) => setBudget((p) => ({ ...p, fromId: e.target.value }))}
              className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
            >
              {cityOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Monthly spending ({currency})</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 2500"
              value={budget.mode === "total" ? budget.total : hasSpend ? String(Math.round(totalUsd * rate)) : ""}
              onChange={(e) => setBudget((p) => ({ ...p, mode: "total", total: e.target.value }))}
              className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
            />
          </label>
        </div>
        {budget.mode === "split" && hasSpend && (
          <p className="mt-2 text-xs text-muted">
            This total comes from your category split in the Budget checker. Typing here switches to one total.
          </p>
        )}
      </section>

      <section className="card p-4" aria-labelledby="add-title">
        <h2 id="add-title" className="font-display text-xl font-bold">
          Add a stop
        </h2>
        <p className="mt-1 mb-3 text-sm text-muted">
          {legs.length
            ? "The first day is set to the day after your last stop. Change it if you like."
            : "Pick a city and the dates you will be there."}
        </p>
        <LegForm key={legs.length} defaultStart={defaultStart} onAdd={addLeg} />
      </section>

      <KeyDates events={plan.events} today={today} />

      {legs.length > 0 && (
        <section aria-labelledby="stops-title" className="space-y-3">
          <h2 id="stops-title" className="px-1 font-display text-xl font-bold">
            Your stops
          </h2>
          <ul className="space-y-3">
            {legs.map((l, i) => {
              const visit = plan.visitOfLeg[l.id];
              const cc = l.place.cc?.toUpperCase() ?? "";
              const gKey = plan.groups.find((g) => g.cc.includes(cc))?.key;
              const m = data[l.place.id];
              const c = legCosts.get(l.id);
              return (
                <TripLegCard
                  key={l.id}
                  leg={l}
                  index={i}
                  weather={m ? legWeather(m, legStart(l), legEnd(l)) : null}
                  weatherState={m ? "ok" : failed[l.place.id] ? "failed" : "loading"}
                  unit={wprefs.unit === "F" ? "F" : "C"}
                  visit={visit}
                  group={plan.groups.find((g) => g.key === gKey)}
                  cost={c?.cost ?? null}
                  noPrice={c?.noPrice ?? false}
                  money={money}
                  overlaps={plan.overlaps.has(l.id)}
                  onChange={(patch) => patchLeg(l.id, patch)}
                  onRemove={() => removeLeg(l.id)}
                  onRetry={() => retry(l.place)}
                />
              );
            })}
          </ul>
          <div className="px-1">
            {clearing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrip(NO_TRIP);
                    setClearing(false);
                  }}
                  className="min-h-11 rounded-xl bg-danger px-3 text-sm font-bold"
                  style={{ color: "var(--bg)" }}
                >
                  Yes, clear the whole itinerary
                </button>
                <button type="button" onClick={() => setClearing(false)} className="min-h-11 px-3 text-sm font-semibold">
                  Keep it
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setClearing(true)} className="min-h-11 text-sm font-semibold text-muted">
                Clear itinerary
              </button>
            )}
          </div>
        </section>
      )}

      <p className="rounded-2xl border border-line p-4 text-xs text-muted">
        A plan, not a booking. Weather is a typical year (2019 to 2023 averages), not a forecast. Visa rules are for a British
        citizen passport on a tourist stay, from the{" "}
        <Link href="/visas" className="font-semibold text-accent">
          visa guide
        </Link>
        , and can change, so check each official page before you book. Suggested dates for visas and extensions are rules of
        thumb, not official deadlines. Costs are rough monthly averages for one person, scaled by days. They leave out flights,
        visa fees and one-off costs. Stops in Schengen countries share one 90 days in any 180 and include stays you have logged
        in the Day tracker. Not legal advice.
      </p>
    </div>
  );
}

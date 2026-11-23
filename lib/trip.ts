import { CITIES, type City } from "./costs";
import type { Monthly } from "./climate";
import { SCHENGEN, coveredDays, formatDay, stayInterval, toDay, type Interval, type Stay } from "./days";
import { samePlace, type Place } from "./places";
import { VISA_BY_CC, type Visa } from "./visas";
import { VISA_WINDOW } from "./visaDays";

/** One stop on the itinerary. Both dates are counted, as in the Day tracker. */
export type Leg = { id: string; place: Place; start: string; end: string };

export const MAX_LEG_DAYS = 400;
const MONTH_DAYS = 30.4375;

export const legStart = (l: Leg) => toDay(l.start);
export const legEnd = (l: Leg) => toDay(l.end);
export const legLength = (l: Leg) => Math.max(0, legEnd(l) - legStart(l) + 1);
export const sortLegs = (legs: Leg[]) => [...legs].sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));

/* ---------- weather over the dates of a stop ---------- */

export type LegWeather = {
  high: number;
  low: number;
  /** Expected millimetres of rain over the whole stop. */
  rainMm: number;
  /** Expected number of days with 1 mm or more of rain. */
  rainDays: number;
};

/** Typical weather for a stop, built from the monthly averages and weighted by how many days fall in each month. */
export function legWeather(m: Monthly, start: number, end: number): LegWeather | null {
  const n = end - start + 1;
  if (n < 1 || n > MAX_LEG_DAYS) return null;
  let high = 0;
  let low = 0;
  let rainMm = 0;
  let rainDays = 0;
  for (let d = start; d <= end; d++) {
    const date = new Date(d * 86_400_000);
    const month = date.getUTCMonth();
    const dim = new Date(Date.UTC(date.getUTCFullYear(), month + 1, 0)).getUTCDate();
    high += m.high[month];
    low += m.low[month];
    rainMm += m.rain[month] / dim;
    rainDays += m.rainDays[month] / dim;
  }
  return { high: high / n, low: low / n, rainMm, rainDays };
}

/** A short label for how wet the stop is expected to be. */
export function wetness(rainDays: number, days: number): "dry" | "mixed" | "wet" {
  const share = rainDays / Math.max(days, 1);
  return share >= 0.4 ? "wet" : share < 0.12 ? "dry" : "mixed";
}

/* ---------- budget ---------- */

const rad = (d: number) => (d * Math.PI) / 180;
function km(a: Place, b: Place): number {
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/**
 * The cost-of-living city to price a stop with: the city itself if we have it,
 * else the nearest one we have in the same country, else the nearest within
 * 800 km. Null if nothing is close enough.
 */
export function costCityFor(place: Place): { city: City; exact: boolean } | null {
  const exact = CITIES.find((c) => samePlace(c, place));
  if (exact) return { city: exact, exact: true };
  const sameCountry = place.cc ? CITIES.filter((c) => c.cc === place.cc) : [];
  const pool = sameCountry.length ? sameCountry : CITIES;
  let best: City | null = null;
  let bestKm = Infinity;
  for (const c of pool) {
    const d = km(place, c);
    if (d < bestKm) {
      best = c;
      bestKm = d;
    }
  }
  if (!best || (!sameCountry.length && bestKm > 800)) return null;
  return { city: best, exact: false };
}

/** Cost in the same units as `monthly` for a stop of `days` days. */
export const costForDays = (monthly: number, days: number) => (monthly * days) / MONTH_DAYS;

/* ---------- visas ---------- */

/**
 * Longest total stay, in days, once an extension is used. Only where the UK
 * government page or a typical figure says how much an extension adds.
 */
const EXTENSION_TOTAL: Record<string, { total: number; typical?: boolean }> = {
  ID: { total: 60 },
  LA: { total: 90 },
  TL: { total: 60 },
  AR: { total: 180 },
  CO: { total: 180 },
  DO: { total: 120 },
  PY: { total: 180 },
  VE: { total: 180 },
  TH: { total: 60, typical: true },
  KH: { total: 60, typical: true },
  BR: { total: 180, typical: true },
};

/** How many days before the end of the stay you must apply to extend, where the page says. Otherwise a week is suggested. */
const EXTENSION_LEAD: Record<string, number> = { AZ: 3, RS: 30, TL: 15 };
const DEFAULT_EXTENSION_LEAD = 7;
/** A general buffer for getting a visa sorted. This is a suggestion, not an official processing time. */
export const VISA_LEAD_DAYS = 28;

export type VisitStatus = "ok" | "extend" | "check" | "problem" | "unknown";

export type VisitPlan = {
  cc: string;
  visa: Visa | undefined;
  start: number;
  end: number;
  days: number;
  legIds: string[];
  /** Single-visit day limit, or null if the limit is shared (Schengen, rolling) or there is none. */
  limit: number | null;
  /** The last permitted day without an extension. */
  lastDay: number | null;
  /** Days past the limit (0 if within). */
  over: number;
  status: VisitStatus;
  /** Total days allowed with an extension, if known. */
  extTotal: number | null;
  extTypical: boolean;
  /** Last day to apply for the extension. */
  extendBy: number | null;
  /** Suggested day to start a visa application, if one is needed. */
  applyBy: number | null;
};

export type GroupPlan = {
  key: string;
  label: string;
  cc: string[];
  limit: number;
  window: number;
  peak: number;
  peakDay: number;
  /** First day the count goes past the limit, or null. */
  exceedDay: number | null;
  /** Every day on which the count is past the limit. */
  overDays: number[];
  /** Days already logged in the Day tracker that count in the same window. */
  loggedDays: number;
};

export type TripEvent = {
  id: string;
  date: number;
  kind: "visa" | "arrive" | "extend" | "limit";
  tone: "info" | "warn" | "danger";
  title: string;
  detail: string;
  cc: string;
};

export type TripPlan = {
  visits: VisitPlan[];
  groups: GroupPlan[];
  events: TripEvent[];
  /** The visit each stop belongs to. */
  visitOfLeg: Record<string, VisitPlan>;
  /** Stops that overlap the one before. */
  overlaps: Set<string>;
  problems: number;
  warnings: number;
};

const legCc = (l: Leg) => l.place.cc?.toUpperCase() ?? "";
const groupOf = (cc: string): { key: string; window: number } | null =>
  SCHENGEN.has(cc) ? { key: "schengen", window: 180 } : VISA_WINDOW[cc] ? { key: cc, window: VISA_WINDOW[cc] } : null;

function mergeVisits(legs: Leg[]): { cc: string; start: number; end: number; legIds: string[] }[] {
  const out: { cc: string; start: number; end: number; legIds: string[] }[] = [];
  const open = new Map<string, number>();
  for (const l of sortLegs(legs)) {
    const cc = legCc(l);
    if (!cc || legLength(l) < 1) continue;
    const i = open.get(cc);
    const v = i === undefined ? undefined : out[i];
    if (v && legStart(l) <= v.end + 1) {
      v.end = Math.max(v.end, legEnd(l));
      v.legIds.push(l.id);
    } else {
      open.set(cc, out.length);
      out.push({ cc, start: legStart(l), end: legEnd(l), legIds: [l.id] });
    }
  }
  return out;
}

function groupPlans(legs: Leg[], logged: Stay[], today: number): GroupPlan[] {
  const keys = new Map<string, { window: number; cc: Set<string> }>();
  for (const l of legs) {
    const cc = legCc(l);
    const g = groupOf(cc);
    if (!g || legLength(l) < 1) continue;
    const e = keys.get(g.key) ?? { window: g.window, cc: new Set<string>() };
    e.cc.add(cc);
    keys.set(g.key, e);
  }
  const out: GroupPlan[] = [];
  for (const [key, { window, cc }] of keys) {
    const members = (c: string) => (key === "schengen" ? SCHENGEN.has(c) : c === key);
    const planned: Interval[] = legs
      .filter((l) => members(legCc(l)) && legLength(l) >= 1)
      .map((l) => [legStart(l), legEnd(l)] as Interval);
    const history: Interval[] = [];
    for (const s of logged) {
      const iv = members(s.cc) ? stayInterval(s, today) : null;
      if (iv) history.push(iv);
    }
    const ivs = [...planned, ...history];
    const from = Math.min(...planned.map((iv) => iv[0]));
    const to = Math.min(Math.max(...planned.map((iv) => iv[1])), from + 800);
    const limit = key === "schengen" ? 90 : (VISA_BY_CC[key]?.days ?? 0);
    let peak = 0;
    let peakDay = from;
    let exceedDay: number | null = null;
    const overDays: number[] = [];
    for (let d = from; d <= to; d++) {
      const n = coveredDays(ivs, d - window + 1, d);
      if (n > peak) {
        peak = n;
        peakDay = d;
      }
      if (n > limit) {
        overDays.push(d);
        if (exceedDay === null) exceedDay = d;
      }
    }
    const loggedDays = coveredDays(history, from - window + 1, to);
    out.push({
      key,
      label: key === "schengen" ? "Schengen" : key,
      cc: [...cc],
      limit,
      window,
      peak,
      peakDay,
      exceedDay,
      overDays,
      loggedDays,
    });
  }
  return out;
}

/** Works out the visa picture for an itinerary: each visit, the shared limits, and the dates to act on. */
export function planTrip(
  legs: Leg[],
  logged: Stay[],
  today: number,
  name: (cc: string) => string,
): TripPlan {
  const groups = groupPlans(legs, logged, today);
  const groupByKey = new Map(groups.map((g) => [g.key, g]));
  const visits: VisitPlan[] = [];
  const events: TripEvent[] = [];
  const visitOfLeg: Record<string, VisitPlan> = {};

  for (const v of mergeVisits(legs)) {
    const visa = VISA_BY_CC[v.cc];
    const days = v.end - v.start + 1;
    const g = groupOf(v.cc);
    const group = g ? groupByKey.get(g.key) : undefined;
    const limit = !g && visa?.days != null ? visa.days : null;
    const lastDay = limit !== null ? v.start + limit - 1 : null;
    const over = limit !== null ? Math.max(0, days - limit) : 0;
    const ext = EXTENSION_TOTAL[v.cc];
    const canExtend = visa?.extension.can;

    let status: VisitStatus = !visa ? "unknown" : "ok";
    if (visa && over > 0) {
      if (canExtend === "yes") status = ext && days > ext.total ? "problem" : "extend";
      else status = canExtend === "unclear" ? "check" : "problem";
    }
    if (visa && group?.overDays.some((d) => d >= v.start && d <= v.end)) {
      status = canExtend === "yes" ? "extend" : "problem";
    }

    const extendBy =
      (status === "extend" || status === "check") && lastDay !== null
        ? lastDay - (EXTENSION_LEAD[v.cc] ?? DEFAULT_EXTENSION_LEAD)
        : null;
    const needsApplication = visa && (visa.entry === "e-visa" || visa.entry === "visa-needed");
    const plan: VisitPlan = {
      cc: v.cc,
      visa,
      start: v.start,
      end: v.end,
      days,
      legIds: v.legIds,
      limit,
      lastDay,
      over,
      status,
      extTotal: ext?.total ?? null,
      extTypical: !!ext?.typical,
      extendBy,
      applyBy: needsApplication ? v.start - VISA_LEAD_DAYS : null,
    };
    visits.push(plan);
    for (const id of v.legIds) visitOfLeg[id] = plan;

    const country = name(v.cc);
    const id = `${v.cc}-${v.start}`;
    if (plan.applyBy !== null && visa) {
      events.push({
        id: `${id}-visa`,
        date: plan.applyBy,
        kind: "visa",
        tone: "info",
        title: `Apply for your ${country} ${visa.entry === "e-visa" ? "e-visa" : "visa"}`,
        detail: `Suggested about ${VISA_LEAD_DAYS / 7} weeks before you arrive. That is a rule of thumb, not an official processing time, so check the real wait.`,
        cc: v.cc,
      });
    }
    events.push({
      id: `${id}-arrive`,
      date: v.start,
      kind: "arrive",
      tone: "info",
      title: `Arrive in ${country}`,
      detail: !visa
        ? "No visa data for this country yet. Check the official entry rules."
        : visa.entry === "visa-on-arrival"
          ? `Visa on arrival: ${visa.stay}.`
          : visa.entry === "visa-free"
            ? `No visa needed: ${visa.stay}.`
            : `${visa.stay}.`,
      cc: v.cc,
    });
    if (lastDay !== null && limit !== null && days >= limit * 0.8) {
      events.push({
        id: `${id}-limit`,
        date: lastDay,
        kind: "limit",
        tone: over > 0 ? "danger" : "warn",
        title: `Last permitted day in ${country}`,
        detail:
          over > 0
            ? `Your plan stays ${over} ${over === 1 ? "day" : "days"} past this.`
            : `Your plan uses ${days} of ${limit} days.`,
        cc: v.cc,
      });
    }
    if (plan.extendBy !== null && visa) {
      events.push({
        id: `${id}-extend`,
        date: plan.extendBy,
        kind: "extend",
        tone: "warn",
        title: `Extend your ${country} stay`,
        detail: `${visa.extension.text}${
          ext ? ` Total with an extension: about ${ext.total} days${ext.typical ? " (not confirmed by the UK government)" : ""}.` : ""
        } Suggested deadline.`,
        cc: v.cc,
      });
    }
  }

  for (const g of groups) {
    if (g.exceedDay === null) continue;
    events.push({
      id: `${g.key}-exceed`,
      date: g.exceedDay,
      kind: "limit",
      tone: "danger",
      title: g.key === "schengen" ? `Schengen ${g.limit} days passed` : `${name(g.key)} ${g.limit}-day limit passed`,
      detail: `${g.peak} of ${g.limit} days used in a rolling ${g.window} days by ${formatDay(g.peakDay)}${
        g.loggedDays ? `, counting ${g.loggedDays} you already logged` : ""
      }.`,
      cc: g.key === "schengen" ? "" : g.key,
    });
  }

  const order = { visa: 0, arrive: 1, extend: 2, limit: 3 } as const;
  events.sort((a, b) => a.date - b.date || order[a.kind] - order[b.kind]);

  const overlaps = new Set<string>();
  const sorted = sortLegs(legs);
  for (let i = 1; i < sorted.length; i++) {
    if (legStart(sorted[i]) <= legEnd(sorted[i - 1])) overlaps.add(sorted[i].id);
  }

  return {
    visits,
    groups,
    events,
    visitOfLeg,
    overlaps,
    problems: visits.filter((v) => v.status === "problem").length + overlaps.size,
    warnings: visits.filter((v) => v.status === "extend" || v.status === "check" || v.status === "unknown").length,
  };
}

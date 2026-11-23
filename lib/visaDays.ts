import { rollingPlan, visitsIn, type Stay } from "./days";
import { VISA_BY_CC, type Visa } from "./visas";

/**
 * Length in days of the window for countries that count a limit over a rolling
 * period. "6 months" and "a year" wording is approximated, so the UI says so.
 */
export const VISA_WINDOW: Record<string, number> = {
  AL: 180,
  AM: 365,
  BA: 183,
  CY: 180,
  MD: 183,
  ME: 180,
  RS: 183,
  TR: 180,
  UA: 180,
  BO: 365,
  EC: 365,
  PE: 180,
};

export type VisitCheck = {
  kind: "visit";
  cc: string;
  visa: Visa;
  /** current = in this country today, planned = starts later, past = over and finished. */
  state: "current" | "planned" | "past";
  start: number;
  /** Last logged day (today while you are still there). */
  end: number;
  limit: number;
  /** The last day the stay allows, counting your first day as day 1. */
  lastDay: number;
  /** Days spent so far (0 if it has not started). */
  usedNow: number;
  /** Days from the first to the last logged day. */
  total: number;
};

export type WindowCheck = {
  kind: "window";
  cc: string;
  visa: Visa;
  limit: number;
  window: number;
  used: number;
  peak: number;
  peakDay: number;
  hasPlanned: boolean;
};

export type VisaCheck = VisitCheck | WindowCheck;

const ORDER = { current: 0, planned: 1, past: 2 } as const;

/**
 * Visa limits for the countries in your stays. Schengen countries are left out
 * (they share one counter) as are countries with no single day limit. Past
 * visits only appear if they went over.
 */
export function visaChecks(stays: Stay[], today: number): VisaCheck[] {
  const out: VisaCheck[] = [];
  for (const cc of new Set(stays.map((s) => s.cc))) {
    const visa = VISA_BY_CC[cc];
    if (!visa || visa.group === "schengen" || visa.days === null) continue;
    const limit = visa.days;
    const visits = visitsIn(stays, cc, today);

    const window = VISA_WINDOW[cc];
    if (visa.rolling && window) {
      const plan = rollingPlan(visits, window, today);
      if (plan.used > 0 || plan.hasPlanned) out.push({ kind: "window", cc, visa, limit, window, ...plan });
      continue;
    }

    for (const [start, end] of visits) {
      const total = end - start + 1;
      const state = start > today ? "planned" : end >= today ? "current" : "past";
      if (state === "past" && total <= limit) continue;
      out.push({
        kind: "visit",
        cc,
        visa,
        state,
        start,
        end,
        limit,
        lastDay: start + limit - 1,
        usedNow: state === "planned" ? 0 : Math.min(total, today - start + 1),
        total,
      });
    }
  }
  return out.sort((a, b) => {
    const sa = a.kind === "visit" ? ORDER[a.state] : 0;
    const sb = b.kind === "visit" ? ORDER[b.state] : 0;
    if (sa !== sb) return sa - sb;
    return (a.kind === "visit" ? a.start : 0) - (b.kind === "visit" ? b.start : 0);
  });
}

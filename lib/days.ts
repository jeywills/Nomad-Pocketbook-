/**
 * Day counting for the tax tracker. Everything works on whole days since the
 * Unix epoch, parsed from "YYYY-MM-DD" strings in UTC, so time zones and
 * daylight saving never shift a date.
 */

/** A period spent in one country. `end: null` means "still here". */
export type Stay = {
  id: string;
  /** ISO 3166-1 alpha-2 country code. */
  cc: string;
  /** First day, YYYY-MM-DD, counted. */
  start: string;
  /** Last day, YYYY-MM-DD, counted. Null while the stay is ongoing. */
  end: string | null;
};

const MS = 86_400_000;

export const toDay = (iso: string): number => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / MS);
};

export const fromDay = (n: number): string => new Date(n * MS).toISOString().slice(0, 10);

/** True for a real calendar date in a sensible range. */
export const isIsoDate = (s: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && fromDay(toDay(s)) === s && s >= "1990-01-01" && s <= "2100-12-31";

export function formatDay(n: number, withYear = true): string {
  return new Date(n * MS).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

type Interval = [number, number];

/** The days a stay covers (inclusive), or null if it has not started or is empty. */
export function stayInterval(s: Stay, today: number): Interval | null {
  const a = toDay(s.start);
  const b = s.end ? toDay(s.end) : today;
  return b >= a ? [a, b] : null;
}

/** Number of distinct days covered by the intervals inside [lo, hi]. Overlaps count once. */
function coveredDays(intervals: Interval[], lo: number, hi: number): number {
  const clipped = intervals
    .map(([a, b]) => [Math.max(a, lo), Math.min(b, hi)] as Interval)
    .filter(([a, b]) => b >= a)
    .sort((x, y) => x[0] - y[0]);
  let total = 0;
  let curA = 0;
  let curB = -Infinity;
  for (const [a, b] of clipped) {
    if (a > curB) {
      if (curB > -Infinity) total += curB - curA + 1;
      curA = a;
      curB = b;
    } else if (b > curB) {
      curB = b;
    }
  }
  if (curB > -Infinity) total += curB - curA + 1;
  return total;
}

/** Days spent in each country between lo and hi (inclusive). */
export function daysByCountry(stays: Stay[], lo: number, hi: number, today: number): Map<string, number> {
  const byCc = new Map<string, Interval[]>();
  for (const s of stays) {
    const iv = stayInterval(s, today);
    if (iv) byCc.set(s.cc, [...(byCc.get(s.cc) ?? []), iv]);
  }
  const out = new Map<string, number>();
  for (const [cc, ivs] of byCc) {
    const n = coveredDays(ivs, lo, hi);
    if (n > 0) out.set(cc, n);
  }
  return out;
}

/**
 * Days per country in a range, split into days already spent and days still
 * planned (dates after today).
 */
export function splitDays(stays: Stay[], lo: number, hi: number, today: number) {
  const all = daysByCountry(stays, lo, hi, today);
  const sofar = daysByCountry(stays, lo, Math.min(hi, today), today);
  const out = new Map<string, { soFar: number; planned: number; total: number }>();
  for (const [cc, total] of all) {
    const soFar = sofar.get(cc) ?? 0;
    out.set(cc, { soFar, planned: total - soFar, total });
  }
  return out;
}

/* ---------- tax years ---------- */

export const TAX_YEAR_STARTS = [
  { value: "01-01", label: "Calendar year (1 Jan)" },
  { value: "04-06", label: "UK tax year (6 Apr)" },
  { value: "04-01", label: "1 April (India, Japan, NZ)" },
  { value: "07-01", label: "Australia (1 Jul)" },
] as const;

/** The tax year containing `today`, shifted by `offset` years. Returns day numbers lo..hi. */
export function taxYear(startMonthDay: string, today: number, offset: number) {
  const [sm, sd] = startMonthDay.split("-").map(Number);
  let y = new Date(today * MS).getUTCFullYear();
  if (today < Math.floor(Date.UTC(y, sm - 1, sd) / MS)) y -= 1;
  y += offset;
  const lo = Math.floor(Date.UTC(y, sm - 1, sd) / MS);
  const hi = Math.floor(Date.UTC(y + 1, sm - 1, sd) / MS) - 1;
  return { lo, hi, label: `${formatDay(lo)} to ${formatDay(hi)}` };
}

/* ---------- Schengen 90/180 ---------- */

/** The 29 Schengen states (Bulgaria and Romania have been full members since January 2025). */
export const SCHENGEN: ReadonlySet<string> = new Set(
  "AT BE BG HR CZ DK EE FI FR DE GR HU IS IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE CH".split(" "),
);

function schengenIntervals(stays: Stay[], today: number): Interval[] {
  const ivs: Interval[] = [];
  for (const s of stays) {
    if (!SCHENGEN.has(s.cc)) continue;
    const iv = stayInterval(s, today);
    if (iv) ivs.push(iv);
  }
  return ivs;
}

/** Schengen days used in the 180 days up to and including today. Any Schengen country counts. */
export function schengenUsed(stays: Stay[], today: number): number {
  return coveredDays(schengenIntervals(stays, today), today - 179, today);
}

/**
 * Schengen days used so far, plus the worst point reached if every planned
 * (future) stay goes ahead. The rule looks at the 180 days ending on each
 * day, so the peak can fall on a day in the future.
 */
export function schengenPlan(stays: Stay[], today: number) {
  const ivs = schengenIntervals(stays, today);
  const used = coveredDays(ivs, today - 179, today);
  const lastDay = Math.max(today, ...ivs.map((iv) => iv[1]));
  const hasPlanned = lastDay > today;
  let peak = used;
  let peakDay = today;
  if (hasPlanned) {
    // Cap the look-ahead at two years so a typo like 2099 can't stall the page.
    for (let d = today + 1; d <= Math.min(lastDay, today + 730); d++) {
      const n = coveredDays(ivs, d - 179, d);
      if (n > peak) {
        peak = n;
        peakDay = d;
      }
    }
  }
  return { used, peak, peakDay, hasPlanned };
}

/* ---------- calendar ---------- */

export type Cell = { iso: string; day: number; ccs: string[] } | null;

/** A month as a Monday-first grid: leading blanks, then each day with the countries you were in. */
export function monthCells(year: number, month0: number, stays: Stay[], today: number): Cell[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const intervals = stays.map((s) => ({ cc: s.cc, iv: stayInterval(s, today) }));
  const cells: Cell[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= count; d++) {
    const n = Math.floor(Date.UTC(year, month0, d) / MS);
    const ccs: string[] = [];
    for (const { cc, iv } of intervals) {
      if (iv && n >= iv[0] && n <= iv[1] && !ccs.includes(cc)) ccs.push(cc);
    }
    cells.push({ iso: fromDay(n), day: d, ccs });
  }
  return cells;
}

const COLORS = ["#b91c1c", "#1d4ed8", "#15803d", "#7e22ce", "#c2410c", "#0e7490", "#a21caf", "#4d7c0f"];

/** A stable colour for a country code. White text on all of these passes 4.5:1. */
export function ccColor(cc: string): string {
  let h = 0;
  for (let i = 0; i < cc.length; i++) h = (h * 31 + cc.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

/* ---------- export ---------- */

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** CSV of every stay, then the totals for one tax year, for sharing with an accountant. */
export function buildCsv(
  stays: Stay[],
  today: number,
  name: (cc: string) => string,
  year: { label: string; totals: Map<string, { soFar: number; planned: number }> },
): string {
  const rows: (string | number)[][] = [["Country", "Code", "First day", "Last day", "Days"]];
  for (const s of [...stays].sort((a, b) => a.start.localeCompare(b.start))) {
    const iv = stayInterval(s, today);
    rows.push([name(s.cc), s.cc, s.start, s.end ?? `ongoing (to ${fromDay(today)})`, iv ? iv[1] - iv[0] + 1 : 0]);
  }
  rows.push([], [`Totals for ${year.label}`], ["Country", "Code", "Days so far", "Planned days", "Total"]);
  const byTotal = [...year.totals].sort((a, b) => b[1].soFar + b[1].planned - (a[1].soFar + a[1].planned));
  for (const [cc, t] of byTotal) rows.push([name(cc), cc, t.soFar, t.planned, t.soFar + t.planned]);
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

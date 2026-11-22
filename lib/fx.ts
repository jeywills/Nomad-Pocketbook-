/**
 * Live exchange rates (free, no key): https://open.er-api.com
 * Attribution: "Rates By Exchange Rate API" (https://www.exchangerate-api.com).
 */

/** Currency units per 1 USD on the date the city cost estimates were set. */
export const BASE_RATES_DATE = "2026-11-22";
export const BASE_RATES: Record<string, number> = {
  EUR: 0.911256,
  GBP: 0.763601,
  CZK: 22.291402,
  HUF: 340.052586,
  PLN: 4.059578,
  RSD: 107.140235,
  GEL: 2.592167,
  THB: 33.918378,
  IDR: 18291.407129,
  VND: 25783.122794,
  MYR: 4.112786,
  SGD: 1.289578,
  JPY: 158.747474,
  KRW: 1343.330639,
  TWD: 32.980334,
  MXN: 19.123957,
  COP: 3341.891148,
  ZAR: 17.529792,
  AUD: 1.507035,
  // Extra currencies for the currency picker (display only).
  CAD: 1.433441,
  CHF: 0.840341,
  NZD: 1.824946,
  AED: 3.6725,
  SEK: 10.219547,
  NOK: 9.768265,
  DKK: 6.805787,
  INR: 92.889095,
  BRL: 5.937879,
};

/** Currencies offered in the picker. Sterling first, as the default. */
export const CURRENCIES = [
  "GBP", "USD", "EUR", "AUD", "CAD", "NZD", "CHF", "SEK", "NOK", "DKK",
  "AED", "SGD", "JPY", "THB", "MXN", "ZAR", "PLN", "INR", "BRL",
] as const;
export const DEFAULT_CURRENCY = "GBP";

/** Units of `code` per 1 USD, from live rates when given, else the baseline. */
export function unitsPerUsd(code: string, live: Record<string, number> | null): number {
  if (code === "USD") return 1;
  return live?.[code] ?? BASE_RATES[code] ?? 1;
}

/**
 * Currencies we never adjust. USD is the reference, AED is pegged to it, and
 * in high-inflation economies (ARS, TRY) local prices rise as the currency
 * falls, so an exchange-rate move says little about real USD costs.
 */
const NO_ADJUST = new Set(["USD", "AED", "ARS", "TRY"]);

export type Rates = {
  rates: Record<string, number>;
  /** When the provider last updated its rates (ms since epoch). */
  updated: number;
};

const CACHE_KEY = "np.fx.v1";
const TTL_MS = 6 * 60 * 60 * 1000;

type Cached = Rates & { fetchedAt: number };

export async function fetchRates(): Promise<Rates> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const c = JSON.parse(raw) as Cached;
      if (Date.now() - c.fetchedAt < TTL_MS) return { rates: c.rates, updated: c.updated };
    }
  } catch {
    /* ignore a bad cache */
  }

  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error("Rates request failed");
  const json = (await res.json()) as {
    result: string;
    rates: Record<string, number>;
    time_last_update_unix: number;
  };
  if (json.result !== "success") throw new Error("Rates unavailable");

  const fresh: Rates = { rates: json.rates, updated: json.time_last_update_unix * 1000 };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...fresh, fetchedAt: Date.now() }));
  } catch {
    /* storage unavailable */
  }
  return fresh;
}

/**
 * Multiplier for a city's USD costs. Local prices are treated as fixed, so if
 * the local currency has strengthened since the baseline, USD costs rise.
 */
export function fxFactor(currency: string, live: Record<string, number> | null): number {
  if (!live || NO_ADJUST.has(currency)) return 1;
  const base = BASE_RATES[currency];
  const now = live[currency];
  if (!base || !now) return 1;
  return base / now;
}

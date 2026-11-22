import { fxFactor } from "./fx";
import { makePlace, type Place } from "./places";

export const CATEGORIES = [
  { key: "housing", label: "Housing", hint: "Rent for a 1-bed, central-ish" },
  { key: "food", label: "Food", hint: "Groceries + eating out" },
  { key: "transport", label: "Getting around", hint: "Transit, rideshare" },
  { key: "utilities", label: "Utilities & internet", hint: "Power, wifi, phone" },
  { key: "leisure", label: "Fun & extras", hint: "Gym, nights out, trips" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
export type Costs = Record<CategoryKey, number>;

export type City = Place & { costs: Costs; currency: string };

const COUNTRY_CODE: Record<string, string> = {
  Portugal: "PT", Spain: "ES", Germany: "DE", Czechia: "CZ", Hungary: "HU", Poland: "PL",
  Bulgaria: "BG", Serbia: "RS", Greece: "GR", Estonia: "EE", Georgia: "GE", "Türkiye": "TR",
  "United Kingdom": "GB", Ireland: "IE", France: "FR", Netherlands: "NL", UAE: "AE",
  Thailand: "TH", Indonesia: "ID", Vietnam: "VN", Malaysia: "MY", Singapore: "SG",
  Japan: "JP", "South Korea": "KR", Taiwan: "TW", Mexico: "MX", Colombia: "CO",
  Argentina: "AR", "South Africa": "ZA", "United States": "US", Australia: "AU",
};

/** Local currency by city, used for the live exchange-rate adjustment. */
const CURRENCY: Record<string, string> = {
  Lisbon: "EUR", Porto: "EUR", Madrid: "EUR", Barcelona: "EUR", "Las Palmas": "EUR",
  Berlin: "EUR", Sofia: "EUR", Athens: "EUR", Tallinn: "EUR", Dublin: "EUR",
  Paris: "EUR", Amsterdam: "EUR", Prague: "CZK", Budapest: "HUF", Warsaw: "PLN",
  "Kraków": "PLN", Belgrade: "RSD", Tbilisi: "GEL", Istanbul: "TRY", London: "GBP",
  Dubai: "AED", Bangkok: "THB", "Chiang Mai": "THB", "Canggu (Bali)": "IDR",
  "Ho Chi Minh City": "VND", "Kuala Lumpur": "MYR", Singapore: "SGD", Tokyo: "JPY",
  Seoul: "KRW", Taipei: "TWD", "Mexico City": "MXN", "Medellín": "COP", "Bogotá": "COP",
  "Buenos Aires": "ARS", "Cape Town": "ZAR", "New York": "USD", Austin: "USD",
  Miami: "USD", Sydney: "AUD",
};

/**
 * ROUGH monthly costs in USD for one person living a comfortable mid-range
 * lifestyle. These are hand-entered ballpark estimates for comparing cities
 * against each other, not live prices. They were set at the exchange rates in
 * BASE_RATES (lib/fx.ts); applyFx() moves them with live rates. Adjust freely.
 *
 * name, country, lat, lon, tz, housing, food, transport, utilities, leisure
 */
const ROWS: [string, string, number, number, string, number, number, number, number, number][] = [
  ["Lisbon", "Portugal", 38.72, -9.14, "Europe/Lisbon", 1400, 600, 90, 150, 350],
  ["Porto", "Portugal", 41.15, -8.61, "Europe/Lisbon", 1000, 500, 70, 130, 280],
  ["Madrid", "Spain", 40.42, -3.7, "Europe/Madrid", 1200, 550, 80, 140, 320],
  ["Barcelona", "Spain", 41.39, 2.17, "Europe/Madrid", 1400, 600, 85, 140, 350],
  ["Las Palmas", "Spain", 28.12, -15.43, "Atlantic/Canary", 900, 450, 60, 120, 250],
  ["Berlin", "Germany", 52.52, 13.4, "Europe/Berlin", 1300, 550, 100, 200, 330],
  ["Prague", "Czechia", 50.08, 14.44, "Europe/Prague", 1000, 450, 60, 180, 280],
  ["Budapest", "Hungary", 47.5, 19.04, "Europe/Budapest", 800, 400, 50, 150, 250],
  ["Warsaw", "Poland", 52.23, 21.01, "Europe/Warsaw", 900, 420, 55, 160, 250],
  ["Kraków", "Poland", 50.06, 19.94, "Europe/Warsaw", 800, 400, 45, 140, 230],
  ["Sofia", "Bulgaria", 42.7, 23.32, "Europe/Sofia", 600, 350, 40, 120, 200],
  ["Belgrade", "Serbia", 44.79, 20.45, "Europe/Belgrade", 650, 370, 40, 110, 210],
  ["Athens", "Greece", 37.98, 23.73, "Europe/Athens", 750, 450, 60, 130, 250],
  ["Tallinn", "Estonia", 59.44, 24.75, "Europe/Tallinn", 1000, 450, 70, 150, 270],
  ["Tbilisi", "Georgia", 41.72, 44.79, "Asia/Tbilisi", 600, 350, 30, 100, 200],
  ["Istanbul", "Türkiye", 41.01, 28.98, "Europe/Istanbul", 650, 380, 35, 110, 220],
  ["London", "United Kingdom", 51.51, -0.13, "Europe/London", 2400, 800, 200, 250, 450],
  ["Dublin", "Ireland", 53.35, -6.26, "Europe/Dublin", 2200, 750, 150, 220, 400],
  ["Paris", "France", 48.86, 2.35, "Europe/Paris", 1900, 750, 90, 200, 400],
  ["Amsterdam", "Netherlands", 52.37, 4.9, "Europe/Amsterdam", 2000, 750, 110, 220, 400],
  ["Dubai", "UAE", 25.2, 55.27, "Asia/Dubai", 1900, 700, 150, 250, 450],
  ["Bangkok", "Thailand", 13.76, 100.5, "Asia/Bangkok", 700, 450, 60, 100, 300],
  ["Chiang Mai", "Thailand", 18.79, 98.98, "Asia/Bangkok", 450, 350, 40, 80, 220],
  ["Canggu (Bali)", "Indonesia", -8.65, 115.14, "Asia/Makassar", 800, 400, 60, 90, 300],
  ["Ho Chi Minh City", "Vietnam", 10.78, 106.7, "Asia/Ho_Chi_Minh", 650, 350, 40, 80, 220],
  ["Kuala Lumpur", "Malaysia", 3.14, 101.69, "Asia/Kuala_Lumpur", 700, 380, 50, 100, 250],
  ["Singapore", "Singapore", 1.35, 103.82, "Asia/Singapore", 2600, 700, 140, 150, 450],
  ["Tokyo", "Japan", 35.68, 139.69, "Asia/Tokyo", 1300, 600, 100, 180, 350],
  ["Seoul", "South Korea", 37.57, 126.98, "Asia/Seoul", 1000, 550, 70, 150, 300],
  ["Taipei", "Taiwan", 25.03, 121.57, "Asia/Taipei", 850, 450, 60, 100, 250],
  ["Mexico City", "Mexico", 19.43, -99.13, "America/Mexico_City", 1000, 450, 50, 100, 280],
  ["Medellín", "Colombia", 6.24, -75.58, "America/Bogota", 700, 380, 45, 90, 220],
  ["Bogotá", "Colombia", 4.71, -74.07, "America/Bogota", 650, 360, 45, 90, 200],
  ["Buenos Aires", "Argentina", -34.6, -58.38, "America/Argentina/Buenos_Aires", 700, 400, 40, 100, 220],
  ["Cape Town", "South Africa", -33.92, 18.42, "Africa/Johannesburg", 800, 420, 80, 120, 250],
  ["New York", "United States", 40.71, -74.01, "America/New_York", 3800, 900, 130, 200, 500],
  ["Austin", "United States", 30.27, -97.74, "America/Chicago", 1900, 700, 200, 200, 400],
  ["Miami", "United States", 25.76, -80.19, "America/New_York", 2500, 750, 200, 200, 450],
  ["Sydney", "Australia", -33.87, 151.21, "Australia/Sydney", 2300, 750, 130, 200, 400],
];

export const CITIES: City[] = ROWS.map(
  ([name, country, lat, lon, tz, housing, food, transport, utilities, leisure]) => ({
    ...makePlace(name, country, lat, lon, tz, COUNTRY_CODE[country]),
    costs: { housing, food, transport, utilities, leisure },
    currency: CURRENCY[name] ?? "USD",
  }),
);

/** The city with its USD costs moved by the live exchange rate for its currency. */
export function applyFx(city: City, live: Record<string, number> | null): City {
  const f = fxFactor(city.currency, live);
  if (f === 1) return city;
  const costs = {} as Costs;
  for (const { key } of CATEGORIES) costs[key] = city.costs[key] * f;
  return { ...city, costs };
}

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(
  CITIES.map((c) => [c.id, c]),
);

export function totalCost(c: Costs): number {
  return CATEGORIES.reduce((sum, { key }) => sum + c[key], 0);
}

export type Spend = Partial<Record<CategoryKey, number>>;

/**
 * What the same lifestyle would cost in `to`, given what you spend in `from`.
 * Each category is scaled by that category's price ratio between the cities.
 * If you only know a total, it is first split using `from`'s typical mix.
 */
export function convertBudget(
  from: City,
  to: City,
  input: { mode: "total"; total: number } | { mode: "split"; spend: Spend },
): Costs {
  const fromTotal = totalCost(from.costs);
  const result = {} as Costs;
  for (const { key } of CATEGORIES) {
    const base =
      input.mode === "total"
        ? input.total * (from.costs[key] / fromTotal)
        : (input.spend[key] ?? 0);
    result[key] = base * (to.costs[key] / from.costs[key]);
  }
  return result;
}

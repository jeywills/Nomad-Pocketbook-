import type { Place } from "./places";

/** Index 0 = January. Temperatures in °C, rain in mm per month. */
export type Monthly = {
  high: number[];
  low: number[];
  rain: number[];
};

const START_YEAR = 2019;
const END_YEAR = 2023;
const CACHE_PREFIX = "np.climate.v1.";

type ArchiveResponse = {
  daily: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
  };
};

function readCache(id: string): Monthly | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    return raw ? (JSON.parse(raw) as Monthly) : null;
  } catch {
    return null;
  }
}

function writeCache(id: string, m: Monthly) {
  try {
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(m));
  } catch {
    /* storage unavailable: fine, we just refetch next time */
  }
}

/**
 * Average monthly climate for a place, built from five years of daily
 * observations (2019-2023) so each month reflects a typical year rather
 * than one set point in time.
 */
export async function fetchMonthly(place: Place): Promise<Monthly> {
  const cached = readCache(place.id);
  if (cached) return cached;

  const url =
    "https://archive-api.open-meteo.com/v1/archive" +
    `?latitude=${place.lat}&longitude=${place.lon}` +
    `&start_date=${START_YEAR}-01-01&end_date=${END_YEAR}-12-31` +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather request failed");
  const { daily } = (await res.json()) as ArchiveResponse;

  const hiSum = Array<number>(12).fill(0);
  const hiN = Array<number>(12).fill(0);
  const loSum = Array<number>(12).fill(0);
  const loN = Array<number>(12).fill(0);
  const rainSum = Array<number>(12).fill(0);
  const years = new Set<string>();

  daily.time.forEach((day, i) => {
    const month = Number(day.slice(5, 7)) - 1;
    years.add(day.slice(0, 4));
    const hi = daily.temperature_2m_max[i];
    const lo = daily.temperature_2m_min[i];
    const rain = daily.precipitation_sum[i];
    if (hi != null) {
      hiSum[month] += hi;
      hiN[month] += 1;
    }
    if (lo != null) {
      loSum[month] += lo;
      loN[month] += 1;
    }
    if (rain != null) rainSum[month] += rain;
  });

  const yearCount = Math.max(years.size, 1);
  const result: Monthly = {
    high: hiSum.map((s, m) => (hiN[m] ? s / hiN[m] : 0)),
    low: loSum.map((s, m) => (loN[m] ? s / loN[m] : 0)),
    rain: rainSum.map((s) => s / yearCount),
  };
  writeCache(place.id, result);
  return result;
}

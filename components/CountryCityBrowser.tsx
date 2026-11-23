"use client";

import { useEffect, useMemo, useState } from "react";
import { countryName } from "@/lib/countries";
import { makePlace, type Place } from "@/lib/places";

type CityData = typeof import("@/lib/cities-by-country");

const popLabel = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M people` : n >= 1000 ? `${Math.round(n / 1000)}k people` : `${n} people`;

type Props = {
  /** True if this city is already in the list the user is building. */
  isAdded: (p: Place) => boolean;
  onAdd: (p: Place) => void;
  /** True when no more cities can be added. */
  full: boolean;
};

/**
 * Pick a country, then pick from its biggest towns and cities.
 * The city data (about 145 KB) loads only when this panel is opened.
 */
export default function CountryCityBrowser({ isAdded, onAdd, full }: Props) {
  const [data, setData] = useState<CityData | null>(null);
  const [failed, setFailed] = useState(false);
  const [cc, setCc] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    import("@/lib/cities-by-country")
      .then((m) => alive && setData(m))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const countries = useMemo(
    () =>
      data
        ? Object.entries(data.CITIES_BY_COUNTRY)
            .map(([code, rows]) => ({ cc: code, name: countryName(code), n: rows.length }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [data],
  );

  if (failed) {
    return <p className="mt-3 text-sm text-warm">Couldn&apos;t load the city lists. Try the search box instead.</p>;
  }
  if (!data) return <div className="mt-3 h-24 animate-pulse rounded-xl bg-line/60" />;

  /* ----- step 2: the cities of one country ----- */
  if (cc) {
    const rows = data.CITIES_BY_COUNTRY[cc] ?? [];
    const name = countryName(cc);
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={() => {
            setCc(null);
            setQuery("");
          }}
          className="flex min-h-11 items-center gap-1 text-sm font-semibold text-accent"
        >
          <span aria-hidden>‹</span> All countries
        </button>
        <h3 className="font-display text-xl font-bold">{name}</h3>
        <p className="text-sm text-muted">Biggest towns and cities. Tap to add.</p>

        <ul className="mt-2 overflow-hidden rounded-xl border border-line bg-bg">
          {rows.map(([city, lat, lon, tz, pop]) => {
            const place = makePlace(city, name, lat, lon, data.TIMEZONES[tz], cc);
            const added = isAdded(place);
            return (
              <li key={`${city}-${lat}-${lon}`} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  disabled={added || full}
                  onClick={() => onAdd(place)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left active:bg-line/50 disabled:active:bg-transparent"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{city}</span>
                    <span className="block text-xs text-muted">{popLabel(pop)}</span>
                  </span>
                  <span
                    className={`shrink-0 text-sm font-semibold ${added ? "text-leaf" : full ? "text-muted" : "text-accent"}`}
                  >
                    {added ? "✓ Added" : full ? "List full" : "+ Add"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Can&apos;t see your town? Use the search box above. City data from{" "}
          <a href="https://www.geonames.org" target="_blank" rel="noopener noreferrer" className="underline">
            GeoNames
          </a>{" "}
          (CC BY 4.0).
        </p>
      </div>
    );
  }

  /* ----- step 1: choose a country ----- */
  const q = query.trim().toLowerCase();
  const shown = q ? countries.filter((c) => c.name.toLowerCase().includes(q)) : countries;

  return (
    <div className="mt-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search countries…"
        aria-label="Search countries"
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-line bg-bg px-4 placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <ul className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-line bg-bg">
        {shown.map((c) => (
          <li key={c.cc} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => setCc(c.cc)}
              className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left active:bg-line/50"
            >
              <span>{c.name}</span>
              <span className="flex items-center gap-2 text-sm text-muted">
                {c.n} {c.n === 1 ? "city" : "cities"} <span aria-hidden>›</span>
              </span>
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="px-4 py-3 text-sm text-muted">No country matches that.</li>}
      </ul>
    </div>
  );
}

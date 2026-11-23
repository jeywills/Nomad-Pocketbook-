"use client";

import { useEffect, useState } from "react";
import PageBanner from "@/components/PageBanner";
import CountryCityBrowser from "@/components/CountryCityBrowser";
import PlacePicker from "@/components/PlacePicker";
import type { Monthly } from "@/lib/climate";
import { useClimate } from "@/lib/useClimate";
import { CITIES } from "@/lib/costs";
import { DEFAULT_WEATHER_PLACES } from "@/lib/defaults";
import { trigger } from "@/lib/game";
import { useStored } from "@/lib/hooks";
import { samePlace, toPlace, type Place } from "@/lib/places";

const MAX_PLACES = 4;
const COLORS = ["#e4570f", "#1f9d6e", "#2f7de1", "#c026d3"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Metric = "high" | "low" | "rain" | "rainDays";
type Unit = "C" | "F";

const DEFAULT_PREFS = { unit: "C" as Unit, metric: "high" as Metric, lo: 20, hi: 30 };

const toUnit = (c: number, u: Unit) => (u === "C" ? c : (c * 9) / 5 + 32);
const fromUnit = (v: number, u: Unit) => (u === "C" ? v : ((v - 32) * 5) / 9);

function show(value: number, metric: Metric, unit: Unit): string {
  if (metric === "rainDays") return value < 1 ? value.toFixed(1) : String(Math.round(value));
  if (metric === "rain") return unit === "C" ? String(Math.round(value)) : (value / 25.4).toFixed(1);
  return String(Math.round(toUnit(value, unit)));
}

function cellColor(value: number, metric: Metric): string {
  if (metric === "rain") {
    const light = 96 - (Math.min(value, 300) / 300) * 44;
    return `hsl(210 80% ${light}%)`;
  }
  if (metric === "rainDays") {
    const light = 96 - (Math.min(value, 25) / 25) * 44;
    return `hsl(215 80% ${light}%)`;
  }
  const t = Math.max(0, Math.min(40, value));
  return `hsl(${220 - (t / 40) * 220} 75% 76%)`;
}

function Chart({
  places,
  data,
  metric,
  unit,
  band,
}: {
  places: Place[];
  data: Record<string, Monthly>;
  metric: Metric;
  unit: Unit;
  band?: [number, number];
}) {
  const W = 340;
  const H = 200;
  const pad = { l: 34, r: 8, t: 10, b: 22 };
  const series = places
    .map((p, i) => ({ p, color: COLORS[i], m: data[p.id] }))
    .filter((s) => s.m);
  if (series.length === 0) return null;

  const isRain = metric === "rain" || metric === "rainDays";
  const conv = (v: number) =>
    metric === "rainDays" ? v : metric === "rain" ? (unit === "C" ? v : v / 25.4) : toUnit(v, unit);
  const all = series.flatMap((s) => s.m[metric].map(conv));
  let min = isRain ? 0 : Math.min(...all);
  let max = Math.max(...all);
  if (max === min) max = min + 1;
  const span = max - min;
  if (!isRain) min -= span * 0.1;
  max += span * 0.1;

  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / 11;
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const ticks = [0, 1, 2, 3].map((k) => min + ((max - min) * k) / 3);
  const bandLo = band ? Math.max(min, conv(band[0])) : 0;
  const bandHi = band ? Math.min(max, conv(band[1])) : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-muted" role="img" aria-label="Monthly chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.2" />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="currentColor">
            {metric === "rain" && unit === "F" ? t.toFixed(1) : Math.round(t)}
          </text>
        </g>
      ))}
      {band && metric === "high" && bandHi > bandLo && (
        <rect
          x={pad.l}
          width={W - pad.l - pad.r}
          y={y(bandHi)}
          height={y(bandLo) - y(bandHi)}
          style={{ fill: "var(--leaf)" }}
          opacity="0.16"
        />
      )}
      {MONTHS.map((m, i) => (
        <text key={m} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor">
          {m[0]}
        </text>
      ))}
      {series.map((s) => (
        <g key={s.p.id}>
          <polyline
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            points={s.m[metric].map((v, i) => `${x(i)},${y(conv(v))}`).join(" ")}
          />
          {s.m[metric].map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(conv(v))} r="2.5" fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function WeatherPage() {
  const [places, setPlaces] = useStored<Place[]>("np.weather", DEFAULT_WEATHER_PLACES);
  const [prefs, setPrefs] = useStored("np.weather.prefs", DEFAULT_PREFS);
  const { data, failed, retry } = useClimate(places);
  const { unit, metric, lo, hi } = prefs;

  // Seeing real forecast data for the first time earns the "first forecast" quest.
  const hasForecast = Object.keys(data).length > 0;
  useEffect(() => {
    if (hasForecast) trigger({ type: "once", id: "first_forecast" });
  }, [hasForecast]);

  const addPlace = (p: Place) => {
    if (places.length >= MAX_PLACES || places.some((x) => samePlace(x, p))) return;
    setPlaces((prev) => [...prev, toPlace(p)]);
    trigger({ type: "weather_add" });
  };
  const [browsing, setBrowsing] = useState(false);
  const removePlace = (id: string) => setPlaces((prev) => prev.filter((p) => p.id !== id));
  const setPref = (patch: Partial<typeof DEFAULT_PREFS>) => setPrefs((prev) => ({ ...prev, ...patch }));
  const setComfort = (patch: Partial<typeof DEFAULT_PREFS>) => {
    setPref(patch);
    trigger({ type: "once", id: "comfort" });
  };

  const quick = CITIES.filter((c) => !places.some((p) => samePlace(p, c)))
    .slice(0, 12)
    .map(toPlace);

  const comfy = (m: Monthly, i: number) => m.high[i] >= lo && m.high[i] <= hi;
  const loaded = places.filter((p) => data[p.id]);
  const everywhere =
    loaded.length > 1 ? MONTHS.filter((_, i) => loaded.every((p) => comfy(data[p.id], i))) : [];

  const metricLabels: Record<Metric, string> = {
    high: "Daytime high",
    low: "Night low",
    rain: "Rain amount",
    rainDays: "Days with rain",
  };
  const unitLabel = metric === "rainDays" ? "days" : metric === "rain" ? (unit === "C" ? "mm" : "in") : `°${unit}`;

  return (
    <div className="space-y-5">
      <PageBanner
        tone="sun"
        emoji="🌤️"
        title="Weather by month"
        subtitle="A typical year for each city, averaged over 2019-2023, so you can compare more than one day."
      />

      <section className="space-y-3" aria-label="Places">
        <ul className="space-y-2">
          {places.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
              <span className="size-3 shrink-0 rounded-full" style={{ background: COLORS[i] }} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.name}</span>
                <span className="block truncate text-xs text-muted">{p.country}</span>
              </span>
              {failed[p.id] && (
                <button type="button" onClick={() => retry(p)} className="min-h-9 px-2 text-sm text-warm underline">
                  Retry
                </button>
              )}
              {!data[p.id] && !failed[p.id] && <span className="text-xs text-muted">Loading…</span>}
              <button
                type="button"
                onClick={() => removePlace(p.id)}
                aria-label={`Remove ${p.name}`}
                className="flex size-10 items-center justify-center text-xl text-muted"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <PlacePicker onPick={addPlace} quick={quick} disabled={places.length >= MAX_PLACES} />

        <button
          type="button"
          onClick={() => setBrowsing((b) => !b)}
          aria-expanded={browsing}
          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold ${
            browsing ? "border-accent bg-accent/10 text-accent" : "border-line bg-surface"
          }`}
        >
          <span aria-hidden>🌍</span> {browsing ? "Close country list" : "Browse by country"}
        </button>
        {browsing && (
          <CountryCityBrowser
            isAdded={(p) => places.some((x) => samePlace(x, p))}
            onAdd={addPlace}
            full={places.length >= MAX_PLACES}
          />
        )}
      </section>

      {places.length === 0 && (
        <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
          Add a city to see its year.
        </p>
      )}

      {places.length > 0 && (
        <>
          <section className="flex flex-wrap items-center gap-2" aria-label="Display options">
            <div
              className="grid w-full grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 sm:flex sm:w-auto"
              role="group"
              aria-label="Measure"
            >
              {(Object.keys(metricLabels) as Metric[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={metric === m}
                  onClick={() => setPref({ metric: m })}
                  className={`min-h-10 rounded-lg px-3 text-sm font-medium ${
                    metric === m ? "bg-accent text-accent-ink" : "text-muted"
                  }`}
                >
                  {metricLabels[m]}
                </button>
              ))}
            </div>
            <div className="flex rounded-xl border border-line bg-surface p-1" role="group" aria-label="Units">
              {(["C", "F"] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  aria-pressed={unit === u}
                  onClick={() => setPref({ unit: u })}
                  className={`min-h-10 min-w-12 rounded-lg px-3 text-sm font-medium ${
                    unit === u ? "bg-accent text-accent-ink" : "text-muted"
                  }`}
                >
                  °{u}
                </button>
              ))}
            </div>
          </section>

          <section className="card p-3">
            <h2 className="px-1 text-sm font-medium text-muted">
              {metric === "rainDays" ? "Days with rain per month" : `${metricLabels[metric]} (${unitLabel}) by month`}
            </h2>
            <Chart places={places} data={data} metric={metric} unit={unit} band={[lo, hi]} />
          </section>

          <section className="space-y-4" aria-label="Month by month">
            {places.map((p, i) => {
              const m = data[p.id];
              return (
                <div key={p.id}>
                  <h3 className="mb-1 flex items-center gap-2 text-sm font-medium">
                    <span className="size-2.5 rounded-full" style={{ background: COLORS[i] }} aria-hidden />
                    {p.name}
                  </h3>
                  {m ? (
                    <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
                      {MONTHS.map((mo, k) => {
                        const v = m[metric][k];
                        const ok = metric === "high" && comfy(m, k);
                        return (
                          <div
                            key={mo}
                            className={`rounded-lg px-1 py-1.5 text-center text-[#1b1b1b] ${
                              ok ? "ring-2 ring-accent" : ""
                            }`}
                            style={{ background: cellColor(v, metric) }}
                          >
                            <div className="text-[10px] opacity-70">{mo}</div>
                            <div className="text-sm font-semibold">{show(v, metric, unit)}</div>
                            {/* Rain views show both numbers: days with rain and how much fell */}
                            {metric === "rain" && (
                              <div className="text-[10px] opacity-75">{show(m.rainDays[k], "rainDays", unit)} days</div>
                            )}
                            {metric === "rainDays" && (
                              <div className="text-[10px] opacity-75">
                                {show(m.rain[k], "rain", unit)} {unit === "C" ? "mm" : "in"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-14 animate-pulse rounded-lg bg-line/60" />
                  )}
                </div>
              );
            })}
            {(metric === "rainDays" || metric === "rain") && (
              <p className="px-1 text-xs text-muted">
                A day with rain is a day with 1 mm or more. Counts are averages for each month over 2019-2023. They
                come from a weather model, which can count more light-rain days than a local station, especially in
                the tropics, so use them to compare places and seasons.
              </p>
            )}
          </section>

          <section className="card p-4">
            <h2 className="font-semibold">Comfortable months</h2>
            <p className="mt-1 text-sm text-muted">Daytime highs between</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                aria-label="Lowest comfortable high"
                value={Math.round(toUnit(lo, unit))}
                onChange={(e) => e.target.value !== "" && setComfort({ lo: fromUnit(Number(e.target.value), unit) })}
                className="h-12 w-20 rounded-xl border border-line bg-bg px-3 text-center"
              />
              <span className="text-muted">and</span>
              <input
                type="number"
                inputMode="numeric"
                aria-label="Highest comfortable high"
                value={Math.round(toUnit(hi, unit))}
                onChange={(e) => e.target.value !== "" && setComfort({ hi: fromUnit(Number(e.target.value), unit) })}
                className="h-12 w-20 rounded-xl border border-line bg-bg px-3 text-center"
              />
              <span className="text-muted">°{unit}</span>
            </div>

            <ul className="mt-4 space-y-3">
              {loaded.map((p) => {
                const good = MONTHS.filter((_, i) => comfy(data[p.id], i));
                return (
                  <li key={p.id}>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-sm text-muted">
                      {good.length ? good.join(", ") : "No months in this range"}
                    </p>
                  </li>
                );
              })}
              {loaded.length > 1 && (
                <li className="rounded-xl bg-accent/10 p-3">
                  <p className="text-sm font-medium">Comfortable in all of them</p>
                  <p className="text-sm text-muted">{everywhere.length ? everywhere.join(", ") : "No month fits everywhere"}</p>
                </li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

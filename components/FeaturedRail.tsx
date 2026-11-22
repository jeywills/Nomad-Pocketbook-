"use client";

import { useRouter } from "next/navigation";
import { CITIES, totalCost } from "@/lib/costs";
import { DEFAULT_WEATHER_PLACES } from "@/lib/defaults";
import { DEFAULT_CURRENCY, unitsPerUsd } from "@/lib/fx";
import { FEATURED, type Featured } from "@/lib/featured";
import { trigger } from "@/lib/game";
import { readStored, useStored, writeStored } from "@/lib/hooks";
import { toPlace, type Place } from "@/lib/places";

const MAX_WEATHER = 4;

export default function FeaturedRail() {
  const router = useRouter();
  const [currency] = useStored<string>("np.currency", DEFAULT_CURRENCY);

  const money = (usd: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(
      usd * unitsPerUsd(currency, null),
    );

  function explore(f: Featured) {
    const city = CITIES.find((c) => c.name === f.city);
    if (!city) return;
    const place = toPlace(city);
    const list = readStored<Place[]>("np.weather", DEFAULT_WEATHER_PLACES);
    const next = list.some((p) => p.id === place.id)
      ? list
      : list.length >= MAX_WEATHER
        ? [...list.slice(0, MAX_WEATHER - 1), place]
        : [...list, place];
    writeStored("np.weather", next);
    trigger({ type: "stamp", place, source: "weather" });
    router.push("/weather");
  }

  return (
    <section aria-labelledby="featured-title">
      <div className="flex items-baseline justify-between px-1">
        <h2 id="featured-title" className="font-display text-xl font-bold">
          Featured stops
        </h2>
        <span className="text-xs text-muted">Tap to explore</span>
      </div>
      <ul className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3">
        {FEATURED.map((f, i) => {
          const city = CITIES.find((c) => c.name === f.city);
          return (
            <li key={f.city} className="w-[72%] max-w-64 shrink-0 snap-start">
              <button
                type="button"
                onClick={() => explore(f)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`animate-rise relative block min-h-52 w-full overflow-hidden rounded-[28px] bg-gradient-to-br p-4 text-left text-white shadow-[0_16px_30px_-16px_rgb(var(--shadow)/0.6)] ${f.gradient}`}
              >
                <span className="absolute -top-3 -right-2 text-[88px] leading-none opacity-30" aria-hidden>
                  {f.emoji}
                </span>
                <span className="relative flex h-full min-h-44 flex-col justify-end">
                  <span className="text-4xl" aria-hidden>
                    {f.emoji}
                  </span>
                  <span className="mt-3 font-display text-2xl leading-tight font-bold">{f.city}</span>
                  <span className="mt-1 text-sm text-white/90">{f.tagline}</span>
                  {city && (
                    <span className="mt-3 inline-block self-start rounded-full bg-black/30 px-3 py-1 text-xs font-semibold">
                      About {money(totalCost(city.costs))} a month
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

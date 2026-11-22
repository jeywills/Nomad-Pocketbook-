"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import CountryList from "@/components/CountryList";
import PlacePicker from "@/components/PlacePicker";
import QuestPanel from "@/components/QuestPanel";
import ScratchMap, { type MapPin } from "@/components/ScratchMap";
import StampBadge from "@/components/StampBadge";
import VisitSheet, { type VisitTarget } from "@/components/VisitSheet";
import { SOVEREIGN, countryName } from "@/lib/countries";
import {
  BADGES,
  XP_PER_LEVEL,
  sovereignVisited,
  useGame,
  visitedCodes,
  wishedCountryCodes,
} from "@/lib/game";
import type { Place } from "@/lib/places";

const MIN_SLOTS = 8;
const TOTAL = SOVEREIGN.size;

type Panel = "none" | "city" | "countries";

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function PassportPage() {
  const { game, level, title, into, next, pct, streak } = useGame();
  const [target, setTarget] = useState<VisitTarget | null>(null);
  const [panel, setPanel] = useState<Panel>("none");
  const [freshCc, setFreshCc] = useState<string | null>(null);
  const freshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const visited = useMemo(() => visitedCodes(game), [game]);
  const wished = useMemo(() => wishedCountryCodes(game), [game]);
  const wishes = useMemo(() => [...game.wishlist].sort((a, b) => b.at.localeCompare(a.at)), [game.wishlist]);
  const wishPins: MapPin[] = game.wishlist
    .filter((w) => w.kind === "city" && w.lat !== undefined && w.lon !== undefined)
    .map((w) => ({ id: w.id, name: w.name, lat: w.lat as number, lon: w.lon as number }));
  const countryCount = sovereignVisited(game);
  const territories = [...visited].filter((cc) => !SOVEREIGN.has(cc)).length;
  const worldPct = Math.round((countryCount / TOTAL) * 100);

  const pins: MapPin[] = game.stamps
    .filter((s) => s.kind === "city" && s.lat !== undefined && s.lon !== undefined)
    .map((s) => ({ id: s.id, name: s.name, lat: s.lat as number, lon: s.lon as number }));

  const stamps = [...game.stamps].sort((a, b) => b.at.localeCompare(a.at));
  const slots = Math.max(MIN_SLOTS, Math.ceil((stamps.length + 1) / 4) * 4);
  const unlocked = BADGES.filter((b) => game.badges[b.id]).length;

  const pickCountry = useCallback((cc: string, name: string) => {
    setTarget({ kind: "country", cc, name: name || countryName(cc) });
    setPanel("none");
  }, []);

  const pickCity = (p: Place) => {
    setTarget({ kind: "city", id: p.id, name: p.name, cc: (p.cc ?? "").toUpperCase(), lat: p.lat, lon: p.lon });
    setPanel("none");
  };

  const scratched = useCallback((cc: string) => {
    clearTimeout(freshTimer.current);
    setFreshCc(cc);
    freshTimer.current = setTimeout(() => setFreshCc(null), 1800);
  }, []);

  const closeSheet = useCallback(() => setTarget(null), []);

  const summary = `${countryCount} of ${TOTAL} countries visited.`;

  return (
    <div className="space-y-6">
      <header className="animate-rise relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1e1b4b] to-[#7c2d12] p-5 text-white shadow-[0_18px_36px_-20px_rgb(var(--shadow)/0.6)]">
        <p className="text-xs font-bold tracking-widest text-white/75 uppercase">Nomad passport</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative flex size-24 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth="9" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#ffc857"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 263.9} 263.9`}
                className="transition-[stroke-dasharray] duration-700"
              />
            </svg>
            <span className="relative text-center">
              <span className="block text-[10px] font-bold tracking-wider uppercase">Level</span>
              <span className="block font-display text-4xl leading-none font-black">{level}</span>
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight font-black">{title}</h1>
            <p className="mt-1 text-sm text-white/90">
              {into}/{XP_PER_LEVEL} XP · {next} to the next level
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold">
              <span aria-hidden>🔥</span> {streak} day streak
            </p>
          </div>
        </div>
      </header>

      <section aria-labelledby="map-title">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 id="map-title" className="font-display text-xl font-bold">
              Scratch map
            </h2>
            <p className="text-sm text-muted">Tap a country to scratch it off, or save it to your wish list.</p>
          </div>
          <p className="text-right">
            <span className="font-display text-3xl leading-none font-black text-accent">{countryCount}</span>
            <span className="text-sm text-muted"> / {TOTAL}</span>
            <span className="block text-xs text-muted">
              {worldPct}% of the world{territories ? ` · +${territories} territor${territories > 1 ? "ies" : "y"}` : ""}
            </span>
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ffc857] to-[#f26b1d] transition-[width] duration-700"
            style={{ width: `${Math.max(countryCount ? 2 : 0, (countryCount / TOTAL) * 100)}%` }}
          />
        </div>

        <div className="mt-3">
          <ScratchMap
            visited={visited}
            wished={wished}
            pins={pins}
            wishPins={wishPins}
            selectedCc={target?.cc || null}
            freshCc={freshCc}
            summary={summary}
            onPick={pickCountry}
          />
        </div>

        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted" aria-label="Map key">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-gradient-to-br from-[#ffc857] to-[#f26b1d]" aria-hidden />
            Been there ({countryCount})
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="size-3 rounded-sm"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.55) 0 1.5px, transparent 1.5px 3.5px), linear-gradient(135deg, #5ec2ff, #2f6fe0)",
              }}
              aria-hidden
            />
            Want to go ({game.wishlist.length})
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-[var(--foil)]" aria-hidden />
            Not yet
          </li>
        </ul>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPanel((p) => (p === "city" ? "none" : "city"))}
            aria-expanded={panel === "city"}
            className={`min-h-12 rounded-2xl border px-3 text-sm font-semibold ${
              panel === "city" ? "border-accent bg-accent/10 text-accent" : "border-line bg-surface"
            }`}
          >
            📍 Add a city
          </button>
          <button
            type="button"
            onClick={() => setPanel((p) => (p === "countries" ? "none" : "countries"))}
            aria-expanded={panel === "countries"}
            className={`min-h-12 rounded-2xl border px-3 text-sm font-semibold ${
              panel === "countries" ? "border-accent bg-accent/10 text-accent" : "border-line bg-surface"
            }`}
          >
            🌍 All countries
          </button>
        </div>

        {panel === "city" && (
          <div className="mt-3">
            <PlacePicker onPick={pickCity} placeholder="Search a city you have visited…" />
          </div>
        )}
        {panel === "countries" && <CountryList game={game} onPick={pickCountry} />}
      </section>

      <section aria-labelledby="stamps-title">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="stamps-title" className="font-display text-xl font-bold">
            Stamps
          </h2>
          <span className="text-xs text-muted">{stamps.length} collected</span>
        </div>
        <ul className="card mt-3 grid grid-cols-4 gap-3 p-4">
          {Array.from({ length: slots }, (_, i) => {
            const s = stamps[i];
            return (
              <li key={i}>
                {s ? (
                  <button
                    type="button"
                    className="block w-full"
                    aria-label={`Open ${s.name}`}
                    onClick={() =>
                      setTarget(
                        s.kind === "country"
                          ? { kind: "country", cc: s.cc, name: s.name }
                          : { kind: "city", id: s.id, name: s.name, cc: s.cc, lat: s.lat, lon: s.lon },
                      )
                    }
                  >
                    <StampBadge name={s.name} cc={s.cc} date={shortDate(s.at)} />
                  </button>
                ) : (
                  <div
                    className="flex aspect-square items-center justify-center rounded-full border-2 border-dashed border-line text-lg text-line"
                    aria-hidden
                  >
                    ?
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {stamps.length === 0 && (
          <p className="mt-2 px-1 text-sm text-muted">
            No stamps yet. Scratch off a country or add a city, and only the places you have really been.
          </p>
        )}
      </section>

      <section aria-labelledby="wish-title">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="wish-title" className="font-display text-xl font-bold">
            Wish list
          </h2>
          <span className="text-xs text-muted">{wishes.length} to go</span>
        </div>
        {wishes.length === 0 ? (
          <p className="card mt-3 p-4 text-sm text-muted">
            Nowhere on your wish list yet. Tap any country on the map, or add a city, then choose “Add to wish list”.
            Wishes show up in blue.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {wishes.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() =>
                    setTarget(
                      w.kind === "country"
                        ? { kind: "country", cc: w.cc, name: w.name }
                        : { kind: "city", id: w.id, name: w.name, cc: w.cc, lat: w.lat, lon: w.lon },
                    )
                  }
                  className="flex min-h-11 items-center gap-2 rounded-full border-2 border-sky bg-sky/10 py-1 pr-4 pl-1.5 text-sm font-semibold text-sky"
                >
                  <span
                    className="flex size-8 items-center justify-center rounded-full bg-sky font-display text-xs font-black"
                    style={{ color: "var(--bg)" }}
                    aria-hidden
                  >
                    {w.cc || "??"}
                  </span>
                  {w.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="badges-title">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="badges-title" className="font-display text-xl font-bold">
            Badges
          </h2>
          <span className="text-xs text-muted">
            {unlocked}/{BADGES.length} unlocked
          </span>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const on = !!game.badges[b.id];
            return (
              <li key={b.id} className={`card flex flex-col items-center p-3 text-center ${on ? "" : "opacity-70"}`}>
                <span className={`text-4xl ${on ? "animate-bob" : "grayscale"}`} aria-hidden>
                  {on ? b.emoji : "🔒"}
                </span>
                <span className="mt-2 text-xs leading-tight font-bold">{b.name}</span>
                <span className="mt-1 text-[11px] leading-tight text-muted">{on ? "Unlocked" : b.hint}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <QuestPanel />

      <section className="card p-4">
        <h2 className="font-display text-xl font-bold">How to earn XP</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>🌍 +25 XP for each new country you scratch off</li>
          <li>🛂 +15 XP for each city you stamp</li>
          <li>💙 +5 XP for each place you add to your wish list</li>
          <li>🏅 +20 XP for every badge you unlock</li>
          <li>🧭 +10 to +30 XP for trying each tool</li>
          <li>🔥 +5 XP for visiting each day</li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          Progress is saved on this device only. Stamps are on your honour.
        </p>
      </section>

      {target && <VisitSheet target={target} game={game} onClose={closeSheet} onScratched={scratched} />}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CITIES } from "@/lib/costs";
import { countryName } from "@/lib/countries";
import { addCityToWeather } from "@/lib/explore";
import { trigger, visitedCodes, type GameState } from "@/lib/game";

/** What the sheet is about: a whole country, or one city. */
export type VisitTarget =
  | { kind: "country"; cc: string; name: string }
  | { kind: "city"; id: string; name: string; cc: string; lat?: number; lon?: number };

type Props = {
  target: VisitTarget;
  game: GameState;
  onClose: () => void;
  /** Called after a country is newly scratched off, so the map can sparkle. */
  onScratched: (cc: string) => void;
};

export default function VisitSheet({ target, game, onClose, onScratched }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);

  const cc = target.cc;
  const isCountry = target.kind === "country";
  const stampId = isCountry ? `country:${cc}` : target.id;
  const visited = isCountry ? visitedCodes(game).has(cc) : game.stamps.some((s) => s.id === target.id);
  const wished = game.wishlist.some((w) => w.id === stampId);
  const cityStamps = game.stamps.filter((s) => s.cc === cc && s.kind === "city");
  const wishedCities = game.wishlist.filter((w) => w.cc === cc && w.kind === "city");
  const countryLabel = cc ? countryName(cc) : "";
  const explore = CITIES.filter((c) => c.cc === cc).slice(0, 3);

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const place =
    target.kind === "country"
      ? { id: stampId, name: target.name, cc }
      : { id: target.id, name: target.name, cc, lat: target.lat, lon: target.lon };

  function mark() {
    trigger({ type: "visit_place", kind: target.kind, place });
    if (cc && !visitedCodes(game).has(cc)) onScratched(cc);
    onClose();
  }

  function remove() {
    trigger(target.kind === "country" ? { type: "unvisit_country", cc } : { type: "unvisit_place", id: target.id });
    onClose();
  }

  function toggleWish() {
    trigger(wished ? { type: "wish_remove", id: stampId } : { type: "wish_add", kind: target.kind, place });
    onClose();
  }

  const subtitle = isCountry
    ? visited
      ? cityStamps.length
        ? `Visited. Stamps: ${cityStamps.map((s) => s.name).join(", ")}`
        : "On your map"
      : wished
        ? "On your wish list"
        : wishedCities.length
          ? `Wish list: ${wishedCities.map((w) => w.name).join(", ")}`
          : "Not scratched off yet"
    : `${countryLabel || "Unknown country"}${visited ? " · stamped" : wished ? " · on your wish list" : ""}`;

  return (
    <div
      role="dialog"
      aria-label={`${target.name}: mark as visited or add to wish list`}
      className="animate-rise card fixed inset-x-3 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl p-4"
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-black ${
            wished && !visited ? "bg-sky text-white" : "bg-accent text-accent-ink"
          }`}
          style={wished && !visited ? { color: "var(--bg)" } : undefined}
        >
          {cc || "??"}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl leading-tight font-bold">{target.name}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-11 items-center justify-center rounded-full text-xl text-muted"
        >
          ×
        </button>
      </div>

      {!visited ? (
        <div className="mt-3 space-y-2">
          <button
            ref={primary}
            type="button"
            onClick={mark}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-ink"
          >
            <span aria-hidden>✨</span>
            {isCountry ? "I have been here" : `I have been to ${target.name}`}
          </button>
          <button
            type="button"
            onClick={toggleWish}
            aria-pressed={wished}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 font-semibold ${
              wished ? "border-sky bg-sky/15 text-sky" : "border-sky text-sky"
            }`}
          >
            <span aria-hidden>{wished ? "★" : "♡"}</span>
            {wished ? "On your wish list. Tap to remove" : "Add to wish list"}
          </button>
        </div>
      ) : confirming ? (
        <div className="mt-3 flex gap-2">
          <button
            ref={primary}
            type="button"
            onClick={remove}
            className="min-h-12 flex-1 rounded-2xl bg-warm font-semibold text-[#1e2a38]"
          >
            {isCountry && cityStamps.length
              ? `Remove with ${cityStamps.length} stamp${cityStamps.length > 1 ? "s" : ""}`
              : "Yes, remove it"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="min-h-12 rounded-2xl border border-line px-4 font-semibold"
          >
            Keep
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <p className="flex flex-1 items-center gap-2 font-semibold text-leaf">
            <span aria-hidden>✓</span> You have been here
          </p>
          <button
            ref={primary}
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-11 rounded-xl border border-line px-3 text-sm font-semibold text-muted"
          >
            Remove
          </button>
        </div>
      )}

      {explore.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-xs font-bold tracking-wider text-muted uppercase">Explore</p>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {explore.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    addCityToWeather(c);
                    router.push("/weather");
                  }}
                  className="min-h-10 rounded-full border border-line px-3 text-sm"
                >
                  🌤️ {c.name} weather
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">Stamps are on your honour: only mark places you have really been.</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import CountryCityBrowser from "@/components/CountryCityBrowser";
import PlacePicker from "@/components/PlacePicker";
import { CITIES } from "@/lib/costs";
import { fromDay, isIsoDate, toDay } from "@/lib/days";
import { toPlace, type Place } from "@/lib/places";
import { MAX_LEG_DAYS } from "@/lib/trip";

type Props = {
  /** Suggested first day: the day after the last stop. */
  defaultStart: string;
  onAdd: (place: Place, start: string, end: string) => void;
};

const field =
  "mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3 focus:border-accent focus:outline-none";

export default function LegForm({ defaultStart, onAdd }: Props) {
  const [place, setPlace] = useState<Place | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [browsing, setBrowsing] = useState(false);
  const [error, setError] = useState("");

  const first = start || defaultStart;

  function choose(p: Place) {
    setPlace(toPlace(p));
    setBrowsing(false);
    setError("");
  }

  /** "Nights" buttons: set the last day from the first day. */
  function setNights(days: number) {
    if (!isIsoDate(first)) return setError("Enter the first day first.");
    setStart(first);
    setEnd(fromDay(toDay(first) + days - 1));
    setError("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!place) return setError("Choose a city.");
    if (!place.cc) return setError("That place has no country code. Try a nearby city.");
    if (!isIsoDate(first)) return setError("Enter the first day.");
    if (!isIsoDate(end)) return setError("Enter the last day.");
    if (end < first) return setError("The last day can't be before the first day.");
    if (toDay(end) - toDay(first) + 1 > MAX_LEG_DAYS) return setError(`A stop can be at most ${MAX_LEG_DAYS} days.`);
    setError("");
    onAdd(place, first, end);
    setPlace(null);
    setStart("");
    setEnd("");
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      {place ? (
        <div className="flex items-center gap-3 rounded-xl border border-accent bg-accent/10 px-3 py-2">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{place.name}</span>
            <span className="block truncate text-xs text-muted">{place.country}</span>
          </span>
          <button
            type="button"
            onClick={() => setPlace(null)}
            className="min-h-10 rounded-lg px-2 text-sm font-semibold text-accent"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <PlacePicker
            onPick={choose}
            placeholder="Search a city to visit…"
            quick={CITIES.slice(0, 8).map(toPlace)}
          />
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
          {browsing && <CountryCityBrowser isAdded={() => false} onAdd={choose} full={false} />}
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">First day</span>
          <input type="date" value={first} onChange={(e) => setStart(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Last day</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={field} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Set the length of the stop">
        <span className="text-xs text-muted">Length:</span>
        {[
          [7, "1 week"],
          [14, "2 weeks"],
          [30, "1 month"],
          [60, "2 months"],
          [90, "3 months"],
        ].map(([n, label]) => (
          <button
            key={n}
            type="button"
            onClick={() => setNights(n as number)}
            className="min-h-10 rounded-full border border-line bg-surface px-3 text-sm"
          >
            {label}
          </button>
        ))}
      </div>

      <p role="alert" className="min-h-5 text-sm text-danger">
        {error}
      </p>

      <button
        type="submit"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-ink"
      >
        <span aria-hidden>＋</span> Add stop
      </button>
    </form>
  );
}

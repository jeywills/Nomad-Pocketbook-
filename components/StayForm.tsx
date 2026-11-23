"use client";

import { useMemo, useState } from "react";
import { sovereignList } from "@/lib/countries";
import { isIsoDate } from "@/lib/days";

export type NewStay = { cc: string; start: string; end: string | null };

type Props = {
  /** Today as YYYY-MM-DD. */
  todayIso: string;
  defaults: { start: string; end: string };
  onAdd: (stay: NewStay) => void;
};

export default function StayForm({ todayIso, defaults, onAdd }: Props) {
  const countries = useMemo(() => sovereignList(), []);
  const [cc, setCc] = useState("");
  const [start, setStart] = useState(defaults.start);
  const [end, setEnd] = useState(defaults.end);
  const [ongoing, setOngoing] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cc) return setError("Choose a country.");
    if (!isIsoDate(start)) return setError("Enter the first day.");
    if (!ongoing) {
      if (!isIsoDate(end)) return setError("Enter the last day, or tick “I am still here”.");
      if (end < start) return setError("The last day can't be before the first day.");
    } else if (start > todayIso) {
      return setError("A stay that is still going has to start today or earlier.");
    }
    setError("");
    onAdd({ cc, start, end: ongoing ? null : end });
    setStart("");
    setEnd("");
    setOngoing(false);
  }

  const field =
    "mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3 focus:border-accent focus:outline-none disabled:opacity-50";

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Country</span>
        <select value={cc} onChange={(e) => setCc(e.target.value)} className={field}>
          <option value="">Choose a country…</option>
          {countries.map((c) => (
            <option key={c.cc} value={c.cc}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">First day</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Last day</span>
          <input
            type="date"
            value={ongoing ? "" : end}
            disabled={ongoing}
            onChange={(e) => setEnd(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={ongoing}
            onChange={(e) => setOngoing(e.target.checked)}
            className="size-5 accent-[var(--accent)]"
          />
          I am still here
        </label>
        <button
          type="button"
          onClick={() => {
            setStart(todayIso);
            setOngoing(true);
          }}
          className="min-h-11 rounded-full border border-line px-3 text-sm font-semibold"
        >
          Start from today
        </button>
      </div>

      <p role="alert" className="min-h-5 text-sm text-danger">
        {error}
      </p>

      <button
        type="submit"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-ink"
      >
        <span aria-hidden>＋</span> Add stay
      </button>
    </form>
  );
}

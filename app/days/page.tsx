"use client";

import { useState } from "react";
import DayCalendar from "@/components/DayCalendar";
import PageBanner from "@/components/PageBanner";
import StayForm, { type NewStay } from "@/components/StayForm";
import VisaLimits from "@/components/VisaLimits";
import { countryName } from "@/lib/countries";
import {
  TAX_YEAR_STARTS,
  buildCsv,
  ccColor,
  formatDay,
  limitState,
  plural,
  schengenPlan,
  splitDays,
  stayInterval,
  taxYear,
  toDay,
  type Stay,
} from "@/lib/days";
import { trigger } from "@/lib/game";
import { useNow, useStored } from "@/lib/hooks";

const NO_STAYS: Stay[] = [];
const DEFAULT_PREFS = { taxStart: "01-01", threshold: 183 };
const SCHENGEN_LIMIT = 90;

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** "12 days left before 183", "Reached the 183-day limit" or "3 days over the 183-day limit". */
function limitText(used: number, limit: number): string {
  if (used < limit) return `${plural(limit - used, "day")} left before ${limit}`;
  if (used === limit) return `Reached the ${limit}-day limit`;
  return `${plural(used - limit, "day")} over the ${limit}-day limit`;
}

export default function DaysPage() {
  const now = useNow();
  const [stays, setStays] = useStored<Stay[]>("np.stays", NO_STAYS);
  const [prefs, setPrefs] = useStored("np.days.prefs", DEFAULT_PREFS);
  const [offset, setOffset] = useState(0);
  const [selectedIso, setSelectedIso] = useState("");
  const [prefill, setPrefill] = useState({ start: "", end: "", nonce: 0 });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!now) {
    return (
      <div>
        <PageBanner tone="dusk" emoji="🗓️" title="Day tracker" subtitle="Loading your calendar…" />
        <div className="mt-5 h-40 animate-pulse rounded-3xl bg-line/60" />
      </div>
    );
  }

  const todayIso = new Date(now).toLocaleDateString("en-CA");
  const today = toDay(todayIso);
  const ty = taxYear(prefs.taxStart, today, offset);
  const totals = [...splitDays(stays, ty.lo, ty.hi, today)].sort((a, b) => b[1].total - a[1].total);
  const threshold = Math.max(1, prefs.threshold || 183);
  const schengen = schengenPlan(stays, today);
  const sUsed = schengen.used;
  const sState = limitState(sUsed, SCHENGEN_LIMIT);
  const planState = limitState(schengen.peak, SCHENGEN_LIMIT);
  const sorted = [...stays].sort((a, b) => b.start.localeCompare(a.start));
  const onDay = selectedIso
    ? stays.filter((s) => {
        const iv = stayInterval(s, today);
        const n = toDay(selectedIso);
        return iv && n >= iv[0] && n <= iv[1];
      })
    : [];

  function addStay(n: NewStay) {
    setStays((prev) => [...prev, { id: newId(), ...n }]);
    trigger({ type: "once", id: "first_stay" });
    // A stay that has started is a place you have really been: scratch it off the passport map.
    if (n.start <= todayIso) {
      trigger({
        type: "visit_place",
        kind: "country",
        place: { id: `country:${n.cc}`, name: countryName(n.cc), cc: n.cc },
      });
    }
  }

  function exportCsv() {
    const csv = buildCsv(stays, today, countryName, {
      label: ty.label,
      totals: new Map(totals.map(([cc, t]) => [cc, { soFar: t.soFar, planned: t.planned }])),
    });
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `day-tracker-${todayIso}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <PageBanner
        tone="dusk"
        emoji="🗓️"
        title="Day tracker"
        subtitle="Log where you stay and see your days per country for each tax year."
      />

      <section className="card p-4" aria-labelledby="add-title" id="stay-form">
        <h2 id="add-title" className="font-display text-xl font-bold">
          Log a stay
        </h2>
        <p className="mt-1 mb-3 text-sm text-muted">Tap a day on the calendar to fill in the dates.</p>
        <StayForm key={prefill.nonce} todayIso={todayIso} defaults={prefill} onAdd={addStay} />
      </section>

      <section className="card p-4" aria-labelledby="totals-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="totals-title" className="font-display text-xl font-bold">
              Days per country
            </h2>
            <p className="text-sm text-muted">{ty.label}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setOffset((o) => o - 1)}
              aria-label="Previous tax year"
              className="flex size-11 items-center justify-center rounded-xl border border-line text-lg"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setOffset((o) => Math.min(0, o + 1))}
              disabled={offset === 0}
              aria-label="Next tax year"
              className="flex size-11 items-center justify-center rounded-xl border border-line text-lg disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_6.5rem] gap-3">
          <label className="block">
            <span className="text-xs font-medium text-muted">Tax year starts</span>
            <select
              value={prefs.taxStart}
              onChange={(e) => {
                setPrefs((p) => ({ ...p, taxStart: e.target.value }));
                setOffset(0);
              }}
              className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
            >
              {TAX_YEAR_STARTS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Day limit</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={366}
              value={prefs.threshold}
              onChange={(e) => setPrefs((p) => ({ ...p, threshold: Number(e.target.value) }))}
              className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
            />
          </label>
        </div>

        {totals.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
            No days logged in this tax year yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {totals.map(([cc, t]) => {
              const n = t.total;
              const st = limitState(n, threshold);
              return (
                <li key={cc}>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: ccColor(cc) }}
                      aria-hidden
                    >
                      {cc}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{countryName(cc)}</span>
                        <span className="text-sm tabular-nums">
                          <span className="font-bold">{n}</span>
                          <span className="text-muted"> / {threshold} days</span>
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${Math.min(100, (n / threshold) * 100)}%` }} />
                      </div>
                      <p className={`mt-0.5 text-xs font-medium ${st.tone}`}>{limitText(n, threshold)}</p>
                      {t.planned > 0 && (
                        <p className="text-xs text-muted">
                          {t.soFar} so far + {t.planned} planned
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">
          Both your first and last day count, and overlapping stays in the same country count once. The totals include
          trips you have planned for later in the tax year, shown as &ldquo;planned&rdquo;, so you can see where you would
          end up. Many countries use 183 days as the line for tax residency, but rules differ a lot, so check yours.
        </p>
      </section>

      <section className="card p-4" aria-labelledby="schengen-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="schengen-title" className="font-display text-xl font-bold">
            Schengen 90 / 180
          </h2>
          <span className={`text-sm font-bold ${sState.tone}`}>
            {sUsed > SCHENGEN_LIMIT
              ? `${plural(sUsed - SCHENGEN_LIMIT, "day")} over`
              : sUsed === SCHENGEN_LIMIT
                ? "Limit reached"
                : `${plural(SCHENGEN_LIMIT - sUsed, "day")} left`}
          </span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className={`h-full rounded-full ${sState.bar}`} style={{ width: `${Math.min(100, (sUsed / SCHENGEN_LIMIT) * 100)}%` }} />
        </div>
        <p className="mt-2 text-sm">
          <span className="font-bold tabular-nums">{sUsed}</span> of {SCHENGEN_LIMIT} days used so far, in the last 180
          days (since {formatDay(today - 179, false)}).
        </p>

        {schengen.hasPlanned && (
          <div className="mt-3 rounded-xl bg-bg p-3" aria-live="polite">
            <p className="text-xs font-bold tracking-wider text-muted uppercase">With your planned stays</p>
            <p className={`mt-1 text-sm font-semibold ${planState.tone}`}>
              {schengen.peak > SCHENGEN_LIMIT
                ? `You'd be ${plural(schengen.peak - SCHENGEN_LIMIT, "day")} over, reaching ${schengen.peak} days on ${formatDay(schengen.peakDay)}.`
                : schengen.peak === SCHENGEN_LIMIT
                  ? `You'd use all ${SCHENGEN_LIMIT} days on ${formatDay(schengen.peakDay)}.`
                  : `Your busiest point is ${schengen.peak} of ${SCHENGEN_LIMIT} days, on ${formatDay(schengen.peakDay)}.`}
            </p>
            <p className="mt-1 text-xs text-muted">
              The rule looks at the 180 days before each day, so a planned trip is checked on every day it covers.
            </p>
          </div>
        )}

        <p className="mt-2 text-xs text-muted">
          Counts days in any of the 29 Schengen countries together, including trips you have planned for later. It
          applies to visitors who don&apos;t have a residence permit or EU/EEA citizenship. Check the official rules
          before you travel.
        </p>
      </section>

      <VisaLimits stays={stays} today={today} />

      <section className="card p-4" aria-labelledby="cal-title">
        <h2 id="cal-title" className="mb-3 font-display text-xl font-bold">
          Calendar
        </h2>
        <DayCalendar
          stays={stays}
          today={today}
          selectedIso={selectedIso}
          onSelect={(iso) => {
            setSelectedIso(iso);
            setPrefill((p) => ({ start: iso, end: iso, nonce: p.nonce + 1 }));
          }}
        />
        {selectedIso && (
          <p className="mt-3 rounded-xl bg-bg p-3 text-sm" aria-live="polite">
            <span className="font-semibold">{formatDay(toDay(selectedIso))}:</span>{" "}
            {onDay.length ? [...new Set(onDay.map((s) => countryName(s.cc)))].join(", ") : "nothing logged. The form above now has this date."}
          </p>
        )}
      </section>

      <section className="card p-4" aria-labelledby="stays-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="stays-title" className="font-display text-xl font-bold">
            Your stays
          </h2>
          <button
            type="button"
            onClick={exportCsv}
            disabled={stays.length === 0}
            className="min-h-11 rounded-xl border border-line px-3 text-sm font-semibold disabled:opacity-40"
          >
            ⬇ Export CSV
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing logged yet. Add your first stay above.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {sorted.map((s) => {
              const iv = stayInterval(s, today);
              const days = iv ? iv[1] - iv[0] + 1 : 0;
              const planned = toDay(s.start) > today;
              return (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: ccColor(s.cc) }}
                    aria-hidden
                  >
                    {s.cc}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{countryName(s.cc)}</p>
                    <p className="text-xs text-muted">
                      {s.end
                        ? `${formatDay(toDay(s.start))} to ${formatDay(toDay(s.end))}`
                        : `Since ${formatDay(toDay(s.start))} · still here`}
                      {" · "}
                      {planned ? (iv ? `planned, ${plural(days, "day")}` : "planned") : plural(days, "day")}
                    </p>
                  </div>
                  {s.end === null && !planned && (
                    <button
                      type="button"
                      onClick={() => setStays((prev) => prev.map((x) => (x.id === s.id ? { ...x, end: todayIso } : x)))}
                      className="min-h-10 shrink-0 rounded-lg border border-line px-2.5 text-xs font-semibold"
                    >
                      End today
                    </button>
                  )}
                  {confirmId === s.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setStays((prev) => prev.filter((x) => x.id !== s.id));
                        setConfirmId(null);
                      }}
                      className="min-h-10 shrink-0 rounded-lg bg-danger px-2.5 text-xs font-bold"
                      style={{ color: "var(--bg)" }}
                    >
                      Delete?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(s.id)}
                      aria-label={`Delete stay in ${countryName(s.cc)}`}
                      className="flex size-10 shrink-0 items-center justify-center text-xl text-muted"
                    >
                      ×
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">
          Saved on this device only. The CSV has every stay plus the totals for the tax year shown above.
        </p>
      </section>

      <p className="rounded-2xl border border-line p-4 text-xs text-muted">
        This is a personal log to help you keep records. It isn&apos;t tax or legal advice, and residency rules vary by
        country and by person. Confirm the rules that apply to you with a qualified tax adviser or the relevant
        authority.
      </p>
    </div>
  );
}

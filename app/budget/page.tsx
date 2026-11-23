"use client";

import { useEffect, useMemo, useState } from "react";
import PageBanner from "@/components/PageBanner";
import { trigger } from "@/lib/game";
import {
  applyFx,
  CATEGORIES,
  CITIES,
  convertBudget,
  totalCost,
  type City,
} from "@/lib/costs";
import { DEFAULT_BUDGET, parseAmount, type BudgetMode, type BudgetSaved } from "@/lib/budgetPrefs";
import { BASE_RATES_DATE, CURRENCIES, DEFAULT_CURRENCY, fxFactor, unitsPerUsd } from "@/lib/fx";
import { useLiveRates, useStored } from "@/lib/hooks";

type Mode = BudgetMode;
type Saved = BudgetSaved;

const lisbon = CITIES.find((c) => c.name === "Lisbon") as City;
const bangkok = CITIES.find((c) => c.name === "Bangkok") as City;
const DEFAULTS = DEFAULT_BUDGET;

const num = parseAmount;

function currencyName(code: string): string {
  try {
    return new Intl.DisplayNames(undefined, { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default function BudgetPage() {
  const [saved, setSaved] = useStored<Saved>("np.budget", DEFAULTS);
  const [currency, setCurrency] = useStored<string>("np.currency", DEFAULT_CURRENCY);
  const [showAll, setShowAll] = useState(false);
  const [picking, setPicking] = useState(false);
  const patch = (p: Partial<Saved>) => setSaved((prev) => ({ ...prev, ...p }));

  const live = saved.live !== false;
  const { rates, failed: ratesFailed } = useLiveRates(live);
  const liveRates = live && rates ? rates.rates : null;
  const cities = useMemo(
    () => (liveRates ? CITIES.map((c) => applyFx(c, liveRates)) : CITIES),
    [liveRates],
  );
  const byId = useMemo(() => Object.fromEntries(cities.map((c) => [c.id, c])), [cities]);

  const from = byId[saved.fromId] ?? byId[lisbon.id];
  const to = byId[saved.toId] ?? byId[bangkok.id];
  const toMove = liveRates ? (fxFactor(to.currency, liveRates) - 1) * 100 : 0;

  /* Everything is calculated in USD, then shown in the chosen currency. */
  const rate = unitsPerUsd(currency, liveRates);
  const formatter = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }),
    [currency],
  );
  const money = (usd: number) => formatter.format(usd * rate);
  const toUsd = (amount: number) => amount / rate;

  const spendUsd = {
    housing: toUsd(num(saved.split.housing)),
    food: toUsd(num(saved.split.food)),
    transport: toUsd(num(saved.split.transport)),
    utilities: toUsd(num(saved.split.utilities)),
    leisure: toUsd(num(saved.split.leisure)),
  };
  const splitTotalUsd = Object.values(spendUsd).reduce((a, b) => a + b, 0);
  const totalUsd = saved.mode === "total" ? toUsd(num(saved.total)) : splitTotalUsd;
  const input =
    saved.mode === "total"
      ? ({ mode: "total", total: totalUsd } as const)
      : ({ mode: "split", spend: spendUsd } as const);

  const hasInput = totalUsd > 0;
  const result = hasInput ? convertBudget(from, to, input) : null;
  const resultTotal = result ? totalCost(result) : 0;
  const delta = hasInput ? (resultTotal - totalUsd) / totalUsd : 0;

  const ranked = hasInput
    ? cities
        .filter((c) => c.id !== from.id)
        .map((c) => ({ city: c, cost: totalCost(convertBudget(from, c, input)) }))
        .sort((a, b) => a.cost - b.cost)
    : [];
  const visible = showAll ? ranked : ranked.slice(0, 8);
  const maxCost = ranked.length ? ranked[ranked.length - 1].cost : 1;

  const cityOptions = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));

  // Running the checker earns XP, and finding a much cheaper place earns a bonus.
  const comparing = from.id !== to.id;
  useEffect(() => {
    if (!hasInput) return;
    trigger({ type: "once", id: "budget_run" });
    if (comparing) trigger({ type: "saving", pct: -delta });
  }, [hasInput, comparing, delta]);

  function chooseTarget(city: City) {
    patch({ toId: city.id });
  }

  /** Switch currency and convert any amounts already typed, so they keep their real value. */
  function chooseCurrency(next: string) {
    if (next !== currency) {
      const factor = unitsPerUsd(next, liveRates) / rate;
      const conv = (s: string | undefined) => {
        const n = num(s);
        return n ? String(Math.round(n * factor)) : (s ?? "");
      };
      setSaved((prev) => ({
        ...prev,
        total: conv(prev.total),
        split: Object.fromEntries(
          Object.entries(prev.split).map(([k, v]) => [k, conv(v)]),
        ) as Saved["split"],
      }));
      setCurrency(next);
      trigger({ type: "once", id: "currency" });
    }
    setPicking(false);
  }

  return (
    <div className="space-y-5">
      <PageBanner
        tone="jungle"
        emoji="🪙"
        title="Budget checker"
        subtitle="Tell us what you spend now and we will estimate what the same lifestyle costs somewhere else."
      >
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setPicking((p) => !p)}
            aria-expanded={picking}
            aria-controls="currency-picker"
            className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/35 bg-white/15 px-4 text-sm font-bold text-white"
          >
            <span aria-hidden>💱</span>
            {currency}
            <span aria-hidden>▾</span>
          </button>
        </div>
      </PageBanner>

      {picking && (
        <section
          id="currency-picker"
          aria-label="Choose currency"
          className="card p-3"
        >
          <p className="px-1 pb-2 text-sm font-medium">Choose your currency</p>
          <ul className="grid grid-cols-2 gap-2">
            {CURRENCIES.map((code) => (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => chooseCurrency(code)}
                  aria-pressed={code === currency}
                  className={`flex min-h-12 w-full flex-col items-start justify-center rounded-xl border px-3 text-left ${
                    code === currency ? "border-accent bg-accent/10" : "border-line"
                  }`}
                >
                  <span className="text-sm font-semibold">{code}</span>
                  <span className="w-full truncate text-xs text-muted">{currencyName(code)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="px-1 pt-2 text-xs text-muted">
            Amounts you have already typed are converted so they keep the same value.
          </p>
        </section>
      )}

      <section className="space-y-4 card p-4">
        <label className="block">
          <span className="text-sm font-medium">Where you live now</span>
          <select
            value={from.id}
            onChange={(e) => patch({ fromId: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
          >
            {cityOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </label>

        <div className="flex rounded-xl border border-line bg-bg p-1" role="group" aria-label="How to enter spending">
          {(
            [
              ["total", "One total"],
              ["split", "By category"],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={saved.mode === m}
              onClick={() => patch({ mode: m })}
              className={`min-h-10 flex-1 rounded-lg text-sm font-medium ${
                saved.mode === m ? "bg-accent text-accent-ink" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {saved.mode === "total" ? (
          <label className="block">
            <span className="text-sm font-medium">Monthly spending ({currency})</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 2500"
              value={saved.total}
              onChange={(e) => patch({ total: e.target.value })}
              className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
            />
            <span className="mt-1 block text-xs text-muted">
              We split this using a typical spending mix for {from.name}.
            </span>
          </label>
        ) : (
          <div className="space-y-3">
            {CATEGORIES.map((c) => (
              <label key={c.key} className="block">
                <span className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">
                    {c.label} <span className="font-normal text-muted">({currency})</span>
                  </span>
                  <span className="text-xs text-muted">{c.hint}</span>
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={saved.split[c.key] ?? ""}
                  onChange={(e) => patch({ split: { ...saved.split, [c.key]: e.target.value } })}
                  className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
                />
              </label>
            ))}
            <p className="text-sm text-muted">
              Total: <span className="font-medium text-ink">{money(splitTotalUsd)}</span> per month
            </p>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium">Where you are thinking of going</span>
          <select
            value={to.id}
            onChange={(e) => byId[e.target.value] && chooseTarget(byId[e.target.value])}
            className="mt-1 h-12 w-full rounded-xl border border-line bg-bg px-3"
          >
            {cityOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl bg-bg p-3">
          <label className="flex min-h-10 items-center justify-between gap-3">
            <span className="text-sm font-medium">Use live exchange rates</span>
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => patch({ live: e.target.checked })}
              className="size-5 accent-[var(--accent)]"
            />
          </label>
          <p className="mt-1 text-xs text-muted">
            {!live
              ? "Showing the baseline estimates from " + BASE_RATES_DATE + "."
              : rates
                ? `Rates updated ${new Date(rates.updated).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}. Local prices are held steady, so a currency that strengthens makes a city cost more.`
                : ratesFailed
                  ? "Couldn't load live rates, so you're seeing the baseline estimates."
                  : "Loading live rates…"}
          </p>
        </div>
      </section>

      {!result && (
        <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
          Enter your monthly spending to see the estimate.
        </p>
      )}

      {result && (
        <>
          <section className="rounded-2xl bg-accent p-5 text-accent-ink" aria-live="polite">
            <p className="text-sm opacity-90">Expected budget in {to.name}</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">
              {money(resultTotal)}
              <span className="text-lg font-normal opacity-80"> / month</span>
            </p>
            <p className="mt-2 text-sm opacity-90">
              {from.id === to.id
                ? "That is the city you already live in."
                : Math.abs(delta) < 0.005
                  ? `About the same as the ${money(totalUsd)} you spend now.`
                  : `${Math.round(Math.abs(delta) * 100)}% ${delta < 0 ? "less" : "more"} than the ${money(
                      totalUsd,
                    )} you spend now, which is ${money(Math.abs(resultTotal - totalUsd))} ${
                      delta < 0 ? "saved" : "extra"
                    } each month.`}
            </p>
            {Math.abs(toMove) >= 0.5 && (
              <p className="mt-2 text-xs opacity-80">
                The {to.currency} has {toMove > 0 ? "strengthened" : "weakened"} {Math.abs(toMove).toFixed(1)}% against
                the dollar since {BASE_RATES_DATE}, which is already included.
              </p>
            )}
          </section>

          <section className="card p-4">
            <h2 className="font-semibold">Where it changes</h2>
            <ul className="mt-2 divide-y divide-line">
              {CATEGORIES.map((c) => {
                const before =
                  saved.mode === "total"
                    ? totalUsd * (from.costs[c.key] / totalCost(from.costs))
                    : spendUsd[c.key];
                return (
                  <li key={c.key} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm">{c.label}</span>
                    <span className="text-sm tabular-nums">
                      <span className="text-muted">{money(before)}</span>
                      <span className="mx-1.5 text-muted">→</span>
                      <span className="font-semibold">{money(result[c.key])}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-4">
            <h2 className="font-semibold">Same lifestyle elsewhere</h2>
            <p className="mt-1 text-sm text-muted">Cheapest first. Tap a city to look at it above.</p>
            <ul className="mt-3 space-y-2">
              {visible.map(({ city, cost }) => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => {
                      chooseTarget(city);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="block min-h-12 w-full rounded-xl px-1 text-left active:bg-line/40"
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {city.name}
                        <span className="font-normal text-muted">, {city.country}</span>
                      </span>
                      <span className="text-sm tabular-nums">{money(cost)}</span>
                    </span>
                    <span className="mt-1 block h-1.5 rounded-full bg-line">
                      <span
                        className={`block h-full rounded-full ${city.id === to.id ? "bg-warm" : "bg-accent"}`}
                        style={{ width: `${Math.max(4, (cost / maxCost) * 100)}%` }}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {ranked.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="mt-2 min-h-11 w-full text-sm font-medium text-accent"
              >
                {showAll ? "Show fewer" : `Show all ${ranked.length} cities`}
              </button>
            )}
          </section>
        </>
      )}

      <p className="px-1 text-xs text-muted">
        Estimates only. City costs are rough monthly averages for one person in a comfortable mid-range lifestyle and are
        not live prices. Only the exchange-rate part is live. Your own rent and habits will move the real number.{" "}
        <a
          href="https://www.exchangerate-api.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Rates By Exchange Rate API
        </a>
      </p>
    </div>
  );
}

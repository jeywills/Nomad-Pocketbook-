"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageBanner from "@/components/PageBanner";
import VisaCard from "@/components/VisaCard";
import { countryName } from "@/lib/countries";
import { useQueryParam } from "@/lib/hooks";
import { VISAS, VISAS_CHECKED, type Region } from "@/lib/visas";

type Filter = "all" | Region;
type Sort = "az" | "longest";

const REGIONS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "europe", label: "Europe" },
  { key: "sea", label: "SE Asia" },
  { key: "latam", label: "Latin America" },
];

const checkedLabel = new Date(`${VISAS_CHECKED}T00:00:00Z`).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function VisasPage() {
  const [region, setRegion] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("az");
  const [visaFreeOnly, setVisaFreeOnly] = useState(false);
  const focus = useQueryParam("c").toUpperCase();

  // Arriving from a country sheet (/visas?c=TH): bring that card into view.
  useEffect(() => {
    if (focus) document.getElementById(`visa-${focus}`)?.scrollIntoView({ block: "center" });
  }, [focus]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VISAS.map((v) => ({ v, name: countryName(v.cc) }))
      .filter(({ v }) => (region === "all" || v.region === region) && (!visaFreeOnly || v.entry === "visa-free"))
      .filter(({ v, name }) => !q || name.toLowerCase().includes(q) || v.cc.toLowerCase() === q)
      .sort((a, b) => {
        if (sort === "longest") {
          const d = (x: typeof a) => (x.v.days === null ? (x.v.entry === "visa-needed" ? -1 : Infinity) : x.v.days);
          const diff = d(b) - d(a);
          if (diff !== 0 && !Number.isNaN(diff)) return diff;
        }
        return a.name.localeCompare(b.name);
      });
  }, [region, query, sort, visaFreeOnly]);

  const showSchengen = region === "all" || region === "europe";

  return (
    <div className="space-y-5">
      <PageBanner
        tone="sky"
        emoji="🛂"
        title="Visa guide"
        subtitle="How long a UK passport can stay on a tourist visa, and whether you can extend. Europe, South-East Asia and Latin America."
      />

      <section className="card p-4" aria-label="About this guide">
        <p className="text-sm">
          For a <span className="font-semibold">British citizen passport</span> on a <span className="font-semibold">tourist stay</span>. Taken
          from UK government (FCDO) travel advice pages on {checkedLabel}.
        </p>
        <p className="mt-2 text-xs text-muted">
          Visa rules change with little warning: Thailand cut its visa-free stay in September 2026. Check the official link on a country
          before you book. Entering visa-free is for tourism and short visits, and working, even remotely, may not be allowed. Where the
          UK page doesn&apos;t give a figure, it is marked as unconfirmed. This is not legal advice.
        </p>
      </section>

      <section className="space-y-3" aria-label="Filters">
        <div
          className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 sm:flex"
          role="group"
          aria-label="Region"
        >
          {REGIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              aria-pressed={region === r.key}
              onClick={() => setRegion(r.key)}
              className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-medium ${
                region === r.key ? "bg-accent text-accent-ink" : "text-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a country…"
          aria-label="Search a country"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-line bg-surface px-4 placeholder:text-muted focus:border-accent focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={visaFreeOnly}
            onClick={() => setVisaFreeOnly((v) => !v)}
            className={`min-h-10 rounded-full border px-3 text-sm font-medium ${
              visaFreeOnly ? "border-accent bg-accent/10 text-accent" : "border-line bg-surface"
            }`}
          >
            Visa-free only
          </button>
          <button
            type="button"
            aria-pressed={sort === "longest"}
            onClick={() => setSort((s) => (s === "az" ? "longest" : "az"))}
            className={`min-h-10 rounded-full border px-3 text-sm font-medium ${
              sort === "longest" ? "border-accent bg-accent/10 text-accent" : "border-line bg-surface"
            }`}
          >
            {sort === "longest" ? "Longest stay first" : "A to Z"}
          </button>
          <span className="ml-auto text-xs text-muted" aria-live="polite">
            {list.length} of {VISAS.length} countries
          </span>
        </div>
      </section>

      {showSchengen && (
        <section className="card border-sky/40 bg-sky/10 p-4" aria-label="Schengen">
          <h2 className="font-display text-lg font-bold">Schengen: one shared 90 days</h2>
          <p className="mt-1 text-sm">
            29 European countries share a single allowance of <span className="font-semibold">90 days in any 180</span>. Time in each one adds
            up. The UK government pages don&apos;t yet list ETIAS (the EU&apos;s upcoming travel authorisation) as required, and the new
            Entry/Exit System takes your fingerprints and photo on your first entry.
          </p>
          <Link href="/days" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent">
            Count your Schengen days in the Day tracker <span aria-hidden>›</span>
          </Link>
        </section>
      )}

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">No country matches that.</p>
      ) : (
        <ul className="space-y-3">
          {list.map(({ v }) => (
            <VisaCard key={v.cc} visa={v} open={focus === v.cc} />
          ))}
        </ul>
      )}

      <p className="px-1 text-xs text-muted">
        Source: GOV.UK foreign travel advice, Open Government Licence v3.0. Day counts and wording are summarised, so always read the
        official page.
      </p>
    </div>
  );
}

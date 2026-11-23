"use client";

import { countryName } from "@/lib/countries";
import { fcdoUrl, type ExtensionCan, type EntryType, type Visa } from "@/lib/visas";

const ENTRY: Record<EntryType, { label: string; cls: string }> = {
  "visa-free": { label: "Visa-free", cls: "bg-leaf/15 text-leaf" },
  "visa-on-arrival": { label: "Visa on arrival", cls: "bg-sky/15 text-sky" },
  "e-visa": { label: "e-Visa needed", cls: "bg-warm/15 text-warm" },
  "visa-needed": { label: "Visa needed", cls: "bg-danger/15 text-danger" },
};

const CAN: Record<ExtensionCan, { label: string; cls: string }> = {
  yes: { label: "✓ Yes", cls: "text-leaf" },
  no: { label: "✗ No", cls: "text-danger" },
  unclear: { label: "? Check first", cls: "text-warm" },
  "not-needed": { label: "✓ Not needed", cls: "text-leaf" },
};

const ADVICE = {
  all: "The UK government advises against all travel to this country.",
  essential: "The UK government advises against all but essential travel to this country.",
  parts: "The UK government advises against travel to some areas of this country.",
} as const;

function reviewedLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** One country: how long you can stay and whether you can extend, with the detail one tap away. */
export default function VisaCard({ visa, open }: { visa: Visa; open?: boolean }) {
  const name = countryName(visa.cc);
  const entry = ENTRY[visa.entry];
  const can = CAN[visa.extension.can];
  const serious = visa.advice === "all" || visa.advice === "essential";

  return (
    <li id={`visa-${visa.cc}`} className="card scroll-mt-24 p-4">
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-black text-accent-ink"
          aria-hidden
        >
          {visa.cc}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-lg leading-tight font-bold">{name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${entry.cls}`}>{entry.label}</span>
          </div>
          {visa.advice && (
            <p className={`mt-1 text-xs font-semibold ${serious ? "text-danger" : "text-warm"}`}>
              <span aria-hidden>⚠ </span>
              {ADVICE[visa.advice]}
            </p>
          )}
        </div>
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="grid grid-cols-[5.5rem_1fr] gap-2">
          <dt className="font-semibold text-muted">Stay</dt>
          <dd>
            <span className="font-semibold">{visa.stay}</span>
            {visa.group === "schengen" && <span className="text-muted"> · shared across Schengen</span>}
            {visa.typicalStay && (
              <span className="block text-xs text-warm">Usual figure. The UK government page doesn&apos;t state it, so confirm.</span>
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-2">
          <dt className="font-semibold text-muted">Extension</dt>
          <dd>
            <span className={`font-semibold ${can.cls}`}>{can.label}</span>
            <span className="text-ink"> · {visa.extension.text}</span>
            {visa.extension.typical && (
              <span className="mt-1 block text-xs text-muted">
                <span className="font-semibold text-warm">Not confirmed:</span> {visa.extension.typical}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <details open={open} className="group mt-3 border-t border-line pt-1">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-accent">
          Details and local rules
          <span aria-hidden className="transition-transform group-open:rotate-90">
            ›
          </span>
        </summary>

        <div className="space-y-3 pb-1 text-sm">
          {visa.before && visa.before.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-wider text-muted uppercase">Before you arrive</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {visa.before.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          {visa.notes && visa.notes.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-wider text-muted uppercase">Good to know</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {visa.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted">
            UK government page last reviewed {reviewedLabel(visa.reviewed)}.{" "}
            <a href={fcdoUrl(visa)} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
              Read the official rules
            </a>
            .
          </p>
        </div>
      </details>
    </li>
  );
}

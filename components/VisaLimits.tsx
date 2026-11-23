import Link from "next/link";
import { countryName } from "@/lib/countries";
import { ccColor, formatDay, limitState, plural, type Stay } from "@/lib/days";
import { visaChecks, type VisaCheck, type VisitCheck, type WindowCheck } from "@/lib/visaDays";

function Badge({ cc }: { cc: string }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
      style={{ background: ccColor(cc) }}
      aria-hidden
    >
      {cc}
    </span>
  );
}

/** Headline on the right of a visit row, and its wording. */
function visitHeadline(c: VisitCheck): { text: string; used: number } {
  if (c.state === "planned") {
    return c.total > c.limit
      ? { text: `${plural(c.total - c.limit, "day")} over`, used: c.limit }
      : { text: "Planned", used: 0 };
  }
  if (c.state === "past") return { text: `${plural(c.total - c.limit, "day")} over`, used: c.limit };
  const left = c.limit - c.usedNow;
  if (left > 0) return { text: `${plural(left, "day")} left`, used: c.usedNow };
  if (left === 0) return { text: "Last day today", used: c.limit };
  return { text: `${plural(-left, "day")} over`, used: c.limit };
}

function VisitRow({ c }: { c: VisitCheck }) {
  const head = visitHeadline(c);
  const st = limitState(head.used, c.limit);
  const left = c.limit - c.usedNow;
  const mayExtend = c.visa.extension.can === "yes" && c.state === "current" && left <= 7;

  return (
    <>
      <div className="flex items-center gap-3">
        <Badge cc={c.cc} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">{countryName(c.cc)}</span>
            <span className={`text-sm font-bold ${st.tone}`}>{head.text}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${Math.min(100, (head.used / c.limit) * 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-1.5 space-y-0.5 pl-12 text-xs">
        {c.state === "current" && (
          <p>
            Day <span className="font-bold tabular-nums">{c.usedNow}</span> of {c.limit}.{" "}
            {left > 0
              ? `Your last permitted day is ${formatDay(c.lastDay)}.`
              : left === 0
                ? "Today is your last permitted day."
                : `The limit ended on ${formatDay(c.lastDay)}.`}
          </p>
        )}
        {c.state === "current" && c.total > c.usedNow && (
          <p className={c.total > c.limit ? "font-medium text-danger" : "text-muted"}>
            {c.total > c.limit
              ? `Your logged end date, ${formatDay(c.end)}, is ${plural(c.total - c.limit, "day")} past the limit.`
              : `Logged to ${formatDay(c.end)}, within the limit.`}
          </p>
        )}
        {c.state === "planned" && (
          <p className={c.total > c.limit ? "font-medium text-danger" : "text-muted"}>
            {formatDay(c.start)} to {formatDay(c.end)} is {plural(c.total, "day")} against a {c.limit}-day limit
            {c.total > c.limit ? "." : `, so ${plural(c.limit - c.total, "day")} to spare.`} The limit would end on{" "}
            {formatDay(c.lastDay)}.
          </p>
        )}
        {c.state === "past" && (
          <p className="font-medium text-danger">
            {formatDay(c.start)} to {formatDay(c.end)} was {plural(c.total, "day")}, past the {c.limit}-day limit.
          </p>
        )}
        {mayExtend && <p className="text-muted">An extension may be possible. Check the rules before the limit.</p>}
        {c.visa.typicalStay && <p className="text-muted">This {c.limit}-day figure isn&apos;t confirmed by the UK government.</p>}
        <Link href={`/visas?c=${c.cc}`} className="inline-flex min-h-11 items-center font-semibold text-accent">
          {c.visa.stay} · visa guide <span aria-hidden>&nbsp;›</span>
        </Link>
      </div>
    </>
  );
}

function WindowRow({ c }: { c: WindowCheck }) {
  const st = limitState(c.used, c.limit);
  const plannedSt = limitState(c.peak, c.limit);
  const left = c.limit - c.used;
  return (
    <>
      <div className="flex items-center gap-3">
        <Badge cc={c.cc} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">{countryName(c.cc)}</span>
            <span className={`text-sm font-bold ${st.tone}`}>
              {left > 0 ? `${plural(left, "day")} left` : left === 0 ? "Limit reached" : `${plural(-left, "day")} over`}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${Math.min(100, (c.used / c.limit) * 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-1.5 space-y-0.5 pl-12 text-xs">
        <p>
          <span className="font-bold tabular-nums">{c.used}</span> of {c.limit} days used in the last {c.window} days.
        </p>
        {c.hasPlanned && (
          <p className={`font-medium ${plannedSt.tone}`}>
            {c.peak > c.limit
              ? `With your planned stays you'd be ${plural(c.peak - c.limit, "day")} over, reaching ${c.peak} days on ${formatDay(c.peakDay)}.`
              : `With your planned stays your busiest point is ${c.peak} of ${c.limit} days, on ${formatDay(c.peakDay)}.`}
          </p>
        )}
        <p className="text-muted">
          Counted over a rolling {c.window} days, which is approximate for this country&apos;s wording.
        </p>
        <Link href={`/visas?c=${c.cc}`} className="inline-flex min-h-11 items-center font-semibold text-accent">
          {c.visa.stay} · visa guide <span aria-hidden>&nbsp;›</span>
        </Link>
      </div>
    </>
  );
}

/** Visa day limits for the countries in your stays, for a UK passport on a tourist stay. */
export default function VisaLimits({ stays, today }: { stays: Stay[]; today: number }) {
  const checks = visaChecks(stays, today);
  if (checks.length === 0) return null;

  return (
    <section className="card p-4" aria-labelledby="visa-days-title">
      <h2 id="visa-days-title" className="font-display text-xl font-bold">
        Visa limits
      </h2>
      <p className="text-sm text-muted">UK passport, tourist stay</p>
      <ul className="mt-3 divide-y divide-line">
        {checks.map((c: VisaCheck, i) => (
          <li key={`${c.cc}-${c.kind === "visit" ? c.start : "window"}-${i}`} className="py-3 first:pt-0">
            {c.kind === "visit" ? <VisitRow c={c} /> : <WindowRow c={c} />}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Counts from the first day of each stay in a country, as day 1, and treats back-to-back stays in one country as one
        visit. Leaving and coming back is treated as a new visit, but some countries limit repeat entries, so check. Schengen
        countries use the shared counter above. Rules come from the{" "}
        <Link href="/visas" className="font-semibold text-accent">
          visa guide
        </Link>{" "}
        and can change, so confirm with the official page. Not legal advice.
      </p>
    </section>
  );
}

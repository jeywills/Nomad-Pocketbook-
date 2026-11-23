import { countryName } from "@/lib/countries";
import { ccColor, formatDay, plural } from "@/lib/days";
import type { TripEvent } from "@/lib/trip";

const ICON: Record<TripEvent["kind"], string> = { visa: "📝", arrive: "✈️", extend: "🔁", limit: "⛔" };
const TONE: Record<TripEvent["tone"], string> = {
  info: "text-ink",
  warn: "text-warm",
  danger: "text-danger",
};

/** "in 12 days", "today", "5 days ago". */
function when(date: number, today: number): string {
  const d = date - today;
  if (d === 0) return "today";
  return d > 0 ? `in ${plural(d, "day")}` : `${plural(-d, "day")} ago`;
}

/** The dates to act on, in order: applications, arrivals, extensions and limits. */
export default function KeyDates({ events, today }: { events: TripEvent[]; today: number }) {
  if (events.length === 0) return null;
  return (
    <section className="card p-4" aria-labelledby="keydates-title">
      <h2 id="keydates-title" className="font-display text-xl font-bold">
        Key dates
      </h2>
      <p className="text-sm text-muted">What to do and when, from your itinerary.</p>
      <ol className="mt-3 divide-y divide-line">
        {events.map((e) => {
          const late = e.kind === "visa" && e.date < today;
          return (
            <li key={e.id} className={`flex gap-3 py-3 first:pt-0 ${e.date < today && !late ? "opacity-60" : ""}`}>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-base"
                style={{ background: e.cc ? ccColor(e.cc) : "var(--sky)" }}
                aria-hidden
              >
                {ICON[e.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">
                  <span className="font-semibold text-ink">{formatDay(e.date)}</span> · {when(e.date, today)}
                  {e.cc ? ` · ${countryName(e.cc)}` : ""}
                </p>
                <p className={`text-sm font-semibold ${TONE[e.tone]}`}>{e.title}</p>
                <p className="text-xs text-muted">{e.detail}</p>
                {late && <p className="text-xs font-semibold text-danger">That date has passed, so start this now.</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(tz: string): Intl.DateTimeFormat {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatters.set(tz, f);
  }
  return f;
}

/** UTC offset of a zone, in minutes, at a given instant (handles DST). */
export function offsetMinutes(tz: string, at: number): number {
  const parts: Record<string, string> = {};
  for (const p of formatterFor(tz).formatToParts(at)) parts[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((asUtc - Math.floor(at / 1000) * 1000) / 60000);
}

const DAY = 86_400_000;

/** Local wall-clock hour (0-24, fractional) in a zone at an instant. */
export function localHour(tz: string, at: number): number {
  const local = at + offsetMinutes(tz, at) * 60_000;
  return (((local % DAY) + DAY) % DAY) / 3_600_000;
}

/** Whole local days since epoch, used to compare "today / tomorrow". */
export function localDayNumber(tz: string, at: number): number {
  return Math.floor((at + offsetMinutes(tz, at) * 60_000) / DAY);
}

/** Instant of local midnight (start of the current day) in a zone. */
export function startOfLocalDay(tz: string, at: number): number {
  const off = offsetMinutes(tz, at) * 60_000;
  return Math.floor((at + off) / DAY) * DAY - off;
}

export function formatClock(tz: string, at: number): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(at);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

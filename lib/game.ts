"use client";

import { readStored, useNow, useStored, writeStored } from "./hooks";

/* ---------- state ---------- */

export const GAME_KEY = "np.game.v1";

export type Stamp = { id: string; name: string; cc: string; at: string };

export type GameState = {
  xp: number;
  stamps: Stamp[];
  /** badge id -> ISO date unlocked */
  badges: Record<string, string>;
  /** one-time actions already rewarded */
  flags: Record<string, true>;
  /** how many cities the user has added to the weather comparison */
  weatherAdds: number;
  streak: { last: string; count: number; best: number };
};

export const INITIAL_GAME: GameState = {
  xp: 0,
  stamps: [],
  badges: {},
  flags: {},
  weatherAdds: 0,
  streak: { last: "", count: 0, best: 0 },
};

/* ---------- levels ---------- */

export const XP_PER_LEVEL = 100;
export const TITLES = [
  "Wanderer",
  "Backpacker",
  "Explorer",
  "Pathfinder",
  "Navigator",
  "Trailblazer",
  "Globetrotter",
  "Nomad Legend",
];

export function levelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)],
    into,
    next: XP_PER_LEVEL - into,
    pct: (into / XP_PER_LEVEL) * 100,
  };
}

/**
 * Streak that is still alive today (last visit was today or yesterday).
 * `now` comes from useNow(), which is 0 while prerendering on the server.
 */
export function liveStreak(g: GameState, now: number): number {
  if (!now) return 0;
  const { last, count } = g.streak;
  return last === localDate(0, now) || last === localDate(-1, now) ? count : 0;
}

function localDate(offsetDays: number, at: number = Date.now()): string {
  const d = new Date(at);
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA");
}

/* ---------- badges and quests ---------- */

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  hint: string;
  test: (s: GameState) => boolean;
};

export const BADGES: Badge[] = [
  { id: "first_forecast", name: "First Forecast", emoji: "🌤️", hint: "Check a month-by-month forecast", test: (s) => !!s.flags.first_forecast },
  { id: "sunchaser", name: "Sunchaser", emoji: "☀️", hint: "Add 3 cities to the weather comparison", test: (s) => s.weatherAdds >= 3 },
  { id: "clockwork", name: "Clockwork", emoji: "⏰", hint: "Find a working window you all share", test: (s) => !!s.flags.overlap },
  { id: "penny_wise", name: "Penny Wise", emoji: "🪙", hint: "Run the budget checker", test: (s) => !!s.flags.budget_run },
  { id: "hopper", name: "Currency Hopper", emoji: "💱", hint: "Switch your currency", test: (s) => !!s.flags.currency },
  { id: "big_saver", name: "Big Saver", emoji: "💰", hint: "Find a place that costs 30% less", test: (s) => !!s.flags.big_saver },
  { id: "globetrotter", name: "Globetrotter", emoji: "🧭", hint: "Collect 5 passport stamps", test: (s) => s.stamps.length >= 5 },
  { id: "legend", name: "World Wanderer", emoji: "🌍", hint: "Collect 12 passport stamps", test: (s) => s.stamps.length >= 12 },
  { id: "streak3", name: "On a Roll", emoji: "🔥", hint: "Visit three days in a row", test: (s) => s.streak.best >= 3 },
];

export type Quest = {
  id: string;
  label: string;
  href: string;
  xp: number;
  done: (s: GameState) => boolean;
  progress?: (s: GameState) => string;
};

export const QUESTS: Quest[] = [
  { id: "first_forecast", label: "Check a month-by-month forecast", href: "/weather", xp: 20, done: (s) => !!s.flags.first_forecast },
  { id: "overlap", label: "Find a shared working window", href: "/time", xp: 25, done: (s) => !!s.flags.overlap },
  { id: "budget_run", label: "Price up a move in the budget checker", href: "/budget", xp: 25, done: (s) => !!s.flags.budget_run },
  {
    id: "stamps3",
    label: "Collect 3 passport stamps",
    href: "/weather",
    xp: 15,
    done: (s) => s.stamps.length >= 3,
    progress: (s) => `${Math.min(s.stamps.length, 3)}/3`,
  },
];

/* ---------- events ---------- */

export type OnceId = "first_forecast" | "comfort" | "overlap" | "budget_run" | "currency";

const ONCE: Record<OnceId, { xp: number; label: string }> = {
  first_forecast: { xp: 20, label: "First forecast checked" },
  comfort: { xp: 10, label: "Set your comfort range" },
  overlap: { xp: 25, label: "Found a shared working window" },
  budget_run: { xp: 25, label: "Budget check complete" },
  currency: { xp: 10, label: "Switched currency" },
};

export type GameEvent =
  | { type: "stamp"; place: { id: string; name: string; cc?: string }; source: "weather" | "time" | "budget" }
  | { type: "once"; id: OnceId }
  | { type: "saving"; pct: number }
  | { type: "visit" };

export type Gain = { xp: number; label: string };
export type GameNotice = {
  gains: Gain[];
  badges: Badge[];
  levelUp: { level: number; title: string } | null;
};

export const NOTICE_EVENT = "np:game";

/** Apply a game event: update XP, stamps and badges, then tell the toaster. */
export function trigger(ev: GameEvent): void {
  if (typeof window === "undefined") return;

  const prev: GameState = { ...INITIAL_GAME, ...readStored<Partial<GameState>>(GAME_KEY, {}) };
  const s: GameState = {
    ...prev,
    stamps: [...prev.stamps],
    badges: { ...prev.badges },
    flags: { ...prev.flags },
    streak: { ...prev.streak },
  };
  const gains: Gain[] = [];
  const give = (xp: number, label: string) => {
    s.xp += xp;
    gains.push({ xp, label });
  };
  const once = (id: string, xp: number, label: string) => {
    if (s.flags[id]) return;
    s.flags[id] = true;
    give(xp, label);
  };

  switch (ev.type) {
    case "stamp":
      if (ev.source === "weather") s.weatherAdds += 1;
      if (!s.stamps.some((x) => x.id === ev.place.id)) {
        s.stamps.push({
          id: ev.place.id,
          name: ev.place.name,
          cc: (ev.place.cc ?? "").toUpperCase(),
          at: new Date().toISOString(),
        });
        give(15, `Passport stamp: ${ev.place.name}`);
      }
      break;
    case "once":
      once(ev.id, ONCE[ev.id].xp, ONCE[ev.id].label);
      break;
    case "saving":
      if (ev.pct >= 0.3) once("big_saver", 30, "Found a saving of 30% or more");
      break;
    case "visit": {
      const today = localDate(0);
      if (s.streak.last !== today) {
        const count = s.streak.last === localDate(-1) ? s.streak.count + 1 : 1;
        s.streak = { last: today, count, best: Math.max(s.streak.best, count) };
        give(5, count > 1 ? `Day ${count} streak` : "Daily check-in");
      }
      break;
    }
  }

  const unlocked: Badge[] = [];
  for (const b of BADGES) {
    if (!s.badges[b.id] && b.test(s)) {
      s.badges[b.id] = new Date().toISOString();
      give(20, `Badge: ${b.name}`);
      unlocked.push(b);
    }
  }

  if (JSON.stringify(prev) === JSON.stringify(s)) return;
  writeStored(GAME_KEY, s);

  if (gains.length === 0) return;
  const before = levelInfo(prev.xp);
  const after = levelInfo(s.xp);
  const notice: GameNotice = {
    gains,
    badges: unlocked,
    levelUp: after.level > before.level ? { level: after.level, title: after.title } : null,
  };
  window.dispatchEvent(new CustomEvent<GameNotice>(NOTICE_EVENT, { detail: notice }));
}

/* ---------- hook ---------- */

export function useGame() {
  const [game] = useStored<GameState>(GAME_KEY, INITIAL_GAME);
  const now = useNow();
  return { game, ...levelInfo(game.xp), streak: liveStreak(game, now) };
}

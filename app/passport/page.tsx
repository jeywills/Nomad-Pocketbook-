"use client";

import QuestPanel from "@/components/QuestPanel";
import StampBadge from "@/components/StampBadge";
import { BADGES, XP_PER_LEVEL, useGame } from "@/lib/game";

const MIN_SLOTS = 8;

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function PassportPage() {
  const { game, level, title, into, next, pct, streak } = useGame();
  const slots = Math.max(MIN_SLOTS, Math.ceil((game.stamps.length + 1) / 4) * 4);
  const unlocked = BADGES.filter((b) => game.badges[b.id]).length;

  return (
    <div className="space-y-6">
      <header className="animate-rise relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1e1b4b] to-[#7c2d12] p-5 text-white shadow-[0_18px_36px_-20px_rgb(var(--shadow)/0.6)]">
        <p className="text-xs font-bold tracking-widest text-white/75 uppercase">Nomad passport</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative flex size-24 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth="9" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#ffc857"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 263.9} 263.9`}
                className="transition-[stroke-dasharray] duration-700"
              />
            </svg>
            <span className="relative text-center">
              <span className="block text-[10px] font-bold tracking-wider uppercase">Level</span>
              <span className="block font-display text-4xl leading-none font-black">{level}</span>
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight font-black">{title}</h1>
            <p className="mt-1 text-sm text-white/90">
              {into}/{XP_PER_LEVEL} XP · {next} to the next level
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold">
              <span aria-hidden>🔥</span> {streak} day streak
            </p>
          </div>
        </div>
      </header>

      <section aria-labelledby="stamps-title">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="stamps-title" className="font-display text-xl font-bold">
            Stamps
          </h2>
          <span className="text-xs text-muted">{game.stamps.length} collected</span>
        </div>
        <ul className="card mt-3 grid grid-cols-4 gap-3 p-4">
          {Array.from({ length: slots }, (_, i) => {
            const s = game.stamps[i];
            return (
              <li key={i}>
                {s ? (
                  <StampBadge name={s.name} cc={s.cc} date={shortDate(s.at)} />
                ) : (
                  <div
                    className="flex aspect-square items-center justify-center rounded-full border-2 border-dashed border-line text-lg text-line"
                    aria-hidden
                  >
                    ?
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {game.stamps.length === 0 && (
          <p className="mt-2 px-1 text-sm text-muted">
            Add a city to the weather, time zone or budget tools to earn your first stamp.
          </p>
        )}
      </section>

      <section aria-labelledby="badges-title">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="badges-title" className="font-display text-xl font-bold">
            Badges
          </h2>
          <span className="text-xs text-muted">
            {unlocked}/{BADGES.length} unlocked
          </span>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const on = !!game.badges[b.id];
            return (
              <li
                key={b.id}
                className={`card flex flex-col items-center p-3 text-center ${on ? "" : "opacity-70"}`}
              >
                <span className={`text-4xl ${on ? "animate-bob" : "grayscale"}`} aria-hidden>
                  {on ? b.emoji : "🔒"}
                </span>
                <span className="mt-2 text-xs leading-tight font-bold">{b.name}</span>
                <span className="mt-1 text-[11px] leading-tight text-muted">{on ? "Unlocked" : b.hint}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <QuestPanel />

      <section className="card p-4">
        <h2 className="font-display text-xl font-bold">How to earn XP</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>🛂 +15 XP for each new city you add</li>
          <li>🏅 +20 XP for every badge you unlock</li>
          <li>🧭 +10 to +30 XP for trying each tool</li>
          <li>🔥 +5 XP for visiting each day</li>
        </ul>
        <p className="mt-3 text-xs text-muted">Progress is saved on this device only.</p>
      </section>
    </div>
  );
}

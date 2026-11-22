"use client";

import Link from "next/link";
import { QUESTS, useGame } from "@/lib/game";

export default function QuestPanel() {
  const { game } = useGame();
  const doneCount = QUESTS.filter((q) => q.done(game)).length;

  return (
    <section className="card p-4" aria-labelledby="quests-title">
      <div className="flex items-center justify-between">
        <h2 id="quests-title" className="font-display text-xl font-bold">
          Starter quests
        </h2>
        <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-[#1e2a38]">
          {doneCount}/{QUESTS.length}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
        <div
          className="h-full origin-left rounded-full bg-leaf transition-[width] duration-500"
          style={{ width: `${(doneCount / QUESTS.length) * 100}%` }}
        />
      </div>

      <ul className="mt-3 space-y-1">
        {QUESTS.map((q) => {
          const done = q.done(game);
          return (
            <li key={q.id}>
              <Link
                href={q.href}
                className="flex min-h-14 items-center gap-3 rounded-2xl px-2 py-1.5 active:bg-line/50"
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    done ? "border-leaf bg-leaf text-white" : "border-line text-transparent"
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${done ? "text-muted line-through" : ""}`}>{q.label}</span>
                  {q.progress && !done && <span className="block text-xs text-muted">{q.progress(game)}</span>}
                </span>
                <span className="text-xs font-bold text-warm">{done ? "Done" : `+${q.xp} XP`}</span>
                <span className="sr-only">{done ? "Completed" : "Not completed"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

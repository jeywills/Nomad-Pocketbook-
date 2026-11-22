"use client";

import Link from "next/link";
import { useGame } from "@/lib/game";

export default function TopBar() {
  const { level, title, pct, streak } = useGame();

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex min-h-11 items-center gap-2" aria-label="Nomad Pocketbook home">
          <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
            <rect width="32" height="32" rx="9" fill="var(--accent)" />
            <circle cx="16" cy="16" r="8.5" fill="none" stroke="var(--accent-ink)" strokeWidth="1.8" />
            <path d="M16 9.5 18.4 16 16 22.5 13.6 16Z" fill="var(--accent-ink)" />
            <circle cx="16" cy="16" r="1.4" fill="var(--accent)" />
          </svg>
          <span className="font-display text-lg leading-none font-bold">Pocketbook</span>
        </Link>

        <Link
          href="/passport"
          aria-label={`Level ${level}, ${title}, ${streak} day streak. Open passport`}
          className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1"
        >
          <span className="relative flex size-9 items-center justify-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 94.25} 94.25`}
              />
            </svg>
            <span className="relative text-xs font-bold">{level}</span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-semibold">{title}</span>
            <span className="text-[11px] text-muted">
              <span aria-hidden>🔥</span> {streak} day{streak === 1 ? "" : "s"}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}

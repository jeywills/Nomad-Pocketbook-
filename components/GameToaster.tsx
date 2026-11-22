"use client";

import { useEffect, useRef, useState } from "react";
import { NOTICE_EVENT, trigger, type Badge, type GameNotice } from "@/lib/game";

type Toast = { id: number; text: string; xp?: number; level?: boolean };

const CONFETTI = ["#ff8a3d", "#f5b031", "#4ade9a", "#6cb6ff", "#f472b6", "#ffffff"];

export default function GameToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Badges waiting to be shown; the first one is on screen.
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
  const badge: Badge | undefined = badgeQueue[0];
  const nextId = useRef(1);
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    trigger({ type: "visit" });

    const onNotice = (e: Event) => {
      const n = (e as CustomEvent<GameNotice>).detail;
      const fresh: Toast[] = n.gains
        .filter((g) => !g.label.startsWith("Badge:"))
        .map((g) => ({ id: nextId.current++, text: g.label, xp: g.xp }));
      if (n.levelUp) {
        fresh.push({
          id: nextId.current++,
          text: `Level ${n.levelUp.level}: ${n.levelUp.title}`,
          level: true,
        });
      }
      if (fresh.length) {
        setToasts((t) => [...t, ...fresh].slice(-3));
        for (const f of fresh) {
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== f.id)), 3400);
        }
      }
      if (n.badges.length) setBadgeQueue((q) => [...q, ...n.badges]);
    };

    window.addEventListener(NOTICE_EVENT, onNotice);
    return () => window.removeEventListener(NOTICE_EVENT, onNotice);
  }, []);

  useEffect(() => {
    if (badge) okRef.current?.focus();
  }, [badge]);

  const closeBadge = () => setBadgeQueue((q) => q.slice(1));

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-pop flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
              t.level ? "bg-accent text-accent-ink" : "border border-line bg-surface text-ink"
            }`}
          >
            {t.xp !== undefined && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-[#1e2a38]">+{t.xp} XP</span>
            )}
            {t.level && <span aria-hidden>🎉</span>}
            <span className="truncate">{t.text}</span>
          </div>
        ))}
      </div>

      {badge && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Badge unlocked: ${badge.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onKeyDown={(e) => e.key === "Escape" && closeBadge()}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {Array.from({ length: 30 }, (_, i) => (
              <span
                key={i}
                className="animate-confetti absolute top-0 block h-3 w-2 rounded-[2px]"
                style={{
                  left: `${(i * 37 + 11) % 100}%`,
                  background: CONFETTI[i % CONFETTI.length],
                  animationDelay: `${(i % 8) * 0.12}s`,
                  animationDuration: `${2.2 + (i % 5) * 0.25}s`,
                }}
              />
            ))}
          </div>
          <div className="animate-pop card relative w-full max-w-xs p-6 text-center">
            <p className="text-xs font-bold tracking-widest text-accent uppercase">Badge unlocked</p>
            <p className="animate-bob my-3 text-6xl" aria-hidden>
              {badge.emoji}
            </p>
            <h2 className="font-display text-2xl font-bold">{badge.name}</h2>
            <p className="mt-1 text-sm text-muted">{badge.hint}</p>
            <p className="mt-3 inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#1e2a38]">+20 XP</p>
            <button
              ref={okRef}
              type="button"
              onClick={closeBadge}
              className="mt-5 block min-h-12 w-full rounded-2xl bg-accent font-semibold text-accent-ink"
            >
              Nice!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

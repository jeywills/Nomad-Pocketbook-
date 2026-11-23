import type { ReactNode } from "react";

type Tone = "sun" | "night" | "jungle" | "dusk";

const TONES: Record<Tone, { from: string; to: string }> = {
  sun: { from: "#7c2d12", to: "#c2410c" },
  night: { from: "#1e1b4b", to: "#3730a3" },
  jungle: { from: "#064e3b", to: "#15803d" },
  dusk: { from: "#500724", to: "#9d174d" },
};

const STARS = [
  [12, 18, 1.4], [28, 62, 1], [46, 30, 1.6], [64, 74, 1], [78, 22, 1.2], [90, 56, 1.5], [54, 10, 1],
];

/** Coloured page header with a small illustrated scene, used by the tool pages. */
export default function PageBanner({
  tone,
  title,
  subtitle,
  emoji,
  children,
}: {
  tone: Tone;
  title: string;
  subtitle: string;
  emoji: string;
  children?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <header
      className="animate-rise relative isolate overflow-hidden rounded-[28px] p-5 text-white shadow-[0_18px_36px_-20px_rgb(var(--shadow)/0.6)]"
      style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
    >
      <svg className="absolute inset-0 -z-10 size-full" viewBox="0 0 100 80" preserveAspectRatio="xMaxYMid slice" aria-hidden>
        {tone === "sun" && (
          <>
            <circle cx="84" cy="30" r="22" fill="#fcd34d" opacity="0.2" />
            <circle cx="84" cy="30" r="13" fill="#fcd34d" opacity="0.5" />
          </>
        )}
        {tone === "night" && (
          <>
            {STARS.map(([x, y, r]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.7" />
            ))}
            <circle cx="86" cy="26" r="11" fill="#e0e7ff" opacity="0.85" />
            <circle cx="91" cy="22" r="10" fill="#2e2a8a" />
          </>
        )}
        {tone === "dusk" && (
          <>
            <circle cx="86" cy="26" r="20" fill="#fda4af" opacity="0.18" />
            <circle cx="86" cy="26" r="11" fill="#fda4af" opacity="0.4" />
            <path d="M0 80 L18 64 L34 74 L56 56 L78 76 L100 62 V80Z" fill="#2a0512" opacity="0.45" />
          </>
        )}
        {tone === "jungle" && (
          <>
            <circle cx="88" cy="24" r="14" fill="#bef264" opacity="0.18" />
            <path d="M0 80 Q 30 52 62 70 T 100 58 V80Z" fill="#052e16" opacity="0.5" />
          </>
        )}
      </svg>
      <div className="flex items-start gap-3">
        <span className="animate-bob text-4xl" aria-hidden>
          {emoji}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight font-bold">{title}</h1>
          <p className="mt-1 text-sm text-white/90">{subtitle}</p>
        </div>
      </div>
      {children}
    </header>
  );
}

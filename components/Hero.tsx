import type { ReactNode } from "react";

/** Sunset landscape with a drifting cloud and a dotted flight path. */
export default function Hero({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[32px] text-white shadow-[0_24px_48px_-24px_rgb(var(--shadow)/0.6)]">
      <svg
        className="absolute inset-0 -z-10 size-full"
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b1d0a" />
            <stop offset="0.5" stopColor="#c2410c" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect width="400" height="320" fill="url(#hero-sky)" />
        <circle cx="292" cy="212" r="78" fill="#fde68a" opacity="0.18" />
        <circle cx="292" cy="212" r="50" fill="#fde68a" opacity="0.95" />
        <g className="animate-drift" opacity="0.28">
          <ellipse cx="40" cy="120" rx="46" ry="10" fill="#fff" />
          <ellipse cx="70" cy="110" rx="30" ry="9" fill="#fff" />
        </g>
        <path
          d="M18 150 C 120 70, 240 60, 372 118"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.75"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 9"
        />
        <g transform="translate(372 118) rotate(24)" fill="#fff">
          <path d="M0-7 14 0 0 7 3 0Z" />
        </g>
        <path d="M0 250 L70 190 L120 236 L190 170 L270 244 L330 200 L400 248 V320 H0Z" fill="#9a3412" opacity="0.55" />
        <path d="M0 278 L60 232 L130 276 L210 214 L300 280 L360 246 L400 272 V320 H0Z" fill="#14532d" />
        <path d="M0 304 L80 270 L160 300 L250 262 L340 302 L400 284 V320 H0Z" fill="#052e16" />
      </svg>
      <div className="relative p-6 pb-32">{children}</div>
    </section>
  );
}

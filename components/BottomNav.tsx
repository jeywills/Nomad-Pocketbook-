"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const icon = (d: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {d}
  </svg>
);

const ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: icon(
      <>
        <path d="M3 11 12 4l9 7" />
        <path d="M5 10v10h14V10" />
      </>,
    ),
  },
  {
    href: "/weather",
    label: "Weather",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>,
    ),
  },
  {
    href: "/time",
    label: "Time",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>,
    ),
  },
  {
    href: "/budget",
    label: "Budget",
    icon: icon(
      <>
        <path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        <path d="M3 7l12-3v3" />
        <circle cx="16.5" cy="13.5" r="1" />
      </>,
    ),
  },
  {
    href: "/passport",
    label: "Passport",
    icon: icon(
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <circle cx="12" cy="10" r="3" />
        <path d="M9 16.5h6" />
      </>,
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl rounded-[28px] border border-line bg-surface/95 p-1.5 shadow-[0_18px_40px_-12px_rgb(var(--shadow)/0.5)] backdrop-blur"
    >
      <ul className="flex gap-1">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[22px] text-[11px] font-semibold ${
                  active ? "bg-accent text-accent-ink" : "text-muted"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

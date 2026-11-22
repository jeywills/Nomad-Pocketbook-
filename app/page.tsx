import Link from "next/link";
import FeaturedRail from "@/components/FeaturedRail";
import Hero from "@/components/Hero";
import QuestPanel from "@/components/QuestPanel";

const TOOLS = [
  {
    href: "/weather",
    title: "Weather by month",
    body: "A whole year of sun and rain, side by side.",
    emoji: "🌤️",
    tint: "bg-gradient-to-br from-[#7c2d12] to-[#c2410c]",
  },
  {
    href: "/time",
    title: "Time zones",
    body: "See when your whole crew is at work.",
    emoji: "⏰",
    tint: "bg-gradient-to-br from-[#1e1b4b] to-[#3730a3]",
  },
  {
    href: "/budget",
    title: "Budget checker",
    body: "Your lifestyle, priced in a new city.",
    emoji: "🪙",
    tint: "bg-gradient-to-br from-[#064e3b] to-[#15803d]",
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <Hero>
        <p className="text-xs font-bold tracking-widest text-white/80 uppercase">Your nomad pocketbook</p>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] font-black">
          Where to next,
          <br />
          nomad?
        </h1>
        <p className="mt-3 max-w-[16rem] text-sm text-white/90">
          Compare the weather, line up time zones and price your next move. Earn stamps as you explore.
        </p>
        <Link
          href="/weather"
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 font-semibold text-[#7c2d12] shadow-lg"
        >
          Start exploring <span aria-hidden>→</span>
        </Link>
      </Hero>

      <QuestPanel />

      <FeaturedRail />

      <section aria-labelledby="tools-title" className="space-y-3">
        <h2 id="tools-title" className="px-1 font-display text-xl font-bold">
          Your toolkit
        </h2>
        <ul className="space-y-3">
          {TOOLS.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex min-h-20 items-center gap-4 rounded-3xl p-4 text-white shadow-[0_14px_28px_-16px_rgb(var(--shadow)/0.6)] ${t.tint}`}
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl" aria-hidden>
                  {t.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-bold">{t.title}</span>
                  <span className="block text-sm text-white/90">{t.body}</span>
                </span>
                <span aria-hidden className="text-2xl">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const INKS = ["#b91c1c", "#1d4ed8", "#15803d", "#7e22ce", "#c2410c", "#0e7490"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** A round passport stamp. Ink colour and tilt come from the city name. */
export default function StampBadge({ name, cc, date }: { name: string; cc: string; date: string }) {
  const h = hash(name + cc);
  const ink = INKS[h % INKS.length];
  const tilt = (h % 17) - 8;
  return (
    <div
      className="animate-pop flex aspect-square flex-col items-center justify-center rounded-full border-[3px] border-double p-2 text-center"
      style={{ color: ink, borderColor: ink, transform: `rotate(${tilt}deg)` }}
      role="img"
      aria-label={`Passport stamp for ${name}, collected ${date}`}
    >
      <span className="font-display text-2xl leading-none font-black">{cc || "??"}</span>
      <span className="mt-1 line-clamp-2 text-[10px] leading-tight font-bold uppercase">{name}</span>
      <span className="mt-0.5 text-[9px] font-semibold opacity-80">{date}</span>
    </div>
  );
}

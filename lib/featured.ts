/** Featured destination cards on the home screen. */
export type Featured = {
  city: string;
  emoji: string;
  tagline: string;
  /** Tailwind gradient classes. Kept dark enough for white text. */
  gradient: string;
};

export const FEATURED: Featured[] = [
  { city: "Lisbon", emoji: "🚋", tagline: "Tiles, tram rides and Atlantic light", gradient: "from-[#9A3412] to-[#EA580C]" },
  { city: "Chiang Mai", emoji: "🛕", tagline: "Temples, cafes and calm mountain mornings", gradient: "from-[#065F46] to-[#16A34A]" },
  { city: "Canggu (Bali)", emoji: "🏄", tagline: "Surf at sunrise, coworking by noon", gradient: "from-[#0F766E] to-[#0891B2]" },
  { city: "Mexico City", emoji: "🌮", tagline: "Huge, delicious and full of creative energy", gradient: "from-[#9D174D] to-[#DB2777]" },
  { city: "Medellín", emoji: "🌺", tagline: "Eternal spring in a mountain valley", gradient: "from-[#166534] to-[#65A30D]" },
  { city: "Tbilisi", emoji: "🍷", tagline: "Wine, old balconies and easy visas", gradient: "from-[#5B21B6] to-[#9333EA]" },
  { city: "Las Palmas", emoji: "🏝️", tagline: "Winter sun without leaving Europe", gradient: "from-[#B45309] to-[#D97706]" },
  { city: "Tokyo", emoji: "🍜", tagline: "Neon, noodles and perfect trains", gradient: "from-[#1E3A8A] to-[#4F46E5]" },
];

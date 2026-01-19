export const TopFiveThemes = {
  matcha: {
    name: "Matcha",
    bg: "from-emerald-700 via-green-900 to-black",
    accent: "text-emerald-200",
    glow: "bg-emerald-400/20",
  },
  amethyst: {
    name: "Amethyst",
    bg: "from-violet-600 via-indigo-700 to-black",
    accent: "text-violet-200",
    glow: "bg-violet-400/20",
  },
  ocean: {
    name: "Ocean",
    bg: "from-cyan-600 via-blue-800 to-black",
    accent: "text-cyan-200",
    glow: "bg-cyan-400/20",
  },
  academia: {
    name: "Academia",
    bg: "from-amber-800 via-stone-900 to-black",
    accent: "text-amber-200",
    glow: "bg-amber-400/20",
  },
  noir: {
    name: "Noir",
    bg: "from-black via-zinc-900 to-black",
    accent: "text-zinc-300",
    glow: "bg-white/5",
  },
} as const;

export type TopFiveTheme = keyof typeof TopFiveThemes;

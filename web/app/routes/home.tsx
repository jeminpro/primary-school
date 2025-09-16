import type { Route } from "./+types/home"; 
import { Link } from "react-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Calculator,
  BookA,
  Volume2,
  Palette,
  Shapes,
  Clock3,
  Coins,
  Ruler,
  Puzzle,
  Keyboard,
} from "lucide-react";

/**
 * Primary School Learning – Landing Page (TypeScript)
 * Tech: React + Tailwind CSS + DaisyUI
 * Features:
 *  - Cute SVG mascots on cards
 *  - "Last played" chip (reads/writes localStorage per category)
 *  - Search + age filter
 *  - Theme toggle via <html data-theme>
 */

// ————————————————————————————————————————————————
// Types
// ————————————————————————————————————————————————

type Category = {
  key: string;
  title: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string; // tailwind gradient string (from-… via-… to-…)
  badge?: string;
};

type LastPlayedMap = Record<string, number>; // key -> epoch ms

// ————————————————————————————————————————————————
// Local storage helpers
// ————————————————————————————————————————————————

const LP_STORAGE_KEY = "ps_last_played";

function readLastPlayed(): LastPlayedMap {
  try {
    const raw = localStorage.getItem(LP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as LastPlayedMap;
    return {};
  } catch {
    return {};
  }
}

function writeLastPlayed(map: LastPlayedMap) {
  try {
    localStorage.setItem(LP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore write errors (private mode, quota, etc.)
  }
}

function touchLastPlayed(key: string) {
  const map = readLastPlayed();
  map[key] = Date.now();
  writeLastPlayed(map);
}

function timeAgo(ms?: number): string | null {
  if (!ms) return null;
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

// ————————————————————————————————————————————————
// Cute Mascot (SVG blob with face)
// ————————————————————————————————————————————————

type MascotProps = {
  hue: number; // 0..360
  className?: string;
};

// ————————————————————————————————————————————————
// Main component
// ————————————————————————————————————————————————

export default function PrimarySchoolLanding() {
  const [query, setQuery] = useState<string>("");
  const [lastPlayed, setLastPlayed] = useState<LastPlayedMap>({});

  // Load last-played map on mount
  useEffect(() => {
    setLastPlayed(readLastPlayed());
  }, []);

  const categories: readonly Category[] = useMemo(
    () => [
      { key: "alphabets", title: "Alphabets", to: "/alphabets", icon: BookA, gradient: "from-pink-400 via-rose-400 to-red-400", badge: "A–Z" },
      { key: "phonics", title: "Phonics", to: "#", icon: Volume2, gradient: "from-amber-300 via-amber-400 to-orange-400", badge: "Sounds" },
      { key: "numbers", title: "Numbers", to: "#", icon: Calculator, gradient: "from-emerald-300 via-emerald-400 to-teal-400", badge: "1–100" },
      { key: "times-tables", title: "Times Tables", to: "#", icon: Puzzle, gradient: "from-green-300 via-lime-400 to-yellow-300", badge: "×1–×12" },
      { key: "shapes", title: "Shapes", to: "#", icon: Shapes, gradient: "from-sky-300 via-cyan-300 to-blue-400", badge: "2D/3D"},
      { key: "colours", title: "Colours", to: "#", icon: Palette, gradient: "from-fuchsia-300 via-purple-400 to-indigo-400", badge: "Mix it!" },
      { key: "time", title: "Telling Time", to: "#", icon: Clock3, gradient: "from-cyan-300 via-teal-400 to-emerald-400", badge: "Analog" },
      { key: "money", title: "Money", to: "#", icon: Coins, gradient: "from-yellow-300 via-amber-400 to-orange-400", badge: "£ & p" },
      { key: "measure", title: "Measure", to: "#", icon: Ruler, gradient: "from-indigo-300 via-blue-400 to-sky-400", badge: "cm / g / ml" },
      { key: "reading", title: "Reading", to: "#", icon: BookOpen, gradient: "from-rose-300 via-pink-400 to-fuchsia-400", badge: "Stories"},
      { key: "coding", title: "Coding Basics", to: "#", icon: Keyboard, gradient: "from-violet-300 via-purple-400 to-fuchsia-400", badge: "Logic" },
    ] as const,
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => {
      const matchesText = !q || c.title.toLowerCase().includes(q) || c.key.includes(q);
      return matchesText;
    });
  }, [categories, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 via-base-100 to-base-200">
      {/* Top bar */}
      <div className="navbar bg-base-100/70 backdrop-blur supports-[backdrop-filter]:bg-base-100/60 sticky top-0 z-20 border-b border-base-200">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost normal-case text-xl">
            <span className="font-black tracking-tight">Primary</span>
            <span className="font-black tracking-tight text-primary">Play</span>
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          <label className="input input-bordered hidden sm:flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search topics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search categories"
            />
            <kbd className="kbd kbd-sm">/</kbd>
          </label>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Fun, bite‑size learning for
                <span className="text-primary"> Primary School</span>
              </h1>
              <p className="mt-3 text-base-content/70 max-w-prose">
                Tap a tile to jump into colourful lessons, quick games, and quizzes
                designed for ages 4–11.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="badge badge-primary badge-lg">KS1</div>
                <div className="badge badge-secondary badge-lg">KS2</div>
                <div className="badge badge-accent badge-lg">Parent friendly</div>
              </div>
            </div>
            <div className="relative">
              <div className="mockup-window border bg-base-300/40 shadow-xl">
                <div className="px-6 py-10 bg-base-200/70">
                  <div className="flex items-center justify-center gap-3 text-3xl font-black">
                    <span role="img" aria-label="sparkles">✨</span>
                    Learn • Play • Repeat
                    <span role="img" aria-label="rocket">🚀</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls (mobile search) */}
      <div className="md:hidden px-4 sm:px-6 lg:px-8 -mt-4">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Search topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-xs opacity-60">Search</span>
        </label>
      </div>

      {/* Grid */}
      <section id="grid" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((c) => (
            <CategoryCard
              key={c.key}
              cat={c}
              lastPlayedAt={lastPlayed[c.key]}
              onOpen={() => {
                touchLastPlayed(c.key);
                setLastPlayed((prev) => ({ ...prev, [c.key]: Date.now() }));
              }}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="text-6xl">🔎</div>
            <p className="mt-3 opacity-70">No results. Try a different search or age filter.</p>
            <button className="btn btn-link" onClick={() => { setQuery(""); }}>Clear filters</button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-base-200 bg-base-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm opacity-70">© {new Date().getFullYear()} PrimaryPlay. Made with ❤️ for curious kids.</p>
          <div className="flex items-center gap-2">
            <Link to="/parents" className="link link-hover text-sm">Parents & Teachers</Link>
            <span className="opacity-30">•</span>
            <Link to="/about" className="link link-hover text-sm">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ————————————————————————————————————————————————
// Card component with mascot + last-played chip
// ————————————————————————————————————————————————

type CategoryCardProps = {
  cat: Category;
  lastPlayedAt?: number;
  onOpen: () => void;
};

function CategoryCard({ cat, lastPlayedAt, onOpen }: CategoryCardProps): React.JSX.Element {
  const { title, to, icon: Icon, gradient, badge } = cat;
  const last = timeAgo(lastPlayedAt);

  const isActive = to !== "#";

  return (
    <div className="relative">
      <Link
        to={to}
        onClick={onOpen}
        className={"group card bg-base-100 shadow-xl border border-base-200" + (isActive ? " hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5" : " cursor-not-allowed opacity-70")}
      >
        <div className="card-body p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className={`mask mask-squircle p-3 sm:p-4 bg-gradient-to-tr ${gradient} shadow-inner`}> 
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow" />
            </div>
            <div className="flex flex-col items-end gap-1">
              {badge && (
                <div className="badge badge-soft badge-primary badge-outline whitespace-nowrap">{badge}</div>
              )}
              {last && isActive && (
                <div className="badge badge-ghost text-xs opacity-80" title={new Date(lastPlayedAt!).toLocaleString()}>
                  Last played: {last}
                </div>
              )}
            </div>
          </div>

          <h3 className="card-title mt-2 text-base sm:text-lg">{title}</h3>
          <div className="card-actions mt-3">
            {isActive ? (<span className="btn btn-sm btn-primary btn-soft group-hover:btn-secondary">Open</span>) 
            : (<span className="btn btn-sm btn-disabled btn-soft">Coming Soon</span>)}
          </div>
        </div>
      </Link>

    </div>
  );
}

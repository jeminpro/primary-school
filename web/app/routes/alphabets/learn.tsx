import { Link } from "react-router";
import react, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Settings2, Volume2, Type, CaseUpper, CaseLower } from "lucide-react";

/** Guarded TTS helper (safe during SSR) */
function say(text: string) {
  if (typeof window === "undefined") return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9; // calm
  u.pitch = 1;
  u.lang = "en-GB"; // UK voice
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/** Simple phonics lines (tweak to your curriculum) */
const letterSound: Record<string, string> = {
  a: "a as in apple",
  b: "b as in ball",
  c: "c as in cat",
  d: "d as in dog",
  e: "e as in egg",
  f: "f as in fish",
  g: "g as in goat",
  h: "h as in hat",
  i: "i as in insect",
  j: "j as in jam",
  k: "k as in kite",
  l: "l as in lion",
  m: "m as in moon",
  n: "n as in nose",
  o: "o as in orange",
  p: "p as in pig",
  q: "q as in queen",
  r: "r as in rabbit",
  s: "s as in sun",
  t: "t as in tiger",
  u: "u as in umbrella",
  v: "v as in van",
  w: "w as in window",
  x: "x as in fox",
  y: "y as in yellow",
  z: "z as in zebra",
};

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

// LocalStorage keys
const LS_MODE = "alpha_learn_mode"; // "name" | "sound"
const LS_CASE = "alpha_learn_upper"; // "1" | "0"

export default function AlphabetLearn(): react.JSX.Element {
  const [mode, setMode] = useState<"sound" | "name">("name");
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [controlsOpen, setControlsOpen] = useState<boolean>(false);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  // hydrate prefs from localStorage
  useEffect(() => {
    try {
      const m = localStorage.getItem(LS_MODE);
      if (m === "name" || m === "sound") setMode(m);
      const c = localStorage.getItem(LS_CASE);
      if (c === "0" || c === "1") setUppercase(c === "1");
    } catch { }
  }, []);

  // persist prefs
  useEffect(() => {
    try {
      localStorage.setItem(LS_MODE, mode);
      localStorage.setItem(LS_CASE, uppercase ? "1" : "0");
    } catch { }
  }, [mode, uppercase]);

  const lettersDisplay = useMemo(() => letters.map((l) => (uppercase ? l.toUpperCase() : l)), [uppercase]);

  const speak = (i: number) => {
    const l = letters[i];
    if (mode === "name") say(uppercase ? l.toUpperCase() : l);
    else say(letterSound[l]);
    setActiveIndex(i);
    setTimeout(() => setActiveIndex(null), 180);
  };

  // Keyboard: A–Z triggers, Space toggles mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setMode((m) => (m === "sound" ? "name" : "sound"));
        return;
      }
      const ch = e.key.toLowerCase();
      const idx = letters.indexOf(ch);
      if (idx >= 0) {
        speak(idx);
        buttonsRef.current[idx]?.focus();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [uppercase, mode]);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-200 to-sky-100 overflow-hidden">
      {/* Background scene */}
      <PeppaBackdrop />

      <div className="relative z-10 p-4 flex justify-between">
        <Link to="/alphabets" className="btn btn-sm md:btn-md rounded-full bg-white/80 hover:bg-white border-2 border-white shadow-sm gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Back</span>
        </Link>

        <button className="btn btn-primary rounded-full gap-2" onClick={() => setControlsOpen(true)} aria-haspopup="dialog" aria-controls="controls_modal">
          <Settings2 className="w-4 h-4" /> Controls
        </button>
      </div>




      {/* Letter grid */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-6xl mt-6 grid grid-cols-4 md:grid-cols-9 gap-2 md:gap-3">
          {letters.map((l, i) => (
            <LetterTile
              key={l}
              letter={lettersDisplay[i]}
              raw={l}
              active={activeIndex === i}
              onClick={() => speak(i)}
              buttonRef={(el) => (buttonsRef.current[i] = el)}
            />
          ))}
        </div>
      </section>

      {/* Controls Modal (DaisyUI dialog) */}
      <dialog id="controls_modal" className={`modal ${controlsOpen ? "modal-open" : ""}`} onClose={() => setControlsOpen(false)}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Learning Controls</h3>
          <p className="opacity-70 text-sm mb-4">Choose what you hear and how letters look.</p>

          <div className="space-y-6">
            {/* Mode */}
            <div>
              <div className="mb-2 font-semibold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Mode</div>
              <div className="join">
                <button
                  className={`join-item btn ${mode === "name" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setMode("name")}
                  aria-pressed={mode === "name"}
                >
                  Name (A, Bee, C)
                </button>
                <button
                  className={`join-item btn ${mode === "sound" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setMode("sound")}
                  aria-pressed={mode === "sound"}
                >
                  Sound (a as in apple)
                </button>
              </div>
            </div>

            {/* Case */}
            <div>
              <div className="mb-2 font-semibold flex items-center gap-2"><Type className="w-4 h-4" /> Case</div>
              <div className="join">
                <button
                  className={`join-item btn ${uppercase ? "btn-secondary" : "btn-ghost"}`}
                  onClick={() => setUppercase(true)}
                  aria-pressed={uppercase}
                >
                  <CaseUpper className="w-4 h-4 mr-1" /> UPPERCASE
                </button>
                <button
                  className={`join-item btn ${!uppercase ? "btn-secondary" : "btn-ghost"}`}
                  onClick={() => setUppercase(false)}
                  aria-pressed={!uppercase}
                >
                  <CaseLower className="w-4 h-4 mr-1" /> lowercase
                </button>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button className="btn" onClick={() => setControlsOpen(false)}>Done</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setControlsOpen(false)}>
          <button>close</button>
        </form>
      </dialog>

      {/* Bottom hill overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-green-300/80 to-green-200/20" />
    </main>
  );
}

// ————————————————————————————————————————————————
// Letter tile – shows image if present, otherwise a big friendly letter
// ————————————————————————————————————————————————

type LetterTileProps = {
  letter: string; // displayed (upper/lower)
  raw: string; // lowercase key 'a'..'z'
  active: boolean;
  onClick: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
};

function LetterTile({ letter, raw, active, onClick, buttonRef }: LetterTileProps): React.JSX.Element {
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={[
        "relative aspect-square select-none rounded-2xl border-2 transition",
        active
          ? "bg-[#FFF6FB] border-[#FF79C7] scale-[0.98] shadow-[0_5px_0_#FFD1E8]"
          : "bg-white/90 border-[#FFD1E8] hover:border-[#FF79C7] hover:shadow-[0_5px_0_#FFD1E8]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200",
      ].join(" ")}
      aria-label={`Letter ${letter}. ${letterSound[raw]}`}
    >
      <div className="absolute inset-0 p-2 grid place-items-center">
        <span className="font-extrabold text-[#7B2E4A] text-5xl sm:text-6xl">{letter}</span>
      </div>
    </button>
  );
}

// ————————————————————————————————————————————————
// Background scene: clouds + sun + hills (Peppa-ish vibe)
// ————————————————————————————————————————————————

function PeppaBackdrop(): react.JSX.Element {
  return (
    <div className="absolute inset-0 -z-0" aria-hidden>
      {/* sun */}
      <div className="absolute right-6 top-6 w-20 h-20 rounded-full bg-yellow-300 shadow-[0_0_0_6px_rgba(253,224,71,0.5)]" />

      {/* clouds */}
      <Cloud className="absolute left-8 top-14 scale-100" />
      <Cloud className="absolute right-16 top-24 scale-75" />
      <Cloud className="absolute left-1/2 top-10 -translate-x-1/2 scale-90" />

      {/* hills */}
      <div className="absolute -bottom-16 -left-10 w-80 h-48 bg-green-300 rounded-[50%] blur-[1px]" />
      <div className="absolute -bottom-20 left-40 w-96 h-56 bg-green-400 rounded-[50%] blur-[1px]" />
      <div className="absolute -bottom-24 right-0 w-96 h-52 bg-green-300 rounded-[50%] blur-[1px]" />
    </div>
  );
}

function Cloud({ className = "" }: { className?: string }): react.JSX.Element {
  return (
    <div className={"text-white/90 drop-shadow " + className}>
      <div className="flex items-center gap-1">
        <div className="bg-white w-14 h-8 rounded-full" />
        <div className="bg-white w-10 h-10 rounded-full -ml-3" />
        <div className="bg-white w-16 h-9 rounded-full -ml-4" />
      </div>
    </div>
  );
}

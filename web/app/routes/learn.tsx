import { useEffect, useMemo, useRef, useState } from "react";

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
  x: "x as in fox", // end sound
  y: "y as in yellow",
  z: "z as in zebra",
};

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

export default function LearnPage() {
  const [mode, setMode] = useState<"sound" | "name">("name");
  const [uppercase, setUppercase] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const speak = (i: number) => {
    const l = letters[i];
    if (mode === "name") say(uppercase ? l.toUpperCase() : l);
    else say(letterSound[l]);
    setActiveIndex(i);
    // brief visual pulse
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
        // move focus to the pressed letter’s button (accessibility)
        buttonsRef.current[idx]?.focus();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [uppercase, mode]);


  return (
    <main className="min-h-screen flex flex-col bg-[#FDF7FB]">
      {/* Header bar (Peppa-esque palette, no IP assets) */}
      <header className="sticky top-0 z-10">
        <div className="h-16 w-full bg-[#FFD1E8] border-b-2 border-[#FFD1E8] shadow-[0_2px_0_#FFB3D6] flex items-center px-4">
          <h1 className="font-extrabold text-[#7B2E4A] text-lg sm:text-xl">Peppa pig</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[#7B2E4A] font-semibold mr-1">Mode</span>
            <div className="join">
              <button
                className={
                  "join-item btn btn-sm rounded-full border-2 " +
                  (mode === "sound"
                    ? "bg-[#FFB3D6] border-[#FF79C7] text-[#7B2E4A]"
                    : "bg-white border-[#FF79C7] text-[#7B2E4A]")
                }
                onClick={() => setMode("sound")}
                aria-pressed={mode === "sound"}
              >
                Sound
              </button>
              <button
                className={
                  "join-item btn btn-sm rounded-full border-2 " +
                  (mode === "name"
                    ? "bg-[#FFB3D6] border-[#FF79C7] text-[#7B2E4A]"
                    : "bg-white border-[#FF79C7] text-[#7B2E4A]")
                }
                onClick={() => setMode("name")}
                aria-pressed={mode === "name"}
              >
                Name
              </button>
            </div>

            <span className="text-[#7B2E4A] font-semibold mx-2">Case</span>
            <div className="join">
              <button
                className={
                  "join-item btn btn-sm rounded-full border-2 " +
                  (uppercase
                    ? "bg-[#FFB3D6] border-[#FF79C7] text-[#7B2E4A]"
                    : "bg-white border-[#FF79C7] text-[#7B2E4A]")
                }
                onClick={() => setUppercase(true)}
                aria-pressed={uppercase}
              >
                UPPER
              </button>
              <button
                className={
                  "join-item btn btn-sm rounded-full border-2 " +
                  (!uppercase
                    ? "bg-[#FFB3D6] border-[#FF79C7] text-[#7B2E4A]"
                    : "bg-white border-[#FF79C7] text-[#7B2E4A]")
                }
                onClick={() => setUppercase(false)}
                aria-pressed={!uppercase}
              >
                lower
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Content */}
      <section className="flex-1 px-4 pb-10">

        {/* Letter grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-6 md:grid-cols-9 gap-2 mt-5 ">
          {letters.map((l, i) => {
            const show = uppercase ? l.toUpperCase() : l;
            const active = activeIndex === i;
            return (
              <button
                key={l}
                ref={(el) => { buttonsRef.current[i] = el; }}
                onClick={() => speak(i)}
                className={[
                  "relative aspect-square select-none",
                  "rounded-2xl border-2 transition transform",
                  active
                    ? "bg-[#FFF6FB] border-[#FF79C7] scale-[0.98] shadow-[0_5px_0_#FFD1E8]"
                    : "bg-white border-[#FFD1E8] hover:border-[#FF79C7] hover:shadow-[0_5px_0_#FFD1E8]",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200",
                ].join(" ")}
                aria-label={`Letter ${show}. ${mode === "sound" ? letterSound[l] : "Letter name"}`}
              >
                <span className="absolute inset-0 grid place-items-center font-extrabold text-[#7B2E4A] text-5xl sm:text-6xl">
                  {show}
                </span>                
              </button>
            );
          })}
        </div>

        
      </section>
    </main>
  );
}

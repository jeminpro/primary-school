import { Link } from "react-router";
import react, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CaseUpper, CaseLower } from "lucide-react";
import { AUDIO_BASE, say, loadLetterHistory } from "../../lib/alphabet";
import type { LetterHistory } from "../../lib/alphabet";


const letters = "abcdefghijklmnopqrstuvwxyz".split("");

// LocalStorage keys
const LS_CASE = "alpha_learn_upper"; // "1" | "0"


export default function AlphabetLearn(): react.JSX.Element {
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // controlsOpen removed; case toggle moved inline
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [letterHistory, setLetterHistory] = useState<LetterHistory>(() => (typeof window === "undefined" ? {} : loadLetterHistory()));

  // Single audio element for smooth playback + cancellation
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // hydrate prefs from localStorage
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_CASE);
      if (c === "0" || c === "1") setUppercase(c === "1");
    } catch {}
  }, []);

  // persist prefs
  useEffect(() => {
    try {
      localStorage.setItem(LS_CASE, uppercase ? "1" : "0");
    } catch {}
  }, [uppercase]);

  const lettersDisplay = useMemo(
    () => letters.map((l) => (uppercase ? l.toUpperCase() : l)),
    [uppercase]
  );

  /** Play MP3 for a given lower-case letter; fallback to TTS if needed */
  function playLetterAudio(letterLower: string) {
    if (typeof window === "undefined") return;
    const src = `${AUDIO_BASE}/${letterLower}.mp3`;

    // stop any current speech or audio
    try { window.speechSynthesis.cancel(); } catch {}
    try {
      if (audioRef.current) audioRef.current.pause();
      const a = new Audio(src);
      audioRef.current = a;
      a.currentTime = 0;
      a.play().catch(() => {
        // autoplay blocked or file missing — fallback to TTS of the letter name
        say(letterLower);
      });
    } catch {
      say(letterLower);
    }
  }

  const speak = (i: number) => {
    const l = letters[i]; // always lower-case key
    playLetterAudio(l);
    setActiveIndex(i);
    setTimeout(() => setActiveIndex(null), 180);
  };

  // Preload audio for snappier first plays (optional)
  useEffect(() => {
    letters.forEach((l) => {
      const a = new Audio(`${AUDIO_BASE}/${l}.mp3`);
      a.preload = "auto";
    });
  }, []);

  // Reload history after hydration (safe client-only read)
  useEffect(() => {
    setLetterHistory(loadLetterHistory());
  }, []);

  // Keyboard: A–Z triggers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
  }, [uppercase]);

  return (
    <div className="relative z-10">
      <div className="p-4 flex justify-between">
        <Link
          to="/alphabets"
          className="btn btn-sm md:btn-md rounded-full bg-white/80 hover:bg-white border-2 border-white shadow-sm gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Back</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm ${uppercase ? "btn-secondary" : "btn-ghost"}`}
            onClick={() => setUppercase(true)}
            aria-pressed={uppercase}
            title="Uppercase"
          >
            <CaseUpper className="w-4 h-4" />
          </button>
          <button
            className={`btn btn-sm ${!uppercase ? "btn-secondary" : "btn-ghost"}`}
            onClick={() => setUppercase(false)}
            aria-pressed={!uppercase}
            title="Lowercase"
          >
            <CaseLower className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Letter grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-6xl mt-6 grid grid-cols-4 md:grid-cols-9 gap-2 md:gap-3">
          {letters.map((l, i) => (
            <LetterTile
              key={l}
              letter={lettersDisplay[i]}
              raw={l}
              active={activeIndex === i}
              onClick={() => speak(i)}
              buttonRef={(el) => (buttonsRef.current[i] = el)}
              history={letterHistory[l] ? (uppercase ? letterHistory[l].upper : letterHistory[l].lower) : []}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ————————————————————————————————————————————————
// Letter tile – big friendly letter
// ————————————————————————————————————————————————

type LetterTileProps = {
  letter: string; // displayed (upper/lower)
  raw: string; // lowercase key 'a'..'z'
  active: boolean;
  onClick: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
  history?: boolean[];
};

function LetterTile({ letter, raw, active, onClick, buttonRef, history }: LetterTileProps): React.JSX.Element {
  const recent = (history ?? []).slice(-5);
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={[
        "relative aspect-square select-none rounded-2xl border-2 transition flex flex-col",
        active
          ? "bg-[#FFF6FB] border-[#FF79C7] scale-[0.98] shadow-[0_5px_0_#FFD1E8]"
          : "bg-white/90 border-[#FFD1E8] hover:border-[#FF79C7] hover:shadow-[0_5px_0_#FFD1E8]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200",
      ].join(" ")}
      aria-label={`Letter ${letter}`}
    >
      <div className="flex-1 grid place-items-center p-4">
        <span className="font-extrabold text-[#7B2E4A] text-5xl sm:text-6xl">{letter}</span>
      </div>
      <div className="h-6 flex items-center justify-center pb-2">
        <div className="flex gap-1">
          {recent.map((v, i) => (
            <span key={i} className={"block w-2 h-2 rounded-full " + (v ? "bg-emerald-500" : "bg-rose-500")} />
          ))}
          {Array.from({ length: Math.max(0, 5 - recent.length) }).map((_, i) => (
            <span key={`pad-${i}`} className="block w-2 h-2 rounded-full bg-gray-200" />
          ))}
        </div>
      </div>
    </button>
  );
}

// ————————————————————————————————————————————————
// Background scene: clouds + sun + hills (Peppa-ish vibe)
// ————————————————————————————————————————————————

// Backdrop and cloud helpers removed — provided by layout

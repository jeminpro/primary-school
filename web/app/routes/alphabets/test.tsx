import { Link } from "react-router";
import react, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Volume2,
  Check,
  X as XIcon,
  CaseUpper,
  CaseLower,
} from "lucide-react";

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

/** Simple phonics lines */
const letterSound: Record<string, string> = {
  a: "a", b: "b", c: "c", d: "d", e: "e", f: "f", g: "g", h: "h",
  i: "i", j: "j", k: "k", l: "l", m: "m", n: "n", o: "o", p: "p",
  q: "q", r: "r", s: "s", t: "t", u: "u", v: "v", w: "w", x: "x",
  y: "y", z: "z",
};

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

type Result = { target: string; guess: string; correct: boolean };

type LetterTileProps = {
  letter: string; // displayed (upper/lower)
  raw: string; // lowercase key 'a'..'z'
  onClick: () => void;
  highlight?: "none" | "correct" | "wrong";
};

function LetterTile({ letter, raw, onClick, highlight = "none" }: LetterTileProps): react.JSX.Element {
  const base =
    "relative aspect-square select-none rounded-2xl border-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 grid place-items-center";
  const style =
    highlight === "correct"
      ? "bg-emerald-50 border-emerald-300 shadow-[0_5px_0_#86efac]"
      : highlight === "wrong"
        ? "bg-rose-50 border-rose-300 shadow-[0_5px_0_#fda4af]"
        : "bg-white/90 border-[#FFD1E8] hover:border-[#FF79C7] hover:shadow-[0_5px_0_#FFD1E8]";
  return (
    <button className={`${base} ${style}`} onClick={onClick} aria-label={`Choose ${letter}`}>
      <span className="font-extrabold text-[#7B2E4A] text-5xl">{letter}</span>
    </button>
  );
}

// ————————————————————————————————————————————————
// Helpers
// ————————————————————————————————————————————————

function sampleQuestions(pool: string[], n: number): string[] {
  // If pool >= n -> sample without replacement; else allow repeats
  const arr = [...pool];
  if (arr.length >= n) {
    // Fisher–Yates shuffle, then slice
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, n);
  }
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
}

// NEW: light shuffle helper (for grid order)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// LocalStorage key for test settings
const LS_TEST_PREFS = "alpha_test_prefs_v2";

// ————————————————————————————————————————————————
// Main component
// ————————————————————————————————————————————————

export default function AlphabetTest(): react.JSX.Element {
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [selectMode, setSelectMode] = useState<"all" | "custom">("all");
  const [customSet, setCustomSet] = useState<Set<string>>(() => new Set<string>());
  const [qCount, setQCount] = useState<5 | 10 | 20 | 30>(10); // include 5 since UI offers it

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]); // lower-case letters
  const [results, setResults] = useState<Result[]>([]);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);

  // NEW: toggle for juggling grid order (default NO)
  const [shuffleGrid, setShuffleGrid] = useState<boolean>(false);

  // NEW: lock grid between answer and next question
  const [locked, setLocked] = useState(false);

  // Hydration guard so we don't overwrite saved data on first mount
  const [hydrated, setHydrated] = useState(false);

  // —— Load saved settings on mount ——
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_TEST_PREFS);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{
          uppercase: boolean;
          selectMode: "all" | "custom";
          customSet: string[];
          qCount: number;
          shuffleGrid: boolean;
        }>;

        if (typeof saved.uppercase === "boolean") setUppercase(saved.uppercase);
        if (saved.selectMode === "all" || saved.selectMode === "custom") setSelectMode(saved.selectMode);
        if (Array.isArray(saved.customSet)) {
          const valid = saved.customSet.filter((c) => letters.includes(c));
          setCustomSet(new Set(valid));
        }
        const allowedCounts = [5, 10, 20, 30];
        if (typeof saved.qCount === "number" && allowedCounts.includes(saved.qCount)) {
          setQCount(saved.qCount as 5 | 10 | 20 | 30);
        }
        if (typeof saved.shuffleGrid === "boolean") setShuffleGrid(saved.shuffleGrid);
      }
    } catch {
      // ignore parse/LS errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // —— Persist settings whenever they change (after hydration) ——
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload = {
        uppercase,
        selectMode,
        customSet: Array.from(customSet),
        qCount,
        shuffleGrid,
      };
      localStorage.setItem(LS_TEST_PREFS, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [uppercase, selectMode, customSet, qCount, shuffleGrid, hydrated]);

  const choicePool = useMemo(() => {
    if (selectMode === "all") return letters;
    const arr = Array.from(customSet);
    return arr.length ? arr : letters; // safe fallback
  }, [selectMode, customSet]);

  // Respect shuffleGrid for the choices grid
  const displayPool = useMemo(() => {
    const base = shuffleGrid ? shuffle(choicePool) : choicePool;
    return base.map((l) => (uppercase ? l.toUpperCase() : l));
  }, [choicePool, uppercase, shuffleGrid]);

  const currentLetter = questions[index]; // lower-case
  const displayLetter = uppercase && currentLetter ? currentLetter.toUpperCase() : currentLetter;

  function startTest() {
    const pool = choicePool;
    const qs = sampleQuestions(pool, qCount);
    setQuestions(qs);
    setResults([]);
    setIndex(0);
    setStarted(true);
    setFinished(false);
    setControlsOpen(false);
    // Speak first prompt after a tiny delay (smoother)
    setTimeout(() => speakCurrent(qs[0]), 250);
  }

  function speakCurrent(ltr?: string) {
    const l = (ltr ?? currentLetter) as string;
    if (!l) return;
    say(letterSound[l]); // test uses the SOUND prompt
  }

  function onPick(guessDisplay: string) {
    if (!started || finished || locked) return; // ← block extra clicks
    setLocked(true);

    const guess = guessDisplay.toLowerCase();
    const target = currentLetter;
    const isCorrect = guess === target;
    setResults((prev) => [...prev, { target, guess, correct: isCorrect }]);
    setFlash(isCorrect ? "correct" : "wrong");

    // pause before advancing (1.5s)
    setTimeout(() => {
      setFlash(null);
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setTimeout(() => {
          speakCurrent(questions[index + 1]);
          setLocked(false); // unlock for next question after prompt plays
        }, 200);
      } else {
        setFinished(true);
        setLocked(false);
      }
    }, 1500);
  }

  function resetTest() {
    setStarted(false);
    setFinished(false);
    setIndex(0);
    setQuestions([]);
    setResults([]);
    setFlash(null);
    setLocked(false);
  }

  // ——— UI ———
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-200 to-sky-100 overflow-hidden">
      <PeppaBackdrop />

      {/* Header row */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/alphabets"
            className="btn btn-sm md:btn-md rounded-full bg-white/80 hover:bg-white border-2 border-white shadow-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back</span>
          </Link>
        </div>
      </div>

      {/* Prompt + controls when running */}
      {started && !finished && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-base-100/70 backdrop-blur border border-base-200 shadow-xl p-4 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm opacity-70">Question</div>
                  <div className="text-xl font-bold">
                    {index + 1} / {questions.length}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-secondary btn-sm rounded-full gap-2"
                    onClick={() => speakCurrent()}
                    disabled={locked}
                  >
                    <Volume2 className="w-4 h-4" /> Hear again
                  </button>
                </div>
              </div>

              {/* subtle progress bar */}
              <progress
                className="progress progress-primary w-full mt-3"
                value={index}
                max={questions.length - 1}
              ></progress>

              {/* Feedback banner – no layout shift */}
              <div className="mt-3">
                {/*
                  Always render an alert-sized box.
                  Use visibility/opacity to show/hide without affecting layout.
                */}
                {(() => {
                  const type = (flash ?? "correct") as "correct" | "wrong";
                  return (
                    <div
                      className={
                        "alert h-12 items-center transition-opacity duration-150 " +
                        (type === "correct" ? "alert-success" : "alert-error") +
                        " " +
                        (flash ? "opacity-100 visible" : "opacity-0 invisible")
                      }
                    >
                      {type === "correct" ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          <span>Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XIcon className="w-5 h-5" />
                          <span>Oops!</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of choices (running) */}
      {started && !finished && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-24">
          <div
            className={
              "mx-auto max-w-6xl mt-6 grid grid-cols-5 md:grid-cols-9 gap-1 md:gap-3 " +
              (locked ? "pointer-events-none opacity-70" : "")
            }
            aria-disabled={locked}
          >
            {displayPool.map((disp) => (
              <LetterTile
                key={disp}
                letter={disp}
                raw={disp.toLowerCase()}
                onClick={() => onPick(disp)}
                highlight="none"
              />
            ))}
          </div>
        </section>
      )}

      {/* Inline Setup (initial screen) */}
      {!started && !finished && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-3xl mt-8">
            <div className="rounded-3xl bg-base-100/70 backdrop-blur border border-base-200 shadow-xl p-6">
              <h2 className="text-2xl font-bold text-center">Ready to test your letters?</h2>
              <p className="opacity-70 mt-1 text-center">
                Choose your options and press <span className="font-semibold">Start</span>.
              </p>

              <div className="mt-6 space-y-6">
                {/* Letters: All or Specific */}
                <div>
                  <div className="mb-2 font-semibold">Letters</div>
                  <div className="join">
                    <button
                      className={`join-item btn ${selectMode === "all" ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setSelectMode("all")}
                      type="button"
                    >
                      All (A–Z)
                    </button>
                    <button
                      className={`join-item btn ${selectMode === "custom" ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setSelectMode("custom")}
                      type="button"
                    >
                      Choose letters
                    </button>
                  </div>

                  {selectMode === "custom" && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm opacity-70">
                          Tap letters to toggle. Selected: {customSet.size}
                        </div>
                        <div className="space-x-2">
                          <button
                            className="btn btn-xs"
                            onClick={() => setCustomSet(new Set(letters))}
                            type="button"
                          >
                            Select all
                          </button>
                          <button
                            className="btn btn-xs"
                            onClick={() => setCustomSet(new Set())}
                            type="button"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-8 gap-2">
                        {letters.map((l) => {
                          const chosen = customSet.has(l);
                          const disp = uppercase ? l.toUpperCase() : l;
                          return (
                            <button
                              key={l}
                              type="button"
                              onClick={() =>
                                setCustomSet((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(l)) next.delete(l);
                                  else next.add(l);
                                  return next;
                                })
                              }
                              className={"btn btn-sm " + (chosen ? "btn-secondary" : "btn-ghost")}
                            >
                              {disp}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Case */}
                <div>
                  <div className="mb-2 font-semibold">Case</div>
                  <div className="join">
                    <button
                      className={`join-item btn ${uppercase ? "btn-secondary" : "btn-ghost"}`}
                      onClick={() => setUppercase(true)}
                      type="button"
                    >
                      <CaseUpper className="w-4 h-4 mr-1" /> UPPERCASE
                    </button>
                    <button
                      className={`join-item btn ${!uppercase ? "btn-secondary" : "btn-ghost"}`}
                      onClick={() => setUppercase(false)}
                      type="button"
                    >
                      <CaseLower className="w-4 h-4 mr-1" /> lowercase
                    </button>
                  </div>
                </div>

                {/* Alphabet order */}
                <div>
                  <div className="mb-2 font-semibold">Alphabet order</div>
                  <div className="join">
                    <button
                      type="button"
                      className={`join-item btn ${!shuffleGrid ? "btn-secondary" : "btn-ghost"}`}
                      onClick={() => setShuffleGrid(false)}
                    >
                      A → Z
                    </button>
                    <button
                      type="button"
                      className={`join-item btn ${shuffleGrid ? "btn-secondary" : "btn-ghost"}`}
                      onClick={() => setShuffleGrid(true)}
                    >
                      Shuffle
                    </button>
                  </div>
                </div>

                {/* Number of questions */}
                <div>
                  <div className="mb-2 font-semibold">Number of questions</div>
                  <div className="join">
                    {[5, 10, 20, 30].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`join-item btn ${qCount === n ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setQCount(n as 5 | 10 | 20 | 30)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="btn btn-primary"
                  onClick={startTest}
                  disabled={selectMode === "custom" && customSet.size === 0}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {finished && (
        <section className="relative z-10 px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-4xl mt-6">
            <div className="rounded-3xl bg-base-100/70 backdrop-blur border border-base-200 shadow-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl font-bold">Results <button className="btn" onClick={() => { resetTest(); setControlsOpen(true); }}>Try Again</button></h2>
                <div className="text-lg font-semibold">
                  Score: {results.filter((r) => r.correct).length} / {results.length}
                </div>
              </div>

              {/* Dancing pig on perfect score */}
              {(() => {
                const allCorrect = results.length > 0 && results.every((r) => r.correct);
                return allCorrect ? (
                  <div className="mt-4 flex justify-center">
                    <img src="https://i.giphy.com/Pq2fdlMQwFvQvBTd0e.webp" alt="Dancing pig" className="h-40" />
                  </div>
                ) : null;
              })()}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.map((r, i) => {
                  const good = r.correct;
                  const correctDisp = uppercase ? r.target.toUpperCase() : r.target;
                  const guessDisp = uppercase ? r.guess.toUpperCase() : r.guess;
                  return (
                    <div
                      key={i}
                      className={`card border ${good ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">
                            Q{i + 1}
                          </div>

                          {good ? (
                            <div className="badge badge-success badge-lg">{correctDisp}</div>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="badge badge-error badge-lg">{guessDisp}</div>
                              <span className="opacity-60">→</span>
                              <div className="badge badge-success badge-lg">{correctDisp}</div>
                            </div>
                          )}

                          {good ? <Check className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom hill overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-green-300/80 to-green-200/20" />
    </main>
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

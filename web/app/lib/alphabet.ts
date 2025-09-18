import reactRouterConfig from "../../react-router.config";

// Base path for audio files in /public
export const AUDIO_BASE = reactRouterConfig.basename + "/alphabets";

/** Guarded TTS helper (safe during SSR) */
export function say(text: string) {
  if (typeof window === "undefined") return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    u.lang = "en-GB";
    try { window.speechSynthesis.cancel(); } catch {}
    window.speechSynthesis.speak(u);
  } catch {
    // ignore if speech synthesis not available
  }
}

export const letterSound: Record<string, string> = {
  a: "a", b: "b", c: "c", d: "d", e: "e", f: "f", g: "g", h: "h",
  i: "i", j: "j", k: "k", l: "l", m: "m", n: "n", o: "o", p: "p",
  q: "q", r: "r", s: "s", t: "t", u: "u", v: "v", w: "w", x: "x",
  y: "y", z: "z",
};

// LocalStorage keys
export const LS_LETTER_HISTORY = "alpha_letter_history_v1";

export type LetterHistory = {
  [k: string]: {
    upper: boolean[];
    lower: boolean[];
  };
};

export function loadLetterHistory(): LetterHistory {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_LETTER_HISTORY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LetterHistory;
    const out: LetterHistory = {};
    for (const k of Object.keys(parsed || {})) {
      if (!/^[a-z]$/.test(k)) continue;
      const e = parsed[k] || { upper: [], lower: [] };
      out[k] = { upper: Array.isArray(e.upper) ? e.upper.slice(-5).map(Boolean) : [], lower: Array.isArray(e.lower) ? e.lower.slice(-5).map(Boolean) : [] };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveLetterHistory(hist: LetterHistory) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_LETTER_HISTORY, JSON.stringify(hist));
  } catch {
    // ignore
  }
}

export function pushLetterHistory(hist: LetterHistory, raw: string, isUpper: boolean, correct: boolean): LetterHistory {
  const ch = raw.toLowerCase();
  const next: LetterHistory = { ...hist };
  if (!next[ch]) next[ch] = { upper: [], lower: [] };
  const arr = isUpper ? [...next[ch].upper] : [...next[ch].lower];
  arr.push(Boolean(correct));
  const sliced = arr.slice(-5);
  if (isUpper) next[ch].upper = sliced;
  else next[ch].lower = sliced;
  return next;
}

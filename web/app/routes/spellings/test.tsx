import React, { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { spellingsDB, type SpellingTest, type SpellingResult } from "../../lib/spellings-db";

function speakWordAndSentence(word: string, sentence?: string) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterWord = new window.SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterWord);
    if (sentence && sentence.trim()) {
      const utterSentence = new window.SpeechSynthesisUtterance(sentence);
      window.speechSynthesis.speak(utterSentence);
    }
  }
}

export default function SpellingTestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const test: SpellingTest | undefined = location.state?.test;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<SpellingTest["words"]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const doneBtnRef = useRef<HTMLButtonElement | null>(null);

  // Shuffle words only once when test is loaded
  useEffect(() => {
    if (test) {
      const arr = [...test.words];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffledWords(arr);
    }
  }, [test]);

  useEffect(() => {
    if (shuffledWords.length > 0 && step < shuffledWords.length) {
      const w = shuffledWords[step];
      speakWordAndSentence(w.word, w.sentence);
    }
    // eslint-disable-next-line
  }, [step, shuffledWords]);

  // Focus the input whenever the step (question) changes and we're not on summary
  useEffect(() => {
    if (!showSummary) {
      // Delay slightly to ensure DOM is updated before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [step, showSummary]);

  // When summary is shown, focus the Done button
  useEffect(() => {
    if (showSummary) {
      const t = setTimeout(() => doneBtnRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [showSummary]);

  if (!test) {
    return <div className="alert alert-error mt-8">No test selected.</div>;
  }

  function handleRepeat() {
    if (!shuffledWords.length) return;
    const w = shuffledWords[step];
    speakWordAndSentence(w.word, w.sentence);
  }

  function handleNext() {
    setAnswers(a => [...a, input]);
    setInput("");
    if (shuffledWords.length && step + 1 < shuffledWords.length) {
      setStep(step + 1);
    } else {
      setShowSummary(true);
    }
  }

  async function handleSaveResult() {
    if (!test) return;
    setSaving(true);
    const result: SpellingResult = {
      testId: test.id!,
      date: Date.now(),
      answers: shuffledWords.map((w, i) => ({
        word: w.word,
        correct: answers[i]?.trim().toLowerCase() === w.word.trim().toLowerCase(),
      })),
    };
    await spellingsDB.results.add(result);
    setSaving(false);
    navigate("/spellings", { replace: true });
  }

  if (showSummary && test) {
    const summary = shuffledWords.map((w, i) => ({
      word: w.word,
      user: answers[i] || "",
      correct: (answers[i] || "").trim().toLowerCase() === w.word.trim().toLowerCase(),
    }));
    const correctCount = summary.filter(s => s.correct).length;
    return (
      <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4 text-primary">Test Summary</h2>
        <div className="mb-4">You got <span className="font-bold text-success">{correctCount}</span> out of <span className="font-bold">{shuffledWords.length}</span> correct.</div>
        <div className="space-y-2 mb-6">
          {summary.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className={"badge " + (s.correct ? "badge-success" : "badge-error")}>{s.correct ? "✔" : "✗"}</span>
              <span className="font-semibold">{s.word}</span>
              <span className="opacity-60">Your answer: "{s.user}"</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button ref={doneBtnRef} className="btn btn-primary" onClick={handleSaveResult} disabled={saving}>{saving ? "Saving…" : "Done"}</button>
        </div>
      </div>
    );
  }

  if (!test || !shuffledWords.length) return null;
  const w = shuffledWords[step];
  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto mt-8">
      <div className="mb-4 flex items-center justify-between">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/spellings")}>← Back</button>
        <h2 className="text-2xl font-bold text-primary">Spell the word</h2>
        <div />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold">{step + 1} / {shuffledWords.length}</div>
        <button className="btn btn-ghost flex items-center gap-2" onClick={handleRepeat} title="Repeat">
          <Volume2 size={22} className="text-info" />
          <span className="text-info font-semibold">Repeat</span>
        </button>
      </div>
      <input
        type="text"
        inputMode="none"
        className="input input-bordered w-full text-lg"
        placeholder="Type the word..."
        value={input}
        onChange={e => setInput(e.target.value)}
        ref={inputRef}
        autoFocus
        onKeyDown={e => { if (e.key === "Enter") handleNext(); }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-form-type="other"
      />
      <div className="mt-6 flex gap-2 justify-end">
        <button className="btn btn-ghost" onClick={() => navigate("/spellings")}>Cancel</button>
        <button className="btn btn-primary" onClick={handleNext} disabled={!input.trim()}>Next</button>
      </div>
    </div>
  );
}

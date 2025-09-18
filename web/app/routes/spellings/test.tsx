import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (test && step < test.words.length) {
      const w = test.words[step];
      speakWordAndSentence(w.word, w.sentence);
    }
    // eslint-disable-next-line
  }, [step, test]);

  if (!test) {
    return <div className="alert alert-error mt-8">No test selected.</div>;
  }


  function handleRepeat() {
    if (!test) return;
    const w = test.words[step];
    speakWordAndSentence(w.word, w.sentence);
  }

  function handleNext() {
    setAnswers(a => [...a, input]);
    setInput("");
    if (test && step + 1 < test.words.length) {
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
      answers: test.words.map((w, i) => ({
        word: w.word,
        correct: answers[i]?.trim().toLowerCase() === w.word.trim().toLowerCase(),
      })),
    };
    await spellingsDB.results.add(result);
    setSaving(false);
    navigate("/spellings", { replace: true });
  }

  if (showSummary && test) {
    const summary = test.words.map((w, i) => ({
      word: w.word,
      user: answers[i] || "",
      correct: (answers[i] || "").trim().toLowerCase() === w.word.trim().toLowerCase(),
    }));
    const correctCount = summary.filter(s => s.correct).length;
    return (
      <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4 text-orange-400">Test Summary</h2>
        <div className="mb-4">You got <span className="font-bold text-success">{correctCount}</span> out of <span className="font-bold">{test.words.length}</span> correct.</div>
        <div className="space-y-2 mb-6">
          {summary.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className={"badge " + (s.correct ? "badge-success" : "badge-error")}>{s.correct ? "✔" : "✗"}</span>
              <span className="font-semibold">{s.word}</span>
              <span className="opacity-60">Your answer: "{s.user}"</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleSaveResult} disabled={saving}>{saving ? "Saving…" : "Done"}</button>
      </div>
    );
  }

  if (!test) return null;
  const w = test.words[step];
  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto mt-8">
      <div className="mb-4 flex items-center justify-between">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/spellings")}>← Back</button>
        <h2 className="text-2xl font-bold text-orange-400">Spell the word</h2>
        <div />
      </div>
      <div className="mb-2 text-lg font-semibold">{step + 1} / {test.words.length}</div>
      <div className="mb-4">
        <button className="btn btn-circle btn-accent mr-2" onClick={handleRepeat} title="Repeat">
          <span role="img" aria-label="speaker">🔊</span>
        </button>
        <span className="font-bold text-xl">Listen and type the word.</span>
      </div>
      <input
        className="input input-bordered w-full text-lg"
        placeholder="Type the word..."
        value={input}
        onChange={e => setInput(e.target.value)}
        autoFocus
        onKeyDown={e => { if (e.key === "Enter") handleNext(); }}
      />
      <div className="mt-6 flex gap-2 justify-end">
        <button className="btn btn-ghost" onClick={() => navigate("/spellings")}>Cancel</button>
        <button className="btn btn-primary" onClick={handleNext} disabled={!input.trim()}>Next</button>
      </div>
    </div>
  );
}

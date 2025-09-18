import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { spellingsDB, type SpellingTest, type SpellingResult } from "../../lib/spellings-db";

function speak(text: string) {
  if (window.speechSynthesis) {
    const utter = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }
}

async function fetchDictionary(word: string) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data[0];
  } catch {
    return null;
  }
}

export default function LearnSpellingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const test: SpellingTest | undefined = location.state?.test;
  const [results, setResults] = useState<SpellingResult[]>([]);
  const [dict, setDict] = useState<any>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictWord, setDictWord] = useState<string | null>(null);

  useEffect(() => {
    if (test?.id) {
      spellingsDB.results.where("testId").equals(test.id).reverse().toArray().then(setResults);
    }
  }, [test]);

  async function handleDictionary(word: string) {
    setDictLoading(true);
    setDictError(null);
    setDictWord(word);
    const data = await fetchDictionary(word);
    if (!data) {
      setDictError("No dictionary entry found.");
      setDict(null);
    } else {
      setDict(data);
    }
    setDictLoading(false);
  }

  if (!test) {
    return <div className="alert alert-error mt-8">No test selected.</div>;
  }

  function getLastResults(word: string) {
    // Get last 5 results for this word
    const dots: boolean[] = [];
    for (let i = 0; i < 5; ++i) {
      const r = results[i];
      if (!r) break;
      const ans = r.answers.find(a => a.word === word);
      dots.push(ans ? !!ans.correct : false);
    }
    return dots;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto mt-8">
      <div className="mb-4 flex items-center justify-between">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/spellings")}>← Back</button>
  <h2 className="text-2xl font-bold text-primary">Learn Words</h2>
        <div />
      </div>
      <div className="space-y-6">
        {test.words.map((w, idx) => (
          <div key={idx} className="card bg-base-100 shadow border border-base-200 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{w.word}</span>
              <button className="btn btn-xs btn-accent" onClick={() => speak(w.word + (w.sentence ? ". " + w.sentence : ""))}>Speak</button>
              <button className="btn btn-xs btn-info" onClick={() => handleDictionary(w.word)}>Dictionary</button>
            </div>
            {w.sentence && <div className="text-base-content/70 italic">{w.sentence}</div>}
            <div className="flex gap-1 mt-1">
              {getLastResults(w.word).map((correct, i) => (
                <span key={i} className={"w-3 h-3 rounded-full inline-block " + (correct ? "bg-success" : "bg-error/60")}></span>
              ))}
            </div>
            {dictWord === w.word && (
              <div className="mt-2">
                {dictLoading && <span className="loading loading-spinner loading-xs"></span>}
                {dictError && <div className="alert alert-error p-2 text-xs">{dictError}</div>}
                {dict && !dictError && (
                  <div className="text-xs">
                    <div className="font-bold mb-1">{dict.word} <span className="opacity-60">({dict.phonetic})</span></div>
                    {dict.meanings?.map((m: any, i: number) => (
                      <div key={i} className="mb-1">
                        <span className="font-semibold">{m.partOfSpeech}:</span> {m.definitions?.[0]?.definition}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2 justify-end">
        <button className="btn btn-ghost" onClick={() => navigate("/spellings")}>Back</button>
      </div>
    </div>
  );
}

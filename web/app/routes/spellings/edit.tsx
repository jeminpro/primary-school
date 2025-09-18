import React, { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { spellingsDB, type SpellingTest, type SpellingWord } from "../../lib/spellings-db";

function emptyWord(): SpellingWord {
  return { word: "", sentence: "" };
}

export default function EditSpellingTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTest: SpellingTest | undefined = location.state?.test;

  const [name, setName] = useState(editingTest?.name || "");
  const [words, setWords] = useState<SpellingWord[]>(editingTest?.words || [emptyWord()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wordRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  function handleWordChange(idx: number, field: keyof SpellingWord, value: string) {
    setWords(w => w.map((word, i) => i === idx ? { ...word, [field]: value } : word));
  }

  function handleAddWord() {
    setWords(w => [...w, emptyWord()]);
    setFocusIndex(words.length); // focus the new word input
  }

  function handleRemoveWord(idx: number) {
    setWords(w => w.length > 1 ? w.filter((_, i) => i !== idx) : w);
  }

  useEffect(() => {
    if (focusIndex !== null && wordRefs.current[focusIndex]) {
      const input = wordRefs.current[focusIndex];
      input?.focus();
      // Scroll input into view near the top of the page for mobile keyboard visibility
      setTimeout(() => {
        input?.scrollIntoView({ block: "start", behavior: "smooth" });
        // Optionally, add a small offset from the top
        if (window.scrollY > 20) {
          window.scrollBy({ top: -20, behavior: "smooth" });
        }
      }, 100);
      setFocusIndex(null);
    }
  }, [words, focusIndex]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Test name is required.");
      return;
    }
    if (words.some(w => !w.word.trim())) {
      setError("All words must have a value.");
      return;
    }
    setSaving(true);
    try {
      const test: SpellingTest = {
        ...editingTest,
        name: name.trim(),
        words: words.map(w => ({ word: w.word.trim(), sentence: w.sentence?.trim() })),
        createdAt: editingTest?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      if (editingTest?.id) {
        await spellingsDB.tests.put({ ...test, id: editingTest.id });
      } else {
        await spellingsDB.tests.add(test);
      }
      navigate("/spellings");
    } catch (err) {
      setError("Failed to save test. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center justify-between">
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => navigate("/spellings")}>← Back</button>
  <h2 className="text-2xl font-bold text-primary">{editingTest ? "Edit" : "Add"} Spelling Test</h2>
        <div />
      </div>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Name <span className="text-error">*</span></label>
        <input
          className="input input-bordered w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-2">Words <span className="text-error">*</span></label>
        <div className="space-y-4">
          {words.map((w, idx) => (
            <div key={idx} className="card bg-base-100 shadow border border-primary/20 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    className="input input-bordered w-full"
                    placeholder="Word"
                    value={w.word}
                    onChange={e => handleWordChange(idx, "word", e.target.value)}
                    required
                    ref={el => { wordRefs.current[idx] = el; }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm p-1 flex items-center"
                  style={{ height: '2.5rem' }}
                  onClick={() => handleRemoveWord(idx)}
                  disabled={words.length === 1}
                  title="Remove word"
                >
                  <Trash2 size={18} className="text-error" />
                </button>
              </div>
              <input
                className="input input-bordered w-full"
                placeholder="Sentence (optional)"
                value={w.sentence || ""}
                onChange={e => handleWordChange(idx, "sentence", e.target.value)}
              />
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={handleAddWord}>Add Word</button>
      </div>
      <div className="mt-6 flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/spellings")}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

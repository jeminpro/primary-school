import React, { useState } from "react";
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

  function handleWordChange(idx: number, field: keyof SpellingWord, value: string) {
    setWords(w => w.map((word, i) => i === idx ? { ...word, [field]: value } : word));
  }

  function handleAddWord() {
    setWords(w => [...w, emptyWord()]);
  }

  function handleRemoveWord(idx: number) {
    setWords(w => w.length > 1 ? w.filter((_, i) => i !== idx) : w);
  }

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
        <h2 className="text-2xl font-bold text-orange-400">{editingTest ? "Edit" : "Add"} Spelling Test</h2>
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
        <div className="space-y-3">
          {words.map((w, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  className="input input-bordered w-full mb-1"
                  placeholder="Word"
                  value={w.word}
                  onChange={e => handleWordChange(idx, "word", e.target.value)}
                  required
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Sentence (optional)"
                  value={w.sentence || ""}
                  onChange={e => handleWordChange(idx, "sentence", e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-error btn-xs" onClick={() => handleRemoveWord(idx)} disabled={words.length === 1}>
                Remove
              </button>
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

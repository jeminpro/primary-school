import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { spellingsDB, type SpellingTest, type SpellingResult } from "../../lib/spellings-db";
import { Plus } from "lucide-react";
import { TestList } from "./test-list";

export default function SpellingsMainPage() {
  const [tests, setTests] = useState<SpellingTest[]>([]);
  const [results, setResults] = useState<Record<number, SpellingResult[]>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      let allTests = await spellingsDB.tests.toArray();
      allTests = allTests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const allResults = await spellingsDB.results.toArray();
      const grouped: Record<number, SpellingResult[]> = {};
      for (const r of allResults) {
        if (!grouped[r.testId]) grouped[r.testId] = [];
        grouped[r.testId].push(r);
      }
      if (mounted) {
        setTests(allTests);
        setResults(grouped);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  function handleAdd() {
    navigate("/spellings/edit");
  }
  function handleEdit(test: SpellingTest) {
    navigate("/spellings/edit", { state: { test } });
  }
  function handleLearn(test: SpellingTest) {
    navigate("/spellings/learn", { state: { test } });
  }
  function handleTest(test: SpellingTest) {
    navigate("/spellings/test", { state: { test } });
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>← Back</button>
  <h2 className="text-2xl font-bold text-primary">Spelling Tests</h2>
        <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={handleAdd}>
          <Plus size={16} />
          Add
        </button>
      </div>
      {loading ? (
        <div className="text-base-content/60">Loading…</div>
      ) : (
        <TestList
          tests={tests}
          results={results}
          onLearn={handleLearn}
          onTest={handleTest}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}

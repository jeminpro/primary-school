import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { spellingsDB, type SpellingTest, type SpellingResult } from "../../lib/spellings-db";
import { Plus, MoreVertical, Download, Upload, Loader2 } from "lucide-react";
import { TestList } from "./test-list";
import { fetchSpellingTestsFromGoogleSheets } from "../../lib/google-sheets-sync";

export default function SpellingsMainPage() {
  const [tests, setTests] = useState<SpellingTest[]>([]);
  const [results, setResults] = useState<Record<number, SpellingResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    async function loadFromIndexedDB() {
      const allTests = await spellingsDB.tests.toArray();
      const sortedTests = allTests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const allResults = await spellingsDB.results.toArray();
      const grouped: Record<number, SpellingResult[]> = {};
      for (const r of allResults) {
        if (!grouped[r.testId]) grouped[r.testId] = [];
        grouped[r.testId].push(r);
      }
      return { tests: sortedTests, results: grouped };
    }

    async function load() {
      // First, load from IndexedDB immediately
      const localData = await loadFromIndexedDB();
      if (mounted) {
        setTests(localData.tests);
        setResults(localData.results);
        setLoading(false);
      }

      // Then, fetch from Google Sheets in the background and sync
      setSyncing(true);
      try {
        const googleSheetsData = await fetchSpellingTestsFromGoogleSheets();
        if (googleSheetsData.length > 0 && mounted) {
          // Update IndexedDB with data from Google Sheets
          for (const record of googleSheetsData) {
            const testData = {
              ...record.value,
              id: record.id,
            } as SpellingTest;
            await spellingsDB.tests.put(testData);
          }
          
          // Reload from IndexedDB to show updated data
          const updatedData = await loadFromIndexedDB();
          if (mounted) {
            setTests(updatedData.tests);
            setResults(updatedData.results);
          }
        }
      } catch (error) {
        console.error("Error syncing from Google Sheets:", error);
      } finally {
        if (mounted) {
          setSyncing(false);
        }
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

  async function handleExportAll() {
    // Gather tests and results fresh to ensure up-to-date export
    const allTests = await spellingsDB.tests.toArray();
    const allResults = await spellingsDB.results.toArray();
    const resultsByTest: Record<number, SpellingResult[]> = {};
    for (const r of allResults) {
      if (!resultsByTest[r.testId]) resultsByTest[r.testId] = [];
      resultsByTest[r.testId].push(r);
    }

    // Sanitize and nest results under each test
    const testsPayload = allTests.map(t => {
      const tId = t.id!;
      const nestedResults = (resultsByTest[tId] || []).map(r => ({
        date: r.date,
        answers: r.answers,
      }));
      return {
        name: t.name,
        words: (t.words || []).map(({ id: _wid, ...w }) => ({ ...w })),
        results: nestedResults,
      };
    });

    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: 1,
        count: testsPayload.length,
      },
      tests: testsPayload,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = (() => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}_${pad(d.getHours())}_${pad(d.getMinutes())}`;
    })();
    a.download = `spelling-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importSinglePayload(payload: any) {
    // Accept two formats:
    // 1) Single test export: { meta, test: { name, words, results } }
    // 2) Multi export: { meta, tests: [ { name, words, results }, ... ] }
    const testsToInsert: Array<{ name: string; words: { word: string; sentence?: string }[]; results?: { date: number; answers: { word: string; correct: boolean }[] }[] }> = [];
    if (payload?.test?.name && Array.isArray(payload?.test?.words)) {
      testsToInsert.push(payload.test);
    } else if (Array.isArray(payload?.tests)) {
      for (const t of payload.tests) {
        if (t?.name && Array.isArray(t?.words)) testsToInsert.push(t);
      }
    } else {
      throw new Error("Unrecognized JSON structure");
    }

    for (const t of testsToInsert) {
      const now = Date.now();
      const testId = await spellingsDB.tests.add({ name: t.name, words: t.words, createdAt: now, updatedAt: now });
      if (Array.isArray(t.results) && t.results.length) {
        await spellingsDB.results.bulkAdd(
          t.results.map(r => ({ testId, date: r.date, answers: r.answers }))
        );
      }
    }
  }

  async function handleImportFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        await importSinglePayload(json);
      } catch (e) {
        console.error("Import failed for", file.name, e);
        alert(`Import failed for ${file.name}: ${(e as Error).message}`);
      }
    }
    // Reload the list after import
    let allTests = await spellingsDB.tests.toArray();
    allTests = allTests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const allResults = await spellingsDB.results.toArray();
    const grouped: Record<number, SpellingResult[]> = {};
    for (const r of allResults) {
      if (!grouped[r.testId]) grouped[r.testId] = [];
      grouped[r.testId].push(r);
    }
    setTests(allTests);
    setResults(grouped);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>← Back</button>
          {syncing && <Loader2 size={16} className="animate-spin text-primary" />}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={handleAdd}>
            <Plus size={16} />
            Add
          </button>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle"><MoreVertical size={16} /></button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
              <li>
                <button className="flex items-center gap-2" onClick={handleExportAll}>
                  <Download size={16} /> Export All
                </button>
              </li>
              <li>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Upload size={16} /> Import
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    multiple
                    onChange={(e) => handleImportFiles(e.target.files)}
                  />
                </label>
              </li>
            </ul>
          </div>
        </div>
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

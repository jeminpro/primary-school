import React, { useState } from "react";
import { NotebookPen, BookOpen, Trash2, Edit3, MoreVertical, Download } from "lucide-react";
import type { SpellingTest, SpellingResult } from "../../lib/spellings-db";

export interface TestListProps {
  tests: SpellingTest[];
  results: Record<number, SpellingResult[]>;
  onLearn: (test: SpellingTest) => void;
  onTest: (test: SpellingTest) => void;
  onEdit: (test: SpellingTest) => void;
}

export function TestList({ tests, results, onLearn, onTest, onEdit }: TestListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingTest, setPendingTest] = useState<{ id: number; name: string } | null>(null);

  async function handleExport(test: SpellingTest) {
    const { spellingsDB } = await import("../../lib/spellings-db");
    const testId = test.id!;
    const relatedResults = await spellingsDB.results.where("testId").equals(testId).toArray();
    // sanitize: remove id/createdAt/updatedAt from test; id/testId from results; id from words
    const sanitizedTest = {
      name: test.name,
      words: test.words.map(({ id: _wid, ...w }) => ({ ...w })),
    } as const;
    const sanitizedResults = relatedResults.map(r => ({
      date: r.date,
      answers: r.answers,
    }));

    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: 1
      },
      test: {
        ...sanitizedTest,
        results: sanitizedResults
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = test.name.replace(/[^a-z0-9\-\_]+/gi, "-").replace(/-+/g, "-");
    const stamp = (() => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}_${pad(d.getHours())}_${pad(d.getMinutes())}`;
    })();
    a.download = `spelling-${safeName}-${test.id}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(testId: number) {
    // Remove from IndexedDB and reload (or call a prop if you want to lift state)
    const { spellingsDB } = await import("../../lib/spellings-db");
    await spellingsDB.tests.delete(testId);
    setDeleteId(null);
    setModalOpen(false);
    setPendingTest(null);
    // Optionally, you can trigger a reload or callback here
    window.location.reload();
  }

  return (
    <>
      <div className="space-y-6">
        {tests.length === 0 ? (
          <div className="text-base-content/60 text-center bg-yellow-50 rounded-xl p-6 shadow font-semibold">
            <span className="text-orange-500">No spelling tests yet.</span> Click <span className='font-bold text-primary'>Add</span> to create your first test!
          </div>
        ) : (
          tests.map((test, idx) => {
            const testResults = results[test.id ?? -1] || [];
            const lastResult = testResults[testResults.length - 1];
            const percent = lastResult && lastResult.answers.length > 0
              ? Math.round(100 * lastResult.answers.filter(a => a.correct).length / lastResult.answers.length)
              : null;
            return (
              <div
                key={test.id}
                className="card shadow-xl border-2 border-primary/30 bg-base-100 flex flex-col sm:flex-row items-center p-4 sm:p-5 gap-4 sm:gap-6 relative"
              >
                {/* Dropdown for small screens, absolutely positioned top-right */}
                <div className="block sm:hidden absolute top-3 right-3 z-10">
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-sm btn-ghost btn-circle"><MoreVertical size={18} /></button>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                      <li>
                        <button className="flex items-center gap-2" onClick={() => onLearn(test)}>
                          <BookOpen size={16} /> Learn
                        </button>
                      </li>
                      <li>
                        <button className="flex items-center gap-2" onClick={() => onEdit(test)}>
                          <Edit3 size={16} /> Edit
                        </button>
                      </li>
                      <li>
                        <button className="flex items-center gap-2" onClick={() => handleExport(test)}>
                          <Download size={16} /> Export
                        </button>
                      </li>
                      <li>
                        <button className="flex items-center gap-2 text-error" onClick={() => { setDeleteId(test.id!); setModalOpen(true); setPendingTest({ id: test.id!, name: test.name }); }}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-xl font-extrabold text-primary drop-shadow">{test.name}</span>
                    <span className="badge badge-soft text-base  shadow">{test.words.length} words</span>
                    {percent !== null && (
                      <span className={
                        `ml-2 inline-flex items-center px-2 py-1 rounded border border-gray-500 text-xs font-bold gap-1`}
                        title="Last result"
                      >
                        {percent >= 80 ? (
                          <span role="img" aria-label="star">⭐</span>
                        ) : percent > 50 ? (
                          <span role="img" aria-label="check">✔️</span>
                        ) : (
                          <span role="img" aria-label="cross">❌</span>
                        )}
                        {percent}%
                      </span>
                    )}
                  </div>
                  {lastResult && (
                    <div className="mt-1 text-xs text-base-content/70">
                      Last attempt: {new Date(lastResult.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                  <div className="flex flex-row gap-2 w-full sm:w-auto items-center">
                    <button className="btn btn-sm btn-outline font-bold w-full sm:w-auto" onClick={() => onTest(test)}>
                      <NotebookPen size={16} className="mr-1" />  Test
                    </button>
                    {/* Dropdown for larger screens, inline */}
                    <div className="hidden sm:block">
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-sm btn-ghost btn-circle"><MoreVertical size={18} /></button>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                          <li>
                            <button className="flex items-center gap-2" onClick={() => onLearn(test)}>
                              <BookOpen size={16} /> Learn
                            </button>
                          </li>
                          <li>
                            <button className="flex items-center gap-2" onClick={() => onEdit(test)}>
                              <Edit3 size={16} /> Edit
                            </button>
                          </li>
                          <li>
                            <button className="flex items-center gap-2" onClick={() => handleExport(test)}>
                              <Download size={16} /> Export
                            </button>
                          </li>
                          <li>
                            <button className="flex items-center gap-2 text-error" onClick={() => { setDeleteId(test.id!); setModalOpen(true); setPendingTest({ id: test.id!, name: test.name }); }}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Confirm Delete Modal */}
      {modalOpen && pendingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="font-bold text-lg mb-2 text-error">Delete Test</div>
            <div className="mb-4">Are you sure you want to delete <span className="font-bold text-primary">{pendingTest.name}</span>?</div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={() => { setModalOpen(false); setDeleteId(null); setPendingTest(null); }}>Cancel</button>
              <button className="btn btn-error" onClick={() => handleDelete(pendingTest.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

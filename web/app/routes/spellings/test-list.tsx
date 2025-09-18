import React from "react";
import type { SpellingTest, SpellingResult } from "../../lib/spellings-db";

export interface TestListProps {
  tests: SpellingTest[];
  results: Record<number, SpellingResult[]>;
  onLearn: (test: SpellingTest) => void;
  onTest: (test: SpellingTest) => void;
  onEdit: (test: SpellingTest) => void;
}

export function TestList({ tests, results, onLearn, onTest, onEdit }: TestListProps) {
  return (
    <div className="space-y-4">
      {tests.length === 0 ? (
        <div className="text-base-content/60">No spelling tests yet. Click <span className='font-semibold'>Add</span> to create your first test!</div>
      ) : (
        tests.map((test) => {
          const testResults = results[test.id ?? -1] || [];
          const lastResult = testResults[testResults.length - 1];
          const percent = lastResult && lastResult.answers.length > 0
            ? Math.round(100 * lastResult.answers.filter(a => a.correct).length / lastResult.answers.length)
            : null;
          return (
            <div key={test.id} className="card bg-base-100 shadow border border-base-200 flex flex-row items-center p-4 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-500">{test.name}</span>
                  <span className="badge badge-outline badge-sm">{test.words.length} words</span>
                </div>
                {lastResult && (
                  <div className="mt-1 text-xs text-base-content/60">
                    Last attempt: <span className="font-semibold">{new Date(lastResult.date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                {percent !== null && (
                  <div className="flex items-center justify-center">
                    <div className="radial-progress text-success text-lg" style={{"--value": percent, "--size": "2.5rem", "--thickness": "6px"} as any}>
                      <span className="font-bold">{percent}%</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button className="btn btn-xs btn-primary" onClick={() => onLearn(test)}>Learn</button>
                  <button className="btn btn-xs btn-accent" onClick={() => onTest(test)}>Test</button>
                  <button className="btn btn-xs btn-ghost" onClick={() => onEdit(test)}>Edit</button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

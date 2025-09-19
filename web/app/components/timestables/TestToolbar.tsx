import React from "react";

type Props = {
  selectedCount: number;
  total: number;
  canStart: boolean;
  onSelectAll: () => void;
  onClear: () => void;
  onStart: () => void;
  questionCount: number;
  setQuestionCount: (n: number) => void;
};

export function TestToolbar({ selectedCount, total, canStart, onSelectAll, onClear, onStart, questionCount, setQuestionCount }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-base-200 rounded-xl">
      <div className="flex items-center gap-2">
        <button className="btn btn-sm" onClick={onSelectAll} aria-label="Select all tables">Select All</button>
        <button className="btn btn-sm" onClick={onClear} aria-label="Clear selection">Clear</button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="label-text">Questions</span>
          <div className="join" role="radiogroup" aria-label="Number of questions">
            {[6, 12, 20, 30].map(n => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={questionCount === n}
                className={`btn btn-sm join-item ${questionCount === n ? 'btn-primary' : ''}`}
                onClick={() => setQuestionCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onStart} disabled={!canStart} aria-disabled={!canStart}>
          Start Test ({selectedCount})
        </button>
      </div>
    </div>
  );
}

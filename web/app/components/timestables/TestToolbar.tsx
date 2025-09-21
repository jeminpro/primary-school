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
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-indigo-100 shadow-md mb-5">
      <div className="flex items-center gap-3">
        <button 
          className="btn px-5 py-2 bg-white hover:bg-blue-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 rounded-full shadow-sm hover:shadow font-medium transition-all duration-200" 
          onClick={onSelectAll} 
          aria-label="Select all tables"
        >
          Select All
        </button>
        <button 
          className="btn px-5 py-2 bg-white hover:bg-blue-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 rounded-full shadow-sm hover:shadow font-medium transition-all duration-200" 
          onClick={onClear} 
          aria-label="Clear selection"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <div className="flex items-center gap-3">
          <span className="text-indigo-700 font-medium">Questions</span>
          <div className="join rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm" role="radiogroup" aria-label="Number of questions">
            {[6, 12, 24].map(n => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={questionCount === n}
                className={`px-4 py-1.5 font-medium transition-all duration-200 ${
                  questionCount === n 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-white text-indigo-700 hover:bg-indigo-50'
                }`}
                onClick={() => setQuestionCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button 
          className={`btn px-6 py-2.5 rounded-full font-medium text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full md:w-auto mt-3 md:mt-0
            ${canStart 
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700' 
              : 'bg-gray-300 cursor-not-allowed'}`} 
          onClick={onStart} 
          disabled={!canStart} 
          aria-disabled={!canStart}
        >
          Start Test ({selectedCount})
        </button>
      </div>
    </div>
  );
}

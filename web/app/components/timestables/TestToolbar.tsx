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
    <div className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between gap-3 p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-indigo-100 shadow-md mb-5">
      {/* Top row for mobile: Selection buttons and question count */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <button 
            className="btn btn-xs md:btn-sm px-2 text-xs bg-white hover:bg-blue-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 rounded-full shadow-sm hover:shadow font-medium transition-all duration-200" 
            onClick={onSelectAll} 
            aria-label="Select all tables"
          >
            Select All
          </button>
          <button 
            className="btn btn-xs md:btn-sm px-2 text-xs bg-white hover:bg-blue-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 rounded-full shadow-sm hover:shadow font-medium transition-all duration-200" 
            onClick={onClear} 
            aria-label="Clear selection"
          >
            Clear
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-base text-indigo-700 font-medium">Questions</span>
          <div className="join rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm" role="radiogroup" aria-label="Number of questions">
            {[6, 12, 24].map(n => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={questionCount === n}
                className={`px-3 py-1 text-xs md:text-base font-medium transition-all duration-200 ${
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
      </div>
      
      {/* Start Test button - Always visible at bottom of toolbar */}
      <div className="w-full mt-3 md:mt-0 md:w-auto">
        <button 
          className={`btn btn-md px-6 py-2.5 rounded-full font-medium text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full
            ${canStart 
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700' 
              : 'bg-gray-300 cursor-not-allowed'}`} 
          onClick={onStart} 
          disabled={!canStart} 
          aria-disabled={!canStart}
        >
          Start
        </button>
      </div>
      
      {/* Floating action button for mobile - Fixed position */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg text-white transition-all duration-300
            ${canStart 
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 opacity-90 hover:opacity-100 animate-pulse' 
              : 'bg-gray-300 cursor-not-allowed opacity-75'}`} 
          onClick={onStart} 
          disabled={!canStart} 
          aria-disabled={!canStart}
          aria-label="Start Test"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

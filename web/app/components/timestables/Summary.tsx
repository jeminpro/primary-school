import React from "react";
import { formatMsToSeconds } from "../../lib/timestables-db";
import { Timer, Check, X, ArrowLeft, RotateCw } from "lucide-react";
import { useNavigate } from "react-router";

type Props = {
  total: number;
  correct: number;
  medianMs: number; // now used for average time
  byTable: Array<{ a: number; items: Array<{ a: number; b: number; answer: number; correct: boolean; elapsedMs: number }> }>;
  onTryAgain: () => void;
};

export function Summary({ total, correct, medianMs, byTable, onTryAgain }: Props) {
  const navigate = useNavigate();
  const acc = total ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="space-y-6">
      {/* Stats Cards - Improved styling */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-base-100 rounded-xl p-5 shadow-md">
          <div className="text-sm text-base-content/70 font-medium">Accuracy</div>
          <div className="text-3xl font-bold mt-1">{acc}%</div>
        </div>
        <div className="bg-base-100 rounded-xl p-5 shadow-md">
          <div className="text-sm text-base-content/70 font-medium">Average Time</div>
          <div className="text-3xl font-bold mt-1">{formatMsToSeconds(medianMs)}</div>
        </div>
      </div>

      {/* Results by Table - Enhanced with better visual hierarchy */}
      <div className="bg-base-100 rounded-xl p-5 shadow-md">
        <div className="font-bold text-lg mb-4">By Table</div>
        <div className="space-y-5">
          {byTable.map(t => (
            <div key={t.a} className="border-b border-base-200 pb-4 last:border-b-0 last:pb-0">
              <div className="font-semibold text-lg mb-3">×{t.a}</div>
              <ul className="space-y-2">
                {t.items.map((it, idx) => (
                  <li 
                    key={`${it.a}x${it.b}-${idx}`} 
                    className="flex items-center justify-between py-1 px-2 rounded-md bg-base-200/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full ${it.correct ? 'bg-success/20' : 'bg-error/20'}`}>
                        {it.correct 
                          ? <Check size={14} className="text-success" /> 
                          : <X size={14} className="text-error" />
                        }
                      </span>
                      <span className={`font-medium ${it.correct ? 'text-success' : 'text-error'}`}>
                        <span className="text-base-content/90">{it.a} × {it.b} =</span> {it.answer}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-base-content/70 bg-base-100 px-2 py-1 rounded-md">
                      <Timer size={14} />
                      <span>{formatMsToSeconds(it.elapsedMs)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Improved with icons */}
      <div className="flex justify-between gap-4 mt-6">
        <button 
          className="btn btn-neutral" 
          onClick={() => navigate("/timestables")}
        >
          <ArrowLeft size={18} />
          Back to tables
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onTryAgain}
        >
          <RotateCw size={18} />
          Try again
        </button>
      </div>
    </div>
  );
}

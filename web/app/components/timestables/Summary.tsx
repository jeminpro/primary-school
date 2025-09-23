import React from "react";
import { formatMsToSeconds } from "../../lib/timestables-db";
import { Timer, Check, X, ArrowLeft, RotateCw, Info } from "lucide-react";
import { useNavigate } from "react-router";
import { ProgressDial as RatingDial, getAccuracyRating, getTimeRating } from "../shared/RatingDial";
import { getRatingDescription, getRatingRange } from "../../lib/ratings";

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
  const avgTimeInSeconds = medianMs / 1000;
  
  // Get ratings for accuracy and time
  const accuracyRating = getAccuracyRating(acc);
  const timeRating = getTimeRating(avgTimeInSeconds);
  
  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-6 sm:space-y-8">
      {/* Stats Cards - Updated styling to match the image */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
          <div className="text-sm text-violet-700 font-medium mb-2">Accuracy</div>
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <div className="text-3xl sm:text-4xl font-bold text-slate-800">{acc}%</div>
            <div className="tooltip w-full" data-tip={`${getRatingRange("accuracy", accuracyRating)}: ${getRatingDescription("accuracy", accuracyRating)}`}>
              <RatingDial value={acc} rating={accuracyRating} width={100} height={7} showRatingText={true} className="w-full" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
          <div className="text-sm text-violet-700 font-medium mb-2">Speed</div>
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <div className="text-3xl sm:text-4xl font-bold text-slate-800">{formatMsToSeconds(medianMs)}</div>
            <div className="tooltip w-full" data-tip={`${getRatingRange("time", timeRating)}: ${getRatingDescription("time", timeRating)}`}>
              {/* Invert the value for time (lower time = better performance = higher value) */}
              <RatingDial 
                value={timeRating === "excellent" ? 100 : (6 - Math.min(avgTimeInSeconds, 6)) / 6 * 100} 
                rating={timeRating} 
                width={100} 
                height={7}
                showRatingText={true}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results by Table - Enhanced with better visual hierarchy and mobile responsiveness */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="font-bold text-lg sm:text-xl text-slate-800 mb-4 sm:mb-6">By Table</div>
        <div className="space-y-6 sm:space-y-8">
          {byTable.map(t => (
            <div key={t.a} className="border-b border-slate-100 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
              <div className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-violet-700">×{t.a}</div>
              <ul className="space-y-2 sm:space-y-3">
                {t.items.map((it, idx) => (
                  <li 
                    key={`${it.a}x${it.b}-${idx}`} 
                    className="flex items-center justify-between py-2 px-3 sm:px-4 rounded-xl bg-slate-50"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center rounded-full ${it.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                        {it.correct 
                          ? <Check size={14} className="text-green-600" /> 
                          : <X size={14} className="text-red-600" />
                        }
                      </span>
                      <span className="font-medium text-sm sm:text-base text-slate-700">
                        {it.a} × {it.b} = <span className={it.correct ? 'text-green-600' : 'text-red-600'}>{it.answer}</span>
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-slate-500 bg-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-slate-100 flex-shrink-0 ml-2">
                      <Timer size={12} className="flex-shrink-0" />
                      <span>{formatMsToSeconds(it.elapsedMs)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Improved for mobile */}
      <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-between gap-4 sm:gap-6 mt-6 sm:mt-8">
        <button 
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm sm:text-base font-medium py-2.5 sm:py-3 px-5 sm:px-6 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all duration-200 w-auto min-w-[130px] sm:w-auto justify-center"
          onClick={() => navigate("/timestables")}
        >
          <ArrowLeft size={16} className="flex-shrink-0" />
          <span className="whitespace-nowrap">Back to tables</span>
        </button>
        <button 
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 px-5 sm:px-6 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-auto min-w-[130px] sm:w-auto justify-center"
          onClick={onTryAgain}
        >
          <RotateCw size={16} className="flex-shrink-0" />
          <span className="whitespace-nowrap">Try again</span>
        </button>
      </div>
    </div>
  );
}

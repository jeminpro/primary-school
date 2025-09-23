import React from "react";
import { formatMsToSeconds } from "../../lib/timestables-db";
import { Timer, Target } from "lucide-react";
import { getAccuracyRating, getTimeRating } from "../shared/RatingDial";
import type { RatingLevel } from "../shared/RatingDial";

type Props = {
  table: number;
  accuracy: number; // 0..100
  medianMs: number; // ms (now used for average time)
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

// Helper function to get background and text colors for each rating
const getRatingColors = (rating: RatingLevel) => {
  switch (rating) {
    case "excellent":
      return {
        bg: "bg-gradient-to-b from-emerald-200 to-emerald-100",
        border: "border-emerald-400",
        text: "text-emerald-700",
        shadow: "shadow-emerald-200"
      };
    case "good":
      return {
        bg: "bg-gradient-to-b from-lime-200 to-lime-100",
        border: "border-lime-400",
        text: "text-lime-700",
        shadow: "shadow-lime-200"
      };
    case "average":
      return {
        bg: "bg-gradient-to-b from-amber-200 to-amber-100",
        border: "border-amber-400",
        text: "text-amber-700",
        shadow: "shadow-amber-200"
      };
    case "bad":
      return {
        bg: "bg-gradient-to-b from-rose-200 to-rose-100",
        border: "border-rose-400",
        text: "text-rose-700",
        shadow: "shadow-rose-200"
      };
    default:
      return {
        bg: "bg-gradient-to-b from-gray-200 to-gray-100",
        border: "border-gray-300",
        text: "text-gray-700",
        shadow: "shadow-gray-200"
      };
  }
};

export function ScoreCard({ table, accuracy, medianMs, selectable, selected, onToggle }: Props) {
  const label = `Times table ${table}. Accuracy ${accuracy} percent. Average time ${formatMsToSeconds(medianMs)}`;
  
  // Generate a predictable, vibrant color based on the table number
  const tableColors = [
    "from-purple-300 to-indigo-200 border-purple-400", // x1
    "from-indigo-300 to-blue-200 border-indigo-400",   // x2 
    "from-blue-300 to-sky-200 border-blue-400",        // x3
    "from-sky-300 to-cyan-200 border-sky-400",         // x4
    "from-cyan-300 to-teal-200 border-cyan-400",       // x5
    "from-teal-300 to-emerald-200 border-teal-400",    // x6
    "from-emerald-300 to-green-200 border-emerald-400",// x7
    "from-green-300 to-lime-200 border-green-400",     // x8
    "from-lime-300 to-yellow-200 border-lime-400",     // x9
    "from-yellow-300 to-amber-200 border-yellow-400",  // x10
    "from-amber-300 to-orange-200 border-amber-400",   // x11
    "from-orange-300 to-rose-200 border-orange-400",   // x12
  ];
  
  const tableColor = tableColors[(table - 1) % tableColors.length];
  const colorClass = `${tableColor} hover:shadow-lg hover:border-opacity-80`;
  const selectedClass = "from-violet-400 to-purple-500 border-purple-600 shadow-lg text-white";
  
  // Get ratings for time and accuracy
  const timeRating = medianMs > 0 ? getTimeRating(medianMs / 1000) : null;
  const accuracyRating = accuracy > 0 ? getAccuracyRating(accuracy) : null;

  return (
    <button
      type="button"
      className={`relative rounded-xl sm:rounded-2xl p-2 sm:p-4 ${selected ? 'border-3' : 'border-2'} shadow-md transition-all duration-300 
        focus:outline-none focus-visible:ring-2 ring-offset-2 ring-primary-500 text-left 
        transform hover:-translate-y-1 hover:scale-105 ${
        selectable ? "cursor-pointer active:scale-95 active:translate-y-0" : "cursor-default"
      } bg-gradient-to-br ${selected ? selectedClass : colorClass}
      ${selected ? 'scale-105 -translate-y-1 shadow-xl' : ''}
      w-full max-w-none mx-auto
      `}
      aria-pressed={!!selected}
      aria-label={label}
      onClick={selectable ? onToggle : undefined}
    >
      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/40"></div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}
      
      <div className="flex items-center justify-between sm:flex-col sm:items-center sm:justify-center gap-1 sm:gap-3 min-h-[60px] sm:min-h-[85px]">
        {/* Table number - Make it more prominent */}
        <div className={`text-xl sm:text-3xl font-bold text-center ${selected ? 'text-white' : 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent'} drop-shadow-sm`}>
          ×{table}
        </div>
        
        {/* Mobile-optimized layout for badges */}
        <div className="flex items-center sm:flex-row gap-1 sm:gap-4 text-sm justify-end sm:justify-center">
          {/* Time badge */}
          <div className="flex flex-col items-center">
            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full 
              ${selected ? 'bg-white shadow border-white' : 
                timeRating 
                  ? `${getRatingColors(timeRating).bg} ${getRatingColors(timeRating).border}` 
                  : "bg-gradient-to-b from-slate-200 to-slate-100 border-slate-300"
              } border shadow-sm`} 
              aria-label={medianMs > 0 ? `Average time ${formatMsToSeconds(medianMs)}` : "No time data"}
            >
              <Timer size={10} className={selected ? 'text-purple-600 hidden sm:inline' : (timeRating ? getRatingColors(timeRating).text : "text-slate-500")} />
              <span className={`font-medium min-w-[20px] text-xs text-center ${selected ? 'text-purple-600' : ''}`}>
                {medianMs > 0 ? formatMsToSeconds(medianMs) : "-"}
              </span>
            </span>
            <span className={`text-[11px] sm:text-xs font-medium h-5 flex items-center justify-center gap-0.5 
              ${selected ? 'text-white' : (timeRating ? getRatingColors(timeRating).text : "text-transparent")} capitalize`}
            >
              <span className="truncate max-w-[60px]">{timeRating || ""}</span>
            </span>
          </div>
          
          {/* Accuracy badge */}
          <div className="flex flex-col items-center">
            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full 
              ${selected ? 'bg-white shadow border-white' : 
                accuracyRating 
                  ? `${getRatingColors(accuracyRating).bg} ${getRatingColors(accuracyRating).border}` 
                  : "bg-gradient-to-b from-slate-200 to-slate-100 border-slate-300"
              } border shadow-sm`} 
              aria-label={accuracy > 0 ? `Accuracy ${accuracy}%` : "No accuracy data"}
            >
              <Target size={10} className={selected ? 'text-purple-600 hidden sm:inline' : (accuracyRating ? getRatingColors(accuracyRating).text : "text-slate-500")} />
              <span className={`font-medium min-w-[24px] text-xs text-center ${selected ? 'text-purple-600' : ''}`}>
                {accuracy > 0 ? `${Math.max(0, Math.min(100, accuracy))}%` : "-"}
              </span>
            </span>
            <span className={`text-[11px] sm:text-xs font-medium h-5 flex items-center justify-center gap-0.5 
              ${selected ? 'text-white' : (accuracyRating ? getRatingColors(accuracyRating).text : "text-transparent")} capitalize`}
            >
              <span className="truncate max-w-[60px]">{accuracyRating || ""}</span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

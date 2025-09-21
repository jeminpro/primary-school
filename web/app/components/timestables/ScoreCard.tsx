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
        shadow: "shadow-emerald-200",
        emoji: "🌟"
      };
    case "good":
      return {
        bg: "bg-gradient-to-b from-lime-200 to-lime-100",
        border: "border-lime-400",
        text: "text-lime-700",
        shadow: "shadow-lime-200",
        emoji: "😃"
      };
    case "average":
      return {
        bg: "bg-gradient-to-b from-amber-200 to-amber-100",
        border: "border-amber-400",
        text: "text-amber-700",
        shadow: "shadow-amber-200",
        emoji: "😊"
      };
    case "bad":
      return {
        bg: "bg-gradient-to-b from-rose-200 to-rose-100",
        border: "border-rose-400",
        text: "text-rose-700",
        shadow: "shadow-rose-200",
        emoji: "😢"
      };
    default:
      return {
        bg: "bg-gradient-to-b from-gray-200 to-gray-100",
        border: "border-gray-300",
        text: "text-gray-700",
        shadow: "shadow-gray-200",
        emoji: "❔"
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
  const selectedClass = "from-primary-300 to-primary-200 border-primary-500 shadow-lg";
  
  // Get ratings for time and accuracy
  const timeRating = medianMs > 0 ? getTimeRating(medianMs / 1000) : null;
  const accuracyRating = accuracy > 0 ? getAccuracyRating(accuracy) : null;

  return (
    <button
      type="button"
      className={`relative rounded-2xl p-4 border-2 shadow-md transition-all duration-300 
        focus:outline-none focus-visible:ring-2 ring-offset-2 ring-primary-500 text-left 
        transform hover:-translate-y-1 hover:scale-105 ${
        selectable ? "cursor-pointer" : "cursor-default"
      } bg-gradient-to-br ${selected ? selectedClass : colorClass}
      `}
      aria-pressed={!!selected}
      aria-label={label}
      onClick={selectable ? onToggle : undefined}
    >
      {/* Decorative bubbles for kid-friendly design */}
      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/40"></div>
      <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-white/30"></div>
      
      <div className="flex flex-col items-center justify-center gap-3 min-h-[85px]">
        <div className="text-3xl font-bold text-center bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent drop-shadow-sm">
          ×{table}
        </div>
        
        <div className="flex items-center gap-4 text-sm justify-center">
          {/* Time badge - always show, use placeholder if no data */}
          <div className="flex flex-col items-center gap-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              timeRating 
                ? `${getRatingColors(timeRating).bg} ${getRatingColors(timeRating).border}` 
                : "bg-gradient-to-b from-slate-200 to-slate-100 border-slate-300"
              } border shadow-sm`} 
              aria-label={medianMs > 0 ? `Average time ${formatMsToSeconds(medianMs)}` : "No time data"}
            >
              <Timer size={14} className={timeRating ? getRatingColors(timeRating).text : "text-slate-500"} />
              <span className="font-medium min-w-[24px] text-center">{medianMs > 0 ? formatMsToSeconds(medianMs) : "-"}</span>
            </span>
            <span className={`text-xs font-medium h-4 flex items-center gap-0.5 ${timeRating ? `${getRatingColors(timeRating).text} capitalize` : "text-transparent"}`}>
              {timeRating && <span className="text-sm">{getRatingColors(timeRating).emoji}</span>} {timeRating || "placeholder"}
            </span>
          </div>
          
          {/* Accuracy badge - always show, use placeholder if no data */}
          <div className="flex flex-col items-center gap-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              accuracyRating 
                ? `${getRatingColors(accuracyRating).bg} ${getRatingColors(accuracyRating).border}` 
                : "bg-gradient-to-b from-slate-200 to-slate-100 border-slate-300"
              } border shadow-sm`} 
              aria-label={accuracy > 0 ? `Accuracy ${accuracy}%` : "No accuracy data"}
            >
              <Target size={14} className={accuracyRating ? getRatingColors(accuracyRating).text : "text-slate-500"} />
              <span className="font-medium min-w-[30px] text-center">{accuracy > 0 ? `${Math.max(0, Math.min(100, accuracy))}%` : "-"}</span>
            </span>
            <span className={`text-xs font-medium h-4 flex items-center gap-0.5 ${accuracyRating ? `${getRatingColors(accuracyRating).text} capitalize` : "text-transparent"}`}>
              {accuracyRating && <span className="text-sm">{getRatingColors(accuracyRating).emoji}</span>} {accuracyRating || "placeholder"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

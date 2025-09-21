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
        bg: "bg-gradient-to-b from-green-100 to-green-50",
        border: "border-green-400",
        text: "text-green-700",
        shadow: "shadow-green-200"
      };
    case "good":
      return {
        bg: "bg-gradient-to-b from-lime-100 to-lime-50",
        border: "border-lime-400",
        text: "text-lime-700",
        shadow: "shadow-lime-200"
      };
    case "average":
      return {
        bg: "bg-gradient-to-b from-amber-100 to-amber-50",
        border: "border-amber-400",
        text: "text-amber-700",
        shadow: "shadow-amber-200"
      };
    case "bad":
      return {
        bg: "bg-gradient-to-b from-red-100 to-red-50",
        border: "border-red-400",
        text: "text-red-700",
        shadow: "shadow-red-200"
      };
    default:
      return {
        bg: "bg-gradient-to-b from-gray-100 to-gray-50",
        border: "border-gray-300",
        text: "text-gray-700",
        shadow: "shadow-gray-200"
      };
  }
};

export function ScoreCard({ table, accuracy, medianMs, selectable, selected, onToggle }: Props) {
  const label = `Times table ${table}. Accuracy ${accuracy} percent. Average time ${formatMsToSeconds(medianMs)}`;
  // Use a consistent color for all tiles (using the x8 color scheme)
  const colorClass = "from-blue-500/20 to-sky-500/10 border-blue-400/30 hover:border-blue-400/60";
  const selectedClass = "from-primary/30 to-primary/10 border-primary/70 shadow-md";
  
  // Get ratings for time and accuracy
  const timeRating = medianMs > 0 ? getTimeRating(medianMs / 1000) : null;
  const accuracyRating = accuracy > 0 ? getAccuracyRating(accuracy) : null;

  return (
    <button
      type="button"
      className={`relative rounded-xl p-4 border-2 shadow hover:shadow-md transition focus:outline-none focus-visible:ring-2 ring-offset-2 ring-primary text-left transform hover:-translate-y-0.5 ${
        selectable ? "cursor-pointer" : "cursor-default"
      } bg-gradient-to-br ${selected ? selectedClass : colorClass}
      `}
      aria-pressed={!!selected}
      aria-label={label}
      onClick={selectable ? onToggle : undefined}
    >
      <div className="flex flex-col items-center justify-center gap-2 min-h-[85px]">
        <div className="text-2xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">×{table}</div>
        <div className="flex items-center gap-4 text-sm justify-center">
          {medianMs > 0 && timeRating && (
            <div className="flex flex-col items-center gap-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRatingColors(timeRating).bg} ${getRatingColors(timeRating).border} border shadow-sm`} 
                aria-label={`Average time ${formatMsToSeconds(medianMs)}`}
              >
                <Timer size={16} className={getRatingColors(timeRating).text} />
                <span className="font-medium">{formatMsToSeconds(medianMs)}</span>
              </span>
              <span className={`text-xs font-medium ${getRatingColors(timeRating).text} capitalize`}>
                {timeRating}
              </span>
            </div>
          )}
          {accuracy > 0 && accuracyRating && (
            <div className="flex flex-col items-center gap-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRatingColors(accuracyRating).bg} ${getRatingColors(accuracyRating).border} border shadow-sm`} 
                aria-label={`Accuracy ${accuracy}%`}
              >
                <Target size={16} className={getRatingColors(accuracyRating).text} />
                <span className="font-medium">{Math.max(0, Math.min(100, accuracy))}%</span>
              </span>
              <span className={`text-xs font-medium ${getRatingColors(accuracyRating).text} capitalize`}>
                {accuracyRating}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

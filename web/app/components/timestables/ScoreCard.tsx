import React from "react";
import { formatMsToSeconds } from "../../lib/timestables-db";
import { Timer, Target } from "lucide-react";

type Props = {
  table: number;
  accuracy: number; // 0..100
  medianMs: number; // ms (now used for average time)
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

export function ScoreCard({ table, accuracy, medianMs, selectable, selected, onToggle }: Props) {
  const label = `Times table ${table}. Accuracy ${accuracy} percent. Average time ${formatMsToSeconds(medianMs)}`;
  // Use a consistent color for all tiles (using the x8 color scheme)
  const colorClass = "from-blue-500/20 to-sky-500/10 border-blue-400/30 hover:border-blue-400/60";
  const selectedClass = "from-primary/30 to-primary/10 border-primary/70 shadow-md";

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
      <div className="flex flex-col items-center justify-center gap-2 min-h-[70px]">
        <div className="text-2xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">×{table}</div>
        <div className="mt-1 flex items-center gap-4 text-sm justify-center min-h-[24px]">
          {medianMs > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 shadow-sm" aria-label={`Average time ${formatMsToSeconds(medianMs)}`}>
              <Timer size={16} className="text-blue-600" />
              <span className="font-medium">{formatMsToSeconds(medianMs)}</span>
            </span>
          )}
          {accuracy > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 shadow-sm" aria-label={`Accuracy ${accuracy}%`}>
              <Target size={16} className="text-blue-600" />
              <span className="font-medium">{Math.max(0, Math.min(100, accuracy))}%</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

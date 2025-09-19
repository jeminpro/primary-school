import React from "react";
import { formatMsToSeconds } from "../../lib/timestables-db";
import { Timer, Target } from "lucide-react";

type Props = {
  table: number;
  accuracy: number; // 0..100
  medianMs: number; // ms
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

export function ScoreCard({ table, accuracy, medianMs, selectable, selected, onToggle }: Props) {
  const label = `Times table ${table}. Accuracy ${accuracy} percent. Median time ${formatMsToSeconds(medianMs)}`;
  return (
    <button
      type="button"
      className={`relative rounded-xl p-4 border shadow hover:shadow-md transition focus:outline-none focus-visible:ring-2 ring-offset-2 ring-primary text-left ${
        selectable ? "cursor-pointer" : "cursor-default"
      } ${selected ? "bg-primary/10 border-primary" : "bg-base-100"}`}
      aria-pressed={!!selected}
      aria-label={label}
      onClick={selectable ? onToggle : undefined}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-lg font-bold">×{table}</div>
          <div className="mt-1 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1" aria-label={`Median time ${formatMsToSeconds(medianMs)}`}>
              <Timer size={16} className="text-info" />
              <span>{formatMsToSeconds(medianMs)}</span>
            </span>
            <span className="inline-flex items-center gap-1" aria-label={`Accuracy ${accuracy}%`}>
              <Target size={16} className="text-success" />
              <span>{Math.max(0, Math.min(100, accuracy))}%</span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

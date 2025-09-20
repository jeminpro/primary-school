import React from "react";
import { formatMsToSeconds } from "../../lib/timestables-db";
import { Timer } from "lucide-react";
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
    <div className="space-y-4">
      <div className="stats w-full shadow bg-base-100">
        <div className="stat">
          <div className="stat-title">Accuracy</div>
          <div className="stat-value">{acc}%</div>
        </div>
        <div className="stat">
          <div className="stat-title">Average Time</div>
          <div className="stat-value">{formatMsToSeconds(medianMs)}</div>
        </div>
      </div>

      <div className="bg-base-100 rounded-xl p-4 shadow">
        <div className="font-bold mb-3">By Table</div>
        <div className="space-y-4">
          {byTable.map(t => (
            <div key={t.a}>
              <div className="font-semibold mb-2">×{t.a}</div>
              <ul className="space-y-1">
                {t.items.map((it, idx) => (
                  <li key={`${it.a}x${it.b}-${idx}`} className={`flex items-center gap-2 ${it.correct ? 'text-success' : 'text-error'}`}>
                    <span>{it.a} × {it.b} = {it.answer}</span>
                    <span className="inline-flex items-center gap-1 text-base-content/70">
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

      <div className="flex justify-end gap-4">
        <button className="btn btn-neutral btn-outline" onClick={() => navigate("/timestables")}>Back to tables</button>
        <button className="btn btn-primary" onClick={onTryAgain}>Try again</button>
      </div>
    </div>
  );
}

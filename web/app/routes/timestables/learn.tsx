import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAccuracyForTable, getAverageMsForTable, ttDB } from "../../lib/timestables-db";
import { Timer } from "lucide-react";
import { ScoreCard } from "../../components/timestables/ScoreCard";

function TableTips({ n }: { n: number }) {
  const tips: Record<number, string[]> = {
    1: [
      "Anything times 1 stays the same.",
      "Think: one group of a number is that number.",
    ],
    2: [
      "Double it: 2× means add the number to itself.",
      "Even numbers only: answers end in 0,2,4,6,8.",
    ],
    3: [
      "Skip-count: 3, 6, 9, 12, 15…",
      "Clap every third number to feel the rhythm!",
    ],
    4: [
      "Double, then double again (x4 = x2 × 2).",
      "Skip-count by 4s: 4, 8, 12, 16…",
    ],
    5: [
      "Answers end with 0 or 5.",
      "Count by 5s: 5, 10, 15, 20… (two 5s make 10).",
    ],
    6: [
      "x6 = x5 + one more group.",
      "Even × 3 (because 6 = 2 × 3): make a half then triple.",
    ],
    7: [
      "Use neighbors: 7×8 = 56 (5,6 go together).",
      "Break apart: 7×b = (5×b) + (2×b).",
    ],
    8: [
      "Double three times: x8 = double, double, double!",
      "8×5 = 40 (5s help!), 8×9 = 72 (near 8×10).",
    ],
    9: [
      "Finger trick: fold the nth finger for 9×n.",
      "Digits add to 9 (e.g., 9×4 = 36 → 3+6=9).",
    ],
    10: [
      "Just add a zero: 10×n = n0.",
      "Skip-count 10s: 10, 20, 30…",
    ],
    11: [
      "Up to 9: repeat the number (11×4 = 44).",
      "For 11×12, use 11×(10+2) = 110 + 22 = 132.",
    ],
    12: [
      "12 = 10 + 2: 12×n = (10×n) + (2×n).",
      "12s are 3s and 4s combined (LCM patterns).",
    ],
  };

  const list = tips[n] || ["Look for patterns and use what you know!"];
  return (
    <div className="bg-base-200 rounded-xl p-4">
      <div className="font-bold mb-2">Tips for ×{n}</div>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        {list.map((t, i) => (<li key={i}>{t}</li>))}
      </ul>
    </div>
  );
}

export default function TimesTablesLearn() {
  const [rows, setRows] = useState<Array<{ a: number; acc: number; med: number }>>([]);
  const [focus, setFocus] = useState<number | null>(null);
  const [dots, setDots] = useState<Record<number, boolean[]>>({});
  const [lastSpeeds, setLastSpeeds] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data: Array<{ a: number; acc: number; med: number }> = [];
      for (let a = 1; a <= 12; a++) {
        const [acc, med] = await Promise.all([
          getAccuracyForTable(a),
          getAverageMsForTable(a)
        ]);
        data.push({ a, acc, med });
      }
      if (mounted) setRows(data);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadDotsAndSpeeds(a: number) {
      const perB: Record<number, boolean[]> = {};
      const perSpeed: Record<number, number> = {};
      for (let b = 1; b <= 12; b++) {
        const list = await ttDB.attempts.where({ a, b }).reverse().sortBy("date");
        perB[b] = list.slice(0, 5).map(x => x.correct);
        perSpeed[b] = list[0]?.elapsedMs || 0;
      }
      if (alive) {
        setDots(perB);
        setLastSpeeds(perSpeed);
      }
    }
    if (focus != null) loadDotsAndSpeeds(focus);
    return () => { alive = false; };
  }, [focus]);

  if (focus == null) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary">Choose a times table to learn</h2>
          <p className="text-sm text-base-content/70">Tap a number below to explore facts and tips.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const r = rows.find(x => x.a === i + 1);
            return (
              <ScoreCard
                key={i + 1}
                table={i + 1}
                accuracy={r ? r.acc : 0}
                medianMs={r ? r.med : 0}
                selectable
                selected={false}
                onToggle={() => setFocus(i + 1)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-bold text-xl">{focus} Times Table</div>
        <div className="w-12" />
      </div>

      <div className="bg-base-100 rounded-xl p-4 shadow">
        <ul className="flex flex-col gap-1">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
            <li
              key={b}
              className="p-3 rounded grid items-center"
              style={{ gridTemplateColumns: 'minmax(90px,1fr) 60px 60px' }}
            >
              <span className="truncate">{focus} × {b} = {focus! * b}</span>
              <span className="flex gap-1 justify-center" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = dots[b]?.[i];
                  const cls = val === true ? "bg-success" : val === false ? "bg-error" : "bg-base-300";
                  return <span key={i} className={`w-2 h-2 rounded-full ${cls}`} />;
                })}
              </span>
              <span className="inline-flex items-center gap-1 text-base-content/70 justify-end">
                {lastSpeeds[b] > 0 && <><Timer size={14} /><span>{(lastSpeeds[b] / 1000).toFixed(1)}s</span></>}
              </span>
            </li>
          ))}
        </ul>
      </div>

  <TableTips n={focus} />

      <div className="flex justify-center">
        <button className="btn btn-primary" onClick={() => navigate("/timestables/test", { state: { preselect: [focus] } as any })}>
          Practice this table
        </button>
      </div>
    </div>
  );
}

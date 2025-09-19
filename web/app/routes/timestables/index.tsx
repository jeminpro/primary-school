import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAccuracyForTable, getMedianMsForTable } from "../../lib/timestables-db";
import { ScoreCard } from "../../components/timestables/ScoreCard";
import { BookOpen, Timer } from "lucide-react";

export default function TimesTablesMain() {
  const [rows, setRows] = useState<Array<{ a: number; acc: number; med: number }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data: Array<{ a: number; acc: number; med: number }> = [];
      for (let a = 1; a <= 12; a++) {
        const [acc, med] = await Promise.all([
          getAccuracyForTable(a),
          getMedianMsForTable(a)
        ]);
        data.push({ a, acc, med });
      }
      if (mounted) setRows(data);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/timestables/learn"
          onClick={(e) => { e.preventDefault(); navigate("/timestables/learn"); }}
          className="card bg-base-100 shadow border hover:shadow-lg transition cursor-pointer"
          aria-label="Open Learn"
        >
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2"><BookOpen size={20}/> Learn</h2>
            <p className="text-sm text-base-content/70">Explore each times table (1–12), see quick tips, and view your last results per fact.</p>
          </div>
        </a>
        <a
          href="/timestables/test"
          onClick={(e) => { e.preventDefault(); navigate("/timestables/test"); }}
          className="card bg-base-100 shadow border hover:shadow-lg transition cursor-pointer"
          aria-label="Open Test"
        >
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2"><Timer size={20}/> Test</h2>
            <p className="text-sm text-base-content/70">Build a focused test and practice with smart question selection based on your recent answers.</p>
          </div>
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {rows.sort((x, y) => x.a - y.a).map(r => (
          <ScoreCard key={r.a} table={r.a} accuracy={r.acc} medianMs={r.med} />
        ))}
      </div>
    </div>
  );
}

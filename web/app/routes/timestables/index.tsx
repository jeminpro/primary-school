import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAccuracyForTable, getMedianMsForTable, getAttemptCountForTable } from "../../lib/timestables-db";
import { ScoreCard } from "../../components/timestables/ScoreCard";
import { BookOpen, Timer } from "lucide-react";

export default function TimesTablesMain() {
  const [rows, setRows] = useState<Array<{ a: number; acc: number; med: number; count: number }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data: Array<{ a: number; acc: number; med: number; count: number }> = [];
      for (let a = 1; a <= 12; a++) {
        const [acc, med, count] = await Promise.all([
          getAccuracyForTable(a),
          getMedianMsForTable(a),
          getAttemptCountForTable(a),
        ]);
        data.push({ a, acc, med, count });
      }
      if (mounted) setRows(data);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/timestables/learn"
          onClick={(e) => { e.preventDefault(); navigate("/timestables/learn"); }}
          className="card bg-gradient-to-br from-primary/20 to-info/10 shadow-md border-2 border-primary/30 hover:shadow-lg hover:border-primary/50 transition-all transform hover:-translate-y-1 cursor-pointer rounded-xl overflow-hidden"
          aria-label="Open Learn"
        >
          <div className="card-body relative">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 rotate-12 text-primary">
              <BookOpen size={80} strokeWidth={1.5} />
            </div>
            <h2 className="card-title flex items-center gap-3 text-2xl font-extrabold">
              <div className="bg-primary/20 p-2 rounded-lg">
                <BookOpen size={28} className="text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent drop-shadow-sm">Learn</span>
            </h2>
            <p className="text-base-content/80">Explore each times table (1–12), see quick tips, and view your last results per fact.</p>
          </div>
        </a>
        <a
          href="/timestables/test"
          onClick={(e) => { e.preventDefault(); navigate("/timestables/test"); }}
          className="card bg-gradient-to-br from-purple-500/20 to-pink-500/10 shadow-md border-2 border-purple-500/30 hover:shadow-lg hover:border-purple-500/50 transition-all transform hover:-translate-y-1 cursor-pointer rounded-xl overflow-hidden"
          aria-label="Open Test"
        >
          <div className="card-body relative">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 rotate-12 text-purple-600">
              <Timer size={80} strokeWidth={1.5} />
            </div>
            <h2 className="card-title flex items-center gap-3 text-2xl font-extrabold">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Timer size={28} className="text-purple-600" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">Test</span>
            </h2>
            <p className="text-base-content/80">Build a focused test and practice with smart question selection based on your recent answers.</p>
          </div>
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {rows.sort((x, y) => x.a - y.a).map(r => (
          <ScoreCard
            key={r.a}
            table={r.a}
            accuracy={r.count ? r.acc : 0}
            medianMs={r.count ? r.med : 0}
            selectable
            selected={false}
            onToggle={() => navigate("/timestables/test", { state: { preselect: [r.a] } as any })}
          />
        ))}
      </div>
    </div>
  );
}

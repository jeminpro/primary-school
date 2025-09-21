import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAccuracyForTable, getAverageMsForTable, getAttemptCountForTable } from "../../lib/timestables-db";
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
          getAverageMsForTable(a),
          getAttemptCountForTable(a),
        ]);
        data.push({ a, acc, med, count });
      }
      if (mounted) setRows(data);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Background decorative elements for kids */}
      <div className="absolute top-6 left-6 w-24 h-24 bg-purple-200 rounded-full opacity-30 blur-xl -z-10"></div>
      <div className="absolute bottom-8 right-8 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-xl -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-200 rounded-full opacity-20 blur-lg -z-10"></div>
      
      {/* Main options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a
          href="/timestables/learn"
          onClick={(e) => { e.preventDefault(); navigate("/timestables/learn"); }}
          className="card bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-xl border-4 border-white 
            hover:shadow-2xl hover:scale-105 transition-all duration-300 transform cursor-pointer rounded-3xl overflow-hidden"
          aria-label="Open Learn"
        >
          <div className="card-body relative p-6">
            {/* Decorative elements */}
            <div className="absolute top-3 right-3 w-6 h-6 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-12 right-8 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/2 right-12 w-8 h-8 bg-white/10 rounded-full"></div>
            
            <div className="absolute -top-4 -right-4 w-28 h-28 opacity-20 rotate-6 text-white">
              <BookOpen size={112} strokeWidth={1} />
            </div>
            
            <div className="z-10">
              <h2 className="card-title flex items-center gap-4 text-3xl font-extrabold mb-4">
                <div className="bg-white/30 p-3 rounded-xl shadow-inner">
                  <BookOpen size={32} className="text-white" />
                </div>
                <span className="text-white drop-shadow-md">Learn</span>
              </h2>
              <p className="text-white/90 text-lg">Learn and practice your times tables with helpful tips!</p>
            </div>
          </div>
        </a>
        
        <a
          href="/timestables/test"
          onClick={(e) => { e.preventDefault(); navigate("/timestables/test"); }}
          className="card bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xl border-4 border-white 
            hover:shadow-2xl hover:scale-105 transition-all duration-300 transform cursor-pointer rounded-3xl overflow-hidden"
          aria-label="Open Test"
        >
          <div className="card-body relative p-6">
            {/* Decorative elements */}
            <div className="absolute top-3 left-6 w-5 h-5 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-white/10 rounded-full"></div>
            
            <div className="absolute -top-4 -right-4 w-28 h-28 opacity-20 rotate-6 text-white">
              <Timer size={112} strokeWidth={1} />
            </div>
            
            <div className="z-10">
              <h2 className="card-title flex items-center gap-4 text-3xl font-extrabold mb-4">
                <div className="bg-white/30 p-3 rounded-xl shadow-inner">
                  <Timer size={32} className="text-white" />
                </div>
                <span className="text-white drop-shadow-md">Test</span>
              </h2>
              <p className="text-white/90 text-lg">Challenge yourself with a fun times tables test!</p>
            </div>
          </div>
        </a>
      </div>

      {/* Section title */}
      <h2 className="text-2xl font-bold text-slate-700 mt-10 mb-4 flex items-center">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Times Tables</span>
        <span className="bg-purple-100 text-purple-700 text-sm font-medium rounded-full px-3 py-1 ml-3">Choose one to practice</span>
      </h2>

      {/* Times tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ScoreCard } from "../../components/timestables/ScoreCard";
import { TestToolbar } from "../../components/timestables/TestToolbar";
import { Question, type QuestionModel } from "../../components/timestables/Question";
import { Summary } from "../../components/timestables/Summary";
import { getAccuracyForTable, getAverageMsForTable, recordAttempt, sampleQuestions } from "../../lib/timestables-db";

export default function TimesTablesTest() {
  const location = useLocation() as any;
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState(true);
  const [selected, setSelected] = useState<number[]>(() => {
    const pre = location?.state?.preselect as number[] | undefined;
    return Array.isArray(pre) && pre.length ? Array.from(new Set(pre)).filter(n => n >= 1 && n <= 12) : [];
  });
  const [rows, setRows] = useState<Array<{ a: number; acc: number; med: number }>>([]);
  const [qCount, setQCount] = useState(12);
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Array<{ a: number; b: number; value: number; correct: boolean; elapsedMs: number }>>([]);
  const [activeSelection, setActiveSelection] = useState<number[]>([]);
  const [activeCount, setActiveCount] = useState<number>(12);
  const [summary, setSummary] = useState<null | {
    total: number; correct: number; medianMs: number; byTable: Array<{ a: number; items: Array<{ a: number; b: number; answer: number; correct: boolean; elapsedMs: number }> }>;
    selection: number[];
    count: number;
  }>(null);

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

  function toggle(a: number) {
    setSelected(s => s.includes(a) ? s.filter(x => x !== a) : [...s, a]);
  }

  async function start() {
    const scope = selected.length ? selected.slice().sort((x, y) => x - y) : Array.from({ length: 12 }, (_, i) => i + 1);
    const qs = await sampleQuestions(scope, qCount);
    // Ensure no duplicates within session unless pool exhausted handled by sampler
    setQuestions(qs);
    setActiveSelection(scope);
    setActiveCount(qs.length);
    setSelecting(false);
    setI(0);
    setAnswers([]);
    setSummary(null);
  }

  function onSelectAll() { setSelected(Array.from({ length: 12 }, (_, i) => i + 1)); }
  function onClear() { setSelected([]); }

  async function handleSubmit(ans: { correct: boolean; value: number; elapsedMs: number }) {
    const q = questions[i];
    // Store answer in state but don't record to DB yet
    setAnswers(prev => [...prev, { a: q.a, b: q.b, value: ans.value, correct: ans.correct, elapsedMs: ans.elapsedMs }]);
    
    if (i + 1 < questions.length) {
      setI(i + 1);
    } else {
      // Test is complete, now record all attempts to the database
      const currentAnswers = [...answers, { a: q.a, b: q.b, value: ans.value, correct: ans.correct, elapsedMs: ans.elapsedMs }];
      
      // Save all attempts to database at once
      await Promise.all(currentAnswers.map(answer => 
        recordAttempt(answer.a, answer.b, answer.correct, answer.elapsedMs)
      ));
      
      // Build summary
      const total = currentAnswers.length;
      const correct = currentAnswers.filter(a => a.correct).length;
      const times = currentAnswers.map(a => a.elapsedMs);
      const sum = times.reduce((acc, time) => acc + time, 0);
      const medianMs = Math.round(sum / times.length); // Actually average now, keeping variable name for compatibility

      const grouped: Record<number, Array<{ a: number; b: number; answer: number; correct: boolean; elapsedMs: number }>> = {};
      const all = currentAnswers.map(r => ({
        a: r.a,
        b: r.b,
        answer: r.value,
        correct: r.correct,
        elapsedMs: r.elapsedMs,
      }));
      for (const it of all) {
        if (!grouped[it.a]) grouped[it.a] = [];
        grouped[it.a].push(it);
      }
      const byTable = Object.entries(grouped)
        .map(([ak, items]) => ({ a: parseInt(ak), items }))
        .sort((x, y) => x.a - y.a);

      setSummary({ total, correct, medianMs, byTable, selection: activeSelection, count: questions.length });
    }
  }

  function tryAgain() {
    if (!summary) return;
    // Return to selection with previous choices preselected
    setSelected(summary.selection);
    setQCount(summary.count);
    setSummary(null);
    setSelecting(true);
  }

  if (selecting) {
    return (
      <div className="space-y-4">
        <TestToolbar
          selectedCount={selected.length}
          total={12}
          canStart={selected.length > 0}
          onSelectAll={onSelectAll}
          onClear={onClear}
          onStart={start}
          questionCount={qCount}
          setQuestionCount={setQCount}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(a => (
            <ScoreCard
              key={a}
              table={a}
              accuracy={rows.find(r => r.a === a)?.acc || 0}
              medianMs={rows.find(r => r.a === a)?.med || 0}
              selectable
              selected={selected.includes(a)}
              onToggle={() => toggle(a)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (summary) {
    return (
      <Summary
        total={summary.total}
        correct={summary.correct}
        medianMs={summary.medianMs}
        byTable={summary.byTable}
        onTryAgain={tryAgain}
      />
    );
  }

  // Running
  const q = questions[i];
  return (
    <div className="bg-base-100 rounded-xl p-4 shadow">
      <Question index={i} total={questions.length} q={q} onSubmit={handleSubmit} />
    </div>
  );
}

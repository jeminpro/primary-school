import React, { useEffect, useRef, useState } from "react";

export type QuestionModel = { a: number; b: number };

type Props = {
  index: number;
  total: number;
  q: QuestionModel;
  onSubmit: (answer: { correct: boolean; value: number; elapsedMs: number }) => void;
};

export function Question({ index, total, q, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [start, setStart] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue("");
    const t = performance.now();
    setStart(t);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [q.a, q.b]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const elapsedMs = Math.max(0, performance.now() - start);
    const v = parseInt((value || "").trim().replace(/^0+/, "")) || 0;
    const correct = v === q.a * q.b;
    onSubmit({ correct, value: v, elapsedMs });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto py-8">
      <div className="mb-6 text-sm font-medium text-violet-700 bg-violet-100 py-2 px-4 rounded-full inline-block">
        Q {index + 1} of {total}
      </div>
      
      <div className="flex items-center justify-center gap-6 text-5xl font-bold mb-10">
        <span className="text-slate-800" aria-hidden>{q.a}</span>
        <span className="text-violet-600" aria-hidden>×</span>
        <span className="text-slate-800" aria-hidden>{q.b}</span>
        <span className="text-violet-600" aria-hidden>=</span>
        <input
          ref={inputRef}
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          autoComplete="off"
          className="w-32 h-16 text-center text-4xl bg-white border-2 border-violet-200 focus:border-violet-500 rounded-xl shadow-sm focus:shadow focus:outline-none transition-all duration-200"
          value={value}
          onPaste={(e) => e.preventDefault()}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
          aria-label={`What is ${q.a} times ${q.b}`}
        />
      </div>
      
      <div className="flex justify-center">
        <button 
          type="submit" 
          className="bg-violet-600 hover:bg-violet-700 text-white text-lg font-medium py-3 px-8 rounded-full w-full max-w-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

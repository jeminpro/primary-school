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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="text-center text-xl mb-4">Q {index + 1} of {total}</div>
      <div className="flex items-center justify-center gap-3 text-4xl font-extrabold mb-6">
        <span aria-hidden>{q.a}</span>
        <span aria-hidden>×</span>
        <span aria-hidden>{q.b}</span>
        <span aria-hidden>=</span>
        <input
          ref={inputRef}
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          autoComplete="off"
          className="input input-bordered w-32 text-center text-4xl"
          value={value}
          onPaste={(e) => e.preventDefault()}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
          aria-label={`What is ${q.a} times ${q.b}`}
        />
      </div>
      <div className="flex justify-center">
        <button type="submit" className="btn btn-primary">Submit</button>
      </div>
    </form>
  );
}

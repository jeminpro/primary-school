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
    // Focus input reliably across devices (iOS can be finicky). Use RAF and a short timeout,
    // and select the input so the keyboard appears and cursor is ready.
    const rafId = requestAnimationFrame(() => {
      inputRef.current?.focus();
      try { inputRef.current?.setSelectionRange(0, inputRef.current.value.length); } catch (e) { /* ignore */ }
    });
    const toId = setTimeout(() => {
      inputRef.current?.focus();
      try { inputRef.current?.setSelectionRange(0, inputRef.current.value.length); } catch (e) { /* ignore */ }
    }, 50);

    // Listen for external focus requests (dispatched by the test runner after advancing)
    const onRequestFocus = () => {
      inputRef.current?.focus();
      try { inputRef.current?.setSelectionRange(0, inputRef.current.value.length); } catch (e) { }
    };
    window.addEventListener("ts:focus-answer", onRequestFocus as EventListener);

    return () => { cancelAnimationFrame(rafId); clearTimeout(toId); window.removeEventListener("ts:focus-answer", onRequestFocus as EventListener); };
  }, [q.a, q.b]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const elapsedMs = Math.max(0, performance.now() - start);
    const raw = (value || "").trim();
    if (raw === "") {
      // Do not allow empty submissions; re-focus the input for mobile keyboards
      inputRef.current?.focus();
      return;
    }

    const v = parseInt(raw.replace(/^0+/, "")) || 0;
    const correct = v === q.a * q.b;
    onSubmit({ correct, value: v, elapsedMs });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto py-4 sm:py-8 px-4 sm:px-0">
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm font-medium text-violet-700 bg-violet-100 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full inline-block">
        Q {index + 1} of {total}
      </div>
      
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-6 text-3xl sm:text-5xl font-bold mb-6 sm:mb-10">
        <div className="flex items-center">
          <span className="text-slate-800 mr-3 sm:mr-0" aria-hidden>{q.a}</span>
          <span className="text-violet-600 mr-3 sm:mr-0" aria-hidden>×</span>
          <span className="text-slate-800" aria-hidden>{q.b}</span>
        </div>
        <span className="text-violet-600 mx-1" aria-hidden>=</span>
        <input
          ref={inputRef}
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          autoComplete="off"
          className="w-24 sm:w-32 h-14 sm:h-16 text-center text-3xl sm:text-4xl bg-white border-2 border-violet-200 focus:border-violet-500 rounded-xl shadow-sm focus:shadow focus:outline-none transition-all duration-200"
          value={value}
          onPaste={(e) => e.preventDefault()}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
          aria-label={`What is ${q.a} times ${q.b}`}
        />
      </div>
      
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={value.trim() === ""}
          className={`bg-violet-600 hover:bg-violet-700 text-white text-base sm:text-lg font-medium py-2.5 sm:py-3 px-6 sm:px-8 rounded-full w-full max-w-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${value.trim() === '' ? 'opacity-60 cursor-not-allowed hover:shadow-none hover:-translate-y-0' : ''}`}
        >
          Submit
        </button>
      </div>
    </form>
  );
}

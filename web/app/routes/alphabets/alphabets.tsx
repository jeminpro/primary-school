import { Link } from "react-router";
import react, { useMemo, useState,  } from "react";
import { ArrowLeft, BookOpen, PencilLine } from "lucide-react";

/**
 * AlphabetLanding – Peppa‑style Alphabets Hub (TypeScript)
 * Routes:
 *  - Back to home: "/"
 *  - Learn: "/alphabet/learn"
 *  - Test:  "/alphabet/test"
 * Assets (optional): place letter images at /public/images/alphabets/A.png ... Z.png
 * If an image is missing, a cute fallback letter tile is shown instead.
 */
export default function AlphabetLanding(): react.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100">
      {/* Peppa-ish background scene */}
      <PeppaBackdrop />

      {/* Top bar */}
      <div className="relative navbar bg-transparent p-4">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost gap-2 hover:bg-transparent hover:text-current hover:border-none">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative mt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="hero rounded-3xl bg-base-100/70 backdrop-blur border border-base-200 shadow-xl">
            <div className="hero-content flex-col md:flex-row gap-8 p-8">
              <div className="shrink-0">
                <img
                  className="w-50  mt-25"
                  src="https://www.peppapig.com/_next/image?url=https%3A%2F%2Fassets-us-01.kc-usercontent.com%3A443%2F500e0a65-283d-00ef-33b2-7f1f20488fe2%2Fbea4933f-a176-468a-acab-59ea00a75f79%2FMeet_the_Characters.webp&w=750&q=75"
                  alt="Letters A to Z" />


              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-secondary tracking-tight">Alphabets (A–Z)</h1>
                <p className="mt-2 text-base-content/70 max-w-prose">
                  Pick <span className="font-semibold">Learn</span> to hear and see letters, or choose <span className="font-semibold">Test</span> to check what you know!
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/alphabets/learn" className="card bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 border border-base-300 hover:shadow-2xl transition">
                    <div className="card-body">
                      <div className="flex items-center gap-3">
                        <div className="mask mask-squircle p-3 bg-primary text-primary-content shadow-inner">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h2 className="card-title">Learn</h2>
                      </div>
                      <p className="opacity-80">See each letter, hear the sound, trace with your finger.</p>
                      <div className="card-actions justify-end">
                        <span className="btn btn-primary btn-sm">Go to Learn</span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/alphabets/test" className="card bg-gradient-to-br from-amber-200 via-yellow-200 to-lime-200 border border-base-300 hover:shadow-2xl transition">
                    <div className="card-body">
                      <div className="flex items-center gap-3">
                        <div className="mask mask-squircle p-3 bg-secondary text-secondary-content shadow-inner">
                          <PencilLine className="w-6 h-6" />
                        </div>
                        <h2 className="card-title">Test</h2>
                      </div>
                      <p className="opacity-80">Pick the letter I say, match sounds, and win stars!</p>
                      <div className="card-actions justify-end">
                        <span className="btn btn-secondary btn-sm">Go to Test</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Rolling hills (foreground) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-green-300/80 to-green-200/20"></div>
    </div>
  );
}

// ————————————————————————————————————————————————
// Background scene: clouds + sun + hills (Peppa-ish vibe)
// ————————————————————————————————————————————————

function PeppaBackdrop(): react.JSX.Element {
  return (
    <div className="absolute inset-0 -z-0">
      {/* sun */}
      <div className="absolute right-6 top-6 w-20 h-20 rounded-full bg-yellow-300 shadow-[0_0_0_6px_rgba(253,224,71,0.5)]" />

      {/* clouds */}
      <Cloud className="absolute left-8 top-14 scale-100" />
      <Cloud className="absolute right-16 top-24 scale-75" />
      <Cloud className="absolute left-1/2 top-10 -translate-x-1/2 scale-90" />

      {/* hills */}
      <div className="absolute -bottom-16 -left-10 w-80 h-48 bg-green-300 rounded-[50%] blur-[1px]" />
      <div className="absolute -bottom-20 left-40 w-96 h-56 bg-green-400 rounded-[50%] blur-[1px]" />
      <div className="absolute -bottom-24 right-0 w-96 h-52 bg-green-300 rounded-[50%] blur-[1px]" />
    </div>
  );
}

function Cloud({ className = "" }: { className?: string }): react.JSX.Element {
  return (
    <div className={"text-white/90 drop-shadow " + className} aria-hidden>
      <div className="flex items-center gap-1">
        <div className="bg-white w-14 h-8 rounded-full" />
        <div className="bg-white w-10 h-10 rounded-full -ml-3" />
        <div className="bg-white w-16 h-9 rounded-full -ml-4" />
      </div>
    </div>
  );
}

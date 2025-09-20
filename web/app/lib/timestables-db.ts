import Dexie, { type Table } from "dexie";

export interface TTAttempt {
  id?: number;
  a: number; // table (1..12)
  b: number; // multiplicand (1..12)
  correct: boolean;
  elapsedMs: number; // high-res elapsed time
  date: number; // epoch ms
}

// Keep last N attempts per (a,b) reasonably bounded
const MAX_HISTORY_PER_FACT = 100;

export class MathTimesTableDB extends Dexie {
  attempts!: Table<TTAttempt, number>;

  constructor() {
    super("MathTimesTableDB");
    this.version(1).stores({
      attempts: "++id, a, b, date, correct"
    });
  }
}

export const ttDB = new MathTimesTableDB();

// Record one attempt
export async function recordAttempt(a: number, b: number, correct: boolean, elapsedMs: number) {
  await ttDB.attempts.add({ a, b, correct, elapsedMs, date: Date.now() });
  // Optional: prune old attempts per fact to limit growth
  const count = await ttDB.attempts.where({ a, b }).count();
  if (count > MAX_HISTORY_PER_FACT) {
    const toDelete = await ttDB.attempts
      .where({ a, b })
      .sortBy("date");
    const remove = toDelete.slice(0, toDelete.length - MAX_HISTORY_PER_FACT).map(r => r.id!)
    if (remove.length) await ttDB.attempts.bulkDelete(remove);
  }
}

// Helpers for stats per table a (1..12)
export async function getAccuracyForTable(a: number): Promise<number> {
  const attempts = await ttDB.attempts.where("a").equals(a).reverse().sortBy("date");
  const recent = attempts.slice(-30);
  if (recent.length === 0) return 0;
  const correct = recent.filter(r => r.correct).length;
  return Math.round((correct / recent.length) * 100);
}

export async function getMedianMsForTable(a: number): Promise<number> {
  const attempts = await ttDB.attempts.where("a").equals(a).reverse().sortBy("date");
  const recent = attempts.slice(-30).filter(r => r.correct);
  if (recent.length === 0) return 0;
  const times = recent.map(r => r.elapsedMs).sort((x, y) => x - y);
  const mid = Math.floor(times.length / 2);
  return times.length % 2 ? times[mid] : Math.round((times[mid - 1] + times[mid]) / 2);
}

export async function getAverageMsForTable(a: number): Promise<number> {
  const attempts = await ttDB.attempts.where("a").equals(a).reverse().sortBy("date");
  const recent = attempts.slice(-30).filter(r => r.correct);
  if (recent.length === 0) return 0;
  const times = recent.map(r => r.elapsedMs);
  const sum = times.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / times.length);
}

export async function getAttemptCountForTable(a: number): Promise<number> {
  return ttDB.attempts.where("a").equals(a).count();
}

function weightedSample<T>(items: T[], weights: number[], count: number): T[] {
  // Sampling without replacement, weights recomputed each draw
  const result: T[] = [];
  const pool = items.map((it, i) => ({ it, w: Math.max(0, weights[i]), i }));
  for (let k = 0; k < count && pool.length > 0; k++) {
    const total = pool.reduce((s, p) => s + p.w, 0) || pool.length;
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= pool[idx].w || (total / pool.length);
      if (r <= 0) break;
    }
    const chosen = pool.splice(Math.min(idx, pool.length - 1), 1)[0];
    result.push(chosen.it);
  }
  return result;
}

// Build sampling weights per rules
export async function sampleQuestions(scope: number[], count: number): Promise<Array<{ a: number; b: number }>> {
  const S = scope.filter(n => n >= 1 && n <= 12);
  const pool: Array<{ a: number; b: number }> = [];
  for (const a of S) for (let b = 1; b <= 12; b++) pool.push({ a, b });

  // Gather attempt history per fact and per table
  const allAttempts = await ttDB.attempts.where("a").anyOf(S).toArray();
  const byFact = new Map<string, TTAttempt[]>();
  const recent5ByFact = new Map<string, TTAttempt[]>();
  for (const r of allAttempts) {
    const key = `${r.a}x${r.b}`;
    if (!byFact.has(key)) byFact.set(key, []);
    byFact.get(key)!.push(r);
  }
  for (const [k, list] of byFact) {
    list.sort((x, y) => y.date - x.date);
    recent5ByFact.set(k, list.slice(0, 5));
  }

  const weights: number[] = [];
  for (const q of pool) {
    const key = `${q.a}x${q.b}`;
    const history = byFact.get(key) || [];
    const recent5 = recent5ByFact.get(key) || [];

    // Base weights
    let w = 1;

    // 1) Never asked before → high priority
    if (history.length === 0) {
      w = 100;
    } else {
      // 2) Most wrong within last 5 attempts → weight by errors in last 5
      const wrongRecent = recent5.filter(r => !r.correct).length;
      w += wrongRecent * 10; // 0..50

      // 3) Otherwise weighted by recent error rate (last 30)
      const recent30 = history.slice(0, 30);
      const wrong30 = recent30.filter(r => !r.correct).length;
      const rate = recent30.length ? wrong30 / recent30.length : 0;
      w += Math.round(rate * 10); // 0..10

      // Slightly de-prioritize very recently asked to avoid repeats in a session
      const lastAskAgo = Date.now() - (history[0]?.date || 0);
      if (lastAskAgo < 60_000) w = Math.max(1, w - 2);
    }

    weights.push(w);
  }

  const picks = weightedSample(pool, weights, Math.min(count, pool.length));
  return picks;
}

export function formatMsToSeconds(ms: number): string {
  if (!ms) return "0.0s";
  const s = ms / 1000;
  return `${Math.floor(s)}.${String(Math.round((s % 1) * 10)).padStart(1, "0")}s`;
}

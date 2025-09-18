import Dexie from "dexie";
import type { Table } from "dexie";

export interface SpellingWord {
  id?: number;
  word: string;
  sentence?: string;
}

export interface SpellingTest {
  id?: number;
  name: string;
  words: SpellingWord[];
  createdAt: number;
  updatedAt: number;
}

export interface SpellingResult {
  id?: number;
  testId: number;
  date: number;
  answers: { word: string; correct: boolean }[];
}

export class SpellingsDB extends Dexie {
  tests!: Table<SpellingTest, number>;
  results!: Table<SpellingResult, number>;

  constructor() {
    super("SpellingsDB");
    this.version(1).stores({
      tests: "++id, name, createdAt, updatedAt",
      results: "++id, testId, date"
    });
  }
}

export const spellingsDB = new SpellingsDB();

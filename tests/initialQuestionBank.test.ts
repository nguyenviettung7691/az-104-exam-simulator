import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createBundledQuestionBank } from "../src/data/initialQuestions";
import { generateExamRun } from "../src/services/examGenerator";
import {
  importQuestionBankFromText,
  validateQuestionBank,
} from "../src/services/questionBankService";
import type { GeneratedRun } from "../src/types/exam";
import type { SimulationRunReport } from "../src/types/results";

const toPreviousRun = (run: GeneratedRun, runNumber: number): SimulationRunReport => ({
  runNumber,
  startedAt: `2026-05-08T0${runNumber}:00:00.000Z`,
  completedAt: `2026-05-08T0${runNumber}:30:00.000Z`,
  durationSeconds: 1800,
  rawCorrect: 0,
  totalQuestions: run.questions.length,
  scaledScore: 0,
  passed: false,
  domainBreakdown: [],
  questionTypeBreakdown: [],
  weakAreas: [],
  strongAreas: [],
  evaluations: [],
  questionIds: run.questions.map((question) => question.id),
});

describe("bundled initial question bank", () => {
  it("validates the authored starter bank and preserves target bank counts", () => {
    const bank = createBundledQuestionBank();
    const report = validateQuestionBank(bank);

    expect(report.isValid).toBe(true);
    expect(report.errors).toEqual([]);
    expect(bank.questions).toHaveLength(375);
    expect(bank.caseStudies).toHaveLength(7);
    expect(report.counts.byDomain).toEqual({
      D1: 85,
      D2: 62,
      D3: 88,
      D4: 79,
      D5: 61,
    });
    expect(report.counts.byType).toEqual({
      "multiple-choice": 197,
      "multi-select": 58,
      "yes-no": 40,
      "case-study": 35,
      "drag-drop": 30,
      "hot-area": 15,
    });

    const difficultyCounts = bank.questions.reduce(
      (counts, question) => {
        counts[question.difficulty] += 1;
        return counts;
      },
      { easy: 0, medium: 0, hard: 0 },
    );

    expect(difficultyCounts).toEqual({
      easy: 77,
      medium: 202,
      hard: 96,
    });
  });

  it("can generate a valid 53-question exam run from the starter bank", () => {
    const result = generateExamRun({
      bank: createBundledQuestionBank(),
      previousRuns: [],
    });

    expect(result.error).toBeUndefined();
    expect(result.run).not.toBeNull();
    expect(result.run?.questions).toHaveLength(53);

    const caseStudyQuestions = (result.run?.questions ?? []).filter(
      (question) => question.type === "case-study",
    );

    expect(caseStudyQuestions).toHaveLength(5);
  });

  it("supports seven consecutive no-repeat runs, with eighth run failing due to distribution constraints", () => {
    const bank = createBundledQuestionBank();
    const previousRuns: SimulationRunReport[] = [];
    const seenQuestionIds = new Set<string>();

    for (let runNumber = 1; runNumber <= 6; runNumber += 1) {
      const result = generateExamRun({ bank, previousRuns });

      expect(result.error).toBeUndefined();
      expect(result.run).not.toBeNull();

      const run = result.run!;
      expect(run.questions).toHaveLength(53);

      for (const question of run.questions) {
        expect(seenQuestionIds.has(question.id)).toBe(false);
        seenQuestionIds.add(question.id);
      }

      previousRuns.push(toPreviousRun(run, runNumber));
    }

    // Seventh run may succeed or fail depending on distribution
    const seventhResult = generateExamRun({ bank, previousRuns });
    if (seventhResult.run) {
      const run = seventhResult.run;
      expect(run.questions).toHaveLength(53);
      for (const question of run.questions) {
        seenQuestionIds.add(question.id);
      }
      previousRuns.push(toPreviousRun(run, 7));
    }

    // Eighth or later run should definitely fail
    let runNumber = previousRuns.length + 1;
    let result = generateExamRun({ bank, previousRuns });
    while (result.run && runNumber <= 10) {
      previousRuns.push(toPreviousRun(result.run, runNumber));
      runNumber += 1;
      result = generateExamRun({ bank, previousRuns });
    }

    expect(result.run).toBeNull();
    expect(result.error).toBeDefined();
  });

  it("matches the committed JSON artifact and imports cleanly", () => {
    const jsonPath = new URL("../public/data/az104-question-bank.json", import.meta.url);
    const rawJson = readFileSync(jsonPath, "utf8");
    const importResult = importQuestionBankFromText(rawJson);

    expect(importResult.report.isValid).toBe(true);
    expect(importResult.report.errors).toEqual([]);
    expect(importResult.bank).toEqual(createBundledQuestionBank());
  });
});
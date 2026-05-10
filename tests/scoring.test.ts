import { describe, expect, it } from "vitest";
import { DOMAIN_QUOTAS } from "../src/config/examBlueprint";
import { buildSimulationRunReport, estimateScaledScore } from "../src/services/scoringService";
import type { Question } from "../src/types/exam";
import type { QuestionEvaluation } from "../src/types/results";

const makeQuestion = (id: string, domain: Question["domain"], subtopic: string): Question => ({
  id,
  domain,
  type: "multiple-choice",
  difficulty: "medium",
  company: "Contoso",
  scenario: "Scenario text",
  stem: "Stem",
  subtopic,
  referenceTopic: "Reference",
  explanation: "Explanation",
  options: [
    { id: "A", text: "A" },
    { id: "B", text: "B" },
    { id: "C", text: "C" },
    { id: "D", text: "D" },
  ],
  correctOptionId: "A",
  active: true,
});

const makeEvaluation = (
  question: Question,
  isCorrect: boolean,
): QuestionEvaluation => ({
  questionId: question.id,
  isCorrect,
  correctAnswerLabel: "A",
  explanation: "Explanation",
  wrongOptionReasons: ["B) Wrong", "C) Wrong", "D) Wrong"],
  referenceTopic: "Reference",
  userAnswer: { type: "choice", optionIds: isCorrect ? ["A"] : ["B"] },
  difficulty: question.difficulty,
  domain: question.domain,
  type: question.type,
  subtopic: question.subtopic,
});

describe("scoringService", () => {
  it("estimates scaled score in expected range", () => {
    expect(estimateScaledScore(0, 53)).toBe(100);
    expect(estimateScaledScore(53, 53)).toBe(1000);
    expect(estimateScaledScore(37, 53)).toBeGreaterThanOrEqual(700);
  });

  it("builds run report with domain and weak area output", () => {
    const questions: Question[] = [];
    let id = 1;

    (Object.keys(DOMAIN_QUOTAS) as Question["domain"][]).forEach((domain) => {
      for (let index = 0; index < DOMAIN_QUOTAS[domain]; index += 1) {
        questions.push(makeQuestion(`q-${id++}`, domain, `${domain}-topic`));
      }
    });

    const evaluations = questions.map((question, index) => {
      const isCorrect = index < 40;
      return makeEvaluation(question, isCorrect);
    });

    const report = buildSimulationRunReport({
      runNumber: 1,
      startedAt: new Date(Date.now() - 1000 * 60).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: 60,
      questions,
      evaluations,
    });

    expect(report.rawCorrect).toBe(40);
    expect(report.totalQuestions).toBe(53);
    expect(report.scaledScore).toBeGreaterThanOrEqual(700);
    expect(report.domainBreakdown).toHaveLength(5);
    expect(report.questionTypeBreakdown.find((line) => line.type === "multiple-choice")?.total).toBe(53);
    expect(report.weakAreas.length).toBeGreaterThan(0);
  });
});

import type { Difficulty, DomainId, QuestionType } from "../types/exam";

export const EXAM_TOTAL_QUESTIONS = 53;
export const EXAM_DURATION_MINUTES = 120;
export const PASS_SCALED_SCORE = 700;

export const DOMAIN_QUOTAS: Record<DomainId, number> = {
  D1: 12,
  D2: 9,
  D3: 13,
  D4: 11,
  D5: 8,
};

export const QUESTION_TYPE_QUOTAS: Record<QuestionType, number> = {
  "multiple-choice": 28,
  "multi-select": 8,
  "yes-no": 6,
  "case-study": 5,
  "drag-drop": 4,
  "hot-area": 2,
};

export const DIFFICULTY_TARGETS: Record<Difficulty, number> = {
  easy: 11,
  medium: 29,
  hard: 13,
};

export const CASE_STUDY_QUESTION_COUNT = 5;

export const EXAM_COMPANIES = [
  "Contoso",
  "Litware",
  "Fabrikam",
  "Tailwind Traders",
  "Northwind",
  "Alpine Ski House",
] as const;

const sumRecord = (items: Record<string, number>): number => {
  return Object.values(items).reduce<number>((sum, value) => sum + value, 0);
};

export const validateBlueprint = (): string[] => {
  const errors: string[] = [];

  if (sumRecord(DOMAIN_QUOTAS) !== EXAM_TOTAL_QUESTIONS) {
    errors.push("Domain quotas must sum to 53 questions.");
  }

  if (sumRecord(QUESTION_TYPE_QUOTAS) !== EXAM_TOTAL_QUESTIONS) {
    errors.push("Question type quotas must sum to 53 questions.");
  }

  if (QUESTION_TYPE_QUOTAS["case-study"] !== CASE_STUDY_QUESTION_COUNT) {
    errors.push("Case-study quota must be exactly 5 questions.");
  }

  if (sumRecord(DIFFICULTY_TARGETS) !== EXAM_TOTAL_QUESTIONS) {
    errors.push("Difficulty targets must sum to 53 questions.");
  }

  return errors;
};

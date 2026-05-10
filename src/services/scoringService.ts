import { PASS_SCALED_SCORE } from "../config/examBlueprint";
import {
  DOMAIN_DEFINITIONS,
  DOMAIN_IDS,
  QUESTION_TYPES,
  type Question,
} from "../types/exam";
import type {
  DomainScoreLine,
  QuestionEvaluation,
  QuestionTypeScoreLine,
  SimulationRunReport,
} from "../types/results";

interface BuildReportInput {
  runNumber: number;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  questions: Question[];
  evaluations: QuestionEvaluation[];
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const estimateScaledScore = (rawCorrect: number, totalQuestions: number): number => {
  if (totalQuestions <= 0) {
    return 100;
  }

  const ratio = rawCorrect / totalQuestions;
  const scaled = Math.round(100 + Math.pow(ratio, 1.05) * 900);
  return clamp(scaled, 100, 1000);
};

const buildDomainBreakdown = (
  questions: Question[],
  evaluationsById: Map<string, QuestionEvaluation>,
): DomainScoreLine[] => {
  return DOMAIN_IDS.map((domain) => {
    const domainQuestions = questions.filter((question) => question.domain === domain);
    const correct = domainQuestions.reduce((sum, question) => {
      const evaluation = evaluationsById.get(question.id);
      return sum + (evaluation?.isCorrect ? 1 : 0);
    }, 0);

    const total = domainQuestions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      domain,
      correct,
      total,
      percentage,
      status: percentage >= 70 ? "PASS" : "REVIEW",
    };
  });
};

const buildQuestionTypeBreakdown = (
  questions: Question[],
  evaluationsById: Map<string, QuestionEvaluation>,
): QuestionTypeScoreLine[] => {
  return QUESTION_TYPES.map((type) => {
    const typeQuestions = questions.filter((question) => question.type === type);
    const correct = typeQuestions.reduce((sum, question) => {
      const evaluation = evaluationsById.get(question.id);
      return sum + (evaluation?.isCorrect ? 1 : 0);
    }, 0);

    return {
      type,
      correct,
      total: typeQuestions.length,
    };
  });
};

const buildWeakAreas = (evaluations: QuestionEvaluation[]): string[] => {
  const missesBySubtopic = new Map<string, number>();

  for (const evaluation of evaluations) {
    if (evaluation.isCorrect) {
      continue;
    }

    missesBySubtopic.set(
      evaluation.subtopic,
      (missesBySubtopic.get(evaluation.subtopic) ?? 0) + 1,
    );
  }

  return [...missesBySubtopic.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([subtopic]) => subtopic);
};

const buildStrongAreas = (evaluations: QuestionEvaluation[]): string[] => {
  const statsBySubtopic = new Map<string, { correct: number; total: number }>();

  for (const evaluation of evaluations) {
    const current = statsBySubtopic.get(evaluation.subtopic) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (evaluation.isCorrect) {
      current.correct += 1;
    }

    statsBySubtopic.set(evaluation.subtopic, current);
  }

  return [...statsBySubtopic.entries()]
    .filter(([, value]) => value.total > 0 && value.correct / value.total >= 0.85)
    .sort((left, right) => {
      const leftRatio = left[1].correct / left[1].total;
      const rightRatio = right[1].correct / right[1].total;
      return rightRatio - leftRatio;
    })
    .slice(0, 8)
    .map(([subtopic]) => subtopic);
};

export const buildSimulationRunReport = ({
  runNumber,
  startedAt,
  completedAt,
  durationSeconds,
  questions,
  evaluations,
}: BuildReportInput): SimulationRunReport => {
  const evaluationsById = new Map(evaluations.map((evaluation) => [evaluation.questionId, evaluation]));
  const rawCorrect = evaluations.reduce((sum, evaluation) => sum + (evaluation.isCorrect ? 1 : 0), 0);
  const totalQuestions = questions.length;
  const scaledScore = estimateScaledScore(rawCorrect, totalQuestions);
  const domainBreakdown = buildDomainBreakdown(questions, evaluationsById);
  const questionTypeBreakdown = buildQuestionTypeBreakdown(questions, evaluationsById);

  return {
    runNumber,
    startedAt,
    completedAt,
    durationSeconds,
    rawCorrect,
    totalQuestions,
    scaledScore,
    passed: scaledScore >= PASS_SCALED_SCORE,
    domainBreakdown,
    questionTypeBreakdown,
    weakAreas: buildWeakAreas(evaluations),
    strongAreas: buildStrongAreas(evaluations),
    evaluations,
    questionIds: questions.map((question) => question.id),
  };
};

export const formatDomainLabel = (domain: (typeof DOMAIN_IDS)[number]): string => {
  return DOMAIN_DEFINITIONS[domain].shortTitle;
};

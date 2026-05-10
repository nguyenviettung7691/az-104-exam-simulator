import type {
  Difficulty,
  DomainId,
  QuestionType,
  UserAnswer,
} from "./exam";

export interface QuestionEvaluation {
  questionId: string;
  isCorrect: boolean;
  correctAnswerLabel: string;
  explanation: string;
  wrongOptionReasons: string[];
  referenceTopic: string;
  userAnswer: UserAnswer;
  difficulty: Difficulty;
  domain: DomainId;
  type: QuestionType;
  subtopic: string;
}

export interface DomainScoreLine {
  domain: DomainId;
  correct: number;
  total: number;
  percentage: number;
  status: "PASS" | "REVIEW";
}

export interface QuestionTypeScoreLine {
  type: QuestionType;
  correct: number;
  total: number;
}

export interface SimulationRunReport {
  runNumber: number;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  rawCorrect: number;
  totalQuestions: number;
  scaledScore: number;
  passed: boolean;
  domainBreakdown: DomainScoreLine[];
  questionTypeBreakdown: QuestionTypeScoreLine[];
  weakAreas: string[];
  strongAreas: string[];
  evaluations: QuestionEvaluation[];
  questionIds: string[];
}

export interface DomainTrendLine {
  domain: DomainId;
  percentagesByRun: number[];
  trend: "Improving" | "Stable" | "Declining";
}

export interface PersistentWeakTopic {
  topic: string;
  misses: number;
}

export interface CumulativeAssessment {
  totalRuns: number;
  totalQuestionsAnswered: number;
  averageRawPercentage: number;
  averageScaledScore: number;
  trend: "Improving" | "Stable" | "Declining";
  domainTrends: DomainTrendLine[];
  persistentWeakTopics: PersistentWeakTopic[];
  readyForRealExam: boolean;
  recommendedFocus: string[];
}

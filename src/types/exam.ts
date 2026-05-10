export const DOMAIN_IDS = ["D1", "D2", "D3", "D4", "D5"] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

export interface DomainDefinition {
  id: DomainId;
  title: string;
  shortTitle: string;
}

export const DOMAIN_DEFINITIONS: Record<DomainId, DomainDefinition> = {
  D1: {
    id: "D1",
    title: "Manage Azure Identities and Governance",
    shortTitle: "Identities and Governance",
  },
  D2: {
    id: "D2",
    title: "Implement and Manage Storage",
    shortTitle: "Storage",
  },
  D3: {
    id: "D3",
    title: "Deploy and Manage Azure Compute Resources",
    shortTitle: "Compute",
  },
  D4: {
    id: "D4",
    title: "Implement and Manage Virtual Networking",
    shortTitle: "Virtual Networking",
  },
  D5: {
    id: "D5",
    title: "Monitor and Maintain Azure Resources",
    shortTitle: "Monitor and Maintain",
  },
};

export const QUESTION_TYPES = [
  "multiple-choice",
  "multi-select",
  "yes-no",
  "case-study",
  "drag-drop",
  "hot-area",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const NON_CASE_QUESTION_TYPES = QUESTION_TYPES.filter(
  (type) => type !== "case-study",
) as Exclude<QuestionType, "case-study">[];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type PresentationMode = "single" | "batch";

export interface QuestionBase {
  id: string;
  domain: DomainId;
  type: QuestionType;
  difficulty: Difficulty;
  company: string;
  scenario: string;
  stem: string;
  subtopic: string;
  referenceTopic: string;
  explanation: string;
  hint?: string;
  active?: boolean;
  caseStudyId?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  rationale?: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: "multiple-choice" | "hot-area" | "case-study";
  options: QuestionOption[];
  correctOptionId: string;
}

export interface MultiSelectQuestion extends QuestionBase {
  type: "multi-select";
  options: QuestionOption[];
  selectCount: number;
  correctOptionIds: string[];
}

export type YesNoAnswer = "Yes" | "No";

export interface YesNoStatement {
  id: string;
  text: string;
  answer: YesNoAnswer;
}

export interface YesNoQuestion extends QuestionBase {
  type: "yes-no";
  statements: YesNoStatement[];
}

export interface DragDropQuestion extends QuestionBase {
  type: "drag-drop";
  availableItems: string[];
  answerSlots: string[];
  correctOrder: string[];
}

export type Question =
  | ChoiceQuestion
  | MultiSelectQuestion
  | YesNoQuestion
  | DragDropQuestion;

export interface CaseStudy {
  id: string;
  companyName: string;
  title: string;
  overview: string;
  currentEnvironment: string[];
  plannedChanges: string[];
  requirements: string[];
  questionIds: string[];
}

export interface QuestionBank {
  version: string;
  updatedAt: string;
  questions: Question[];
  caseStudies: CaseStudy[];
}

export interface ChoiceUserAnswer {
  type: "choice";
  optionIds: string[];
}

export interface YesNoUserAnswer {
  type: "yes-no";
  values: Record<string, YesNoAnswer>;
}

export interface DragDropUserAnswer {
  type: "drag-drop";
  orderedItems: string[];
}

export interface SkippedUserAnswer {
  type: "skipped";
}

export type UserAnswer =
  | ChoiceUserAnswer
  | YesNoUserAnswer
  | DragDropUserAnswer
  | SkippedUserAnswer;

export interface GeneratedRun {
  runNumber: number;
  generatedAt: string;
  questions: Question[];
  selectedCaseStudy: CaseStudy;
}

export interface QuestionBankCounts {
  byDomain: Record<DomainId, number>;
  byType: Record<QuestionType, number>;
  activeQuestions: number;
  totalQuestions: number;
}

export interface QuestionBankValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  counts: QuestionBankCounts;
}

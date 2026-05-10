import {
  CASE_STUDY_QUESTION_COUNT,
  DOMAIN_QUOTAS,
  QUESTION_TYPE_QUOTAS,
} from "../config/examBlueprint.ts";
import {
  DIFFICULTIES,
  DOMAIN_IDS,
  NON_CASE_QUESTION_TYPES,
  QUESTION_TYPES,
  type CaseStudy,
  type ChoiceQuestion,
  type DomainId,
  type DragDropQuestion,
  type MultiSelectQuestion,
  type Question,
  type QuestionBank,
  type QuestionBankCounts,
  type QuestionBankValidationReport,
  type QuestionType,
  type YesNoQuestion,
} from "../types/exam";
import { loadJson, saveJson } from "./storage";

const BANK_STORAGE_KEY = "az104.questionBank";

const buildZeroDomainCounts = (): Record<DomainId, number> => {
  return {
    D1: 0,
    D2: 0,
    D3: 0,
    D4: 0,
    D5: 0,
  };
};

const buildZeroTypeCounts = (): Record<QuestionType, number> => {
  return {
    "multiple-choice": 0,
    "multi-select": 0,
    "yes-no": 0,
    "case-study": 0,
    "drag-drop": 0,
    "hot-area": 0,
  };
};

export const createEmptyQuestionBank = (): QuestionBank => {
  return {
    version: "2026.04.17",
    updatedAt: new Date().toISOString(),
    questions: [],
    caseStudies: [],
  };
};

export const loadQuestionBank = (): QuestionBank => {
  return loadJson<QuestionBank>(BANK_STORAGE_KEY, createEmptyQuestionBank());
};

export const saveQuestionBank = (bank: QuestionBank): void => {
  const value: QuestionBank = {
    ...bank,
    updatedAt: new Date().toISOString(),
  };

  saveJson(BANK_STORAGE_KEY, value);
};

const isQuestionActive = (question: Question): boolean => {
  return question.active !== false;
};

export const getActiveQuestions = (bank: QuestionBank): Question[] => {
  return bank.questions.filter(isQuestionActive);
};

export const getQuestionBankCounts = (bank: QuestionBank): QuestionBankCounts => {
  const byDomain = buildZeroDomainCounts();
  const byType = buildZeroTypeCounts();
  const activeQuestions = getActiveQuestions(bank);

  for (const question of activeQuestions) {
    byDomain[question.domain] += 1;
    byType[question.type] += 1;
  }

  return {
    byDomain,
    byType,
    activeQuestions: activeQuestions.length,
    totalQuestions: bank.questions.length,
  };
};

const validateChoiceQuestion = (question: ChoiceQuestion, errors: string[]): void => {
  if (!question.options || question.options.length < 2) {
    errors.push(`Question ${question.id} requires at least 2 options.`);
    return;
  }

  const optionIds = new Set(question.options.map((option) => option.id));
  if (!optionIds.has(question.correctOptionId)) {
    errors.push(`Question ${question.id} has an invalid correctOptionId.`);
  }
};

const validateMultiSelectQuestion = (
  question: MultiSelectQuestion,
  errors: string[],
): void => {
  if (!question.options || question.options.length < 3) {
    errors.push(`Question ${question.id} requires at least 3 options.`);
    return;
  }

  if (question.selectCount < 2) {
    errors.push(`Question ${question.id} must require selecting at least 2 answers.`);
  }

  const optionIds = new Set(question.options.map((option) => option.id));
  for (const optionId of question.correctOptionIds) {
    if (!optionIds.has(optionId)) {
      errors.push(`Question ${question.id} includes an unknown correct option ${optionId}.`);
    }
  }

  if (question.correctOptionIds.length !== question.selectCount) {
    errors.push(
      `Question ${question.id} has selectCount ${question.selectCount} but ${question.correctOptionIds.length} correct answers.`,
    );
  }
};

const validateYesNoQuestion = (question: YesNoQuestion, errors: string[]): void => {
  if (!Array.isArray(question.statements)) {
    errors.push(`Question ${question.id} is missing yes/no statements.`);
    return;
  }

  if (question.statements.length < 2 || question.statements.length > 3) {
    errors.push(`Question ${question.id} must include 2 or 3 statements.`);
  }

  for (const statement of question.statements) {
    if (statement.answer !== "Yes" && statement.answer !== "No") {
      errors.push(`Question ${question.id} has an invalid yes/no answer.`);
    }
  }
};

const validateDragDropQuestion = (
  question: DragDropQuestion,
  errors: string[],
): void => {
  if (!Array.isArray(question.availableItems) || !Array.isArray(question.answerSlots) || !Array.isArray(question.correctOrder)) {
    errors.push(`Question ${question.id} has invalid drag-drop data arrays.`);
    return;
  }

  if (question.availableItems.length < 2) {
    errors.push(`Question ${question.id} must include at least two available items.`);
  }

  if (question.correctOrder.length !== question.answerSlots.length) {
    errors.push(`Question ${question.id} must have one answer per slot.`);
  }

  const available = new Set(question.availableItems);
  for (const value of question.correctOrder) {
    if (!available.has(value)) {
      errors.push(`Question ${question.id} references '${value}' which is not in availableItems.`);
    }
  }
};

const validateQuestionShape = (
  question: Question,
  errors: string[],
  warnings: string[],
): void => {
  if (!DOMAIN_IDS.includes(question.domain)) {
    errors.push(`Question ${question.id} has an invalid domain.`);
  }

  if (!QUESTION_TYPES.includes(question.type)) {
    errors.push(`Question ${question.id} has an invalid type.`);
  }

  if (!DIFFICULTIES.includes(question.difficulty)) {
    errors.push(`Question ${question.id} has an invalid difficulty.`);
  }

  if (!question.subtopic.trim()) {
    warnings.push(`Question ${question.id} is missing subtopic metadata.`);
  }

  switch (question.type) {
    case "multiple-choice":
    case "hot-area":
    case "case-study":
      validateChoiceQuestion(question, errors);
      break;
    case "multi-select":
      validateMultiSelectQuestion(question, errors);
      break;
    case "yes-no":
      validateYesNoQuestion(question, errors);
      break;
    case "drag-drop":
      validateDragDropQuestion(question, errors);
      break;
    default:
      break;
  }
};

const validateCaseStudies = (
  caseStudies: CaseStudy[],
  questionsById: Map<string, Question>,
  errors: string[],
): void => {
  const caseIds = new Set<string>();

  for (const caseStudy of caseStudies) {
    if (caseIds.has(caseStudy.id)) {
      errors.push(`Case study id '${caseStudy.id}' is duplicated.`);
      continue;
    }

    caseIds.add(caseStudy.id);

    if (caseStudy.questionIds.length !== CASE_STUDY_QUESTION_COUNT) {
      errors.push(
        `Case study ${caseStudy.id} must contain exactly ${CASE_STUDY_QUESTION_COUNT} questions.`,
      );
    }

    const seenQuestionIds = new Set<string>();
    for (const questionId of caseStudy.questionIds) {
      if (seenQuestionIds.has(questionId)) {
        errors.push(`Case study ${caseStudy.id} has duplicated question id ${questionId}.`);
        continue;
      }

      seenQuestionIds.add(questionId);
      const question = questionsById.get(questionId);

      if (!question) {
        errors.push(`Case study ${caseStudy.id} references missing question ${questionId}.`);
        continue;
      }

      if (question.type !== "case-study") {
        errors.push(
          `Case study ${caseStudy.id} references ${questionId} but it is not type case-study.`,
        );
      }

      if (question.caseStudyId !== caseStudy.id) {
        errors.push(
          `Question ${questionId} must declare caseStudyId ${caseStudy.id} to match case study linkage.`,
        );
      }
    }
  }
};

export const validateQuestionBank = (bank: QuestionBank): QuestionBankValidationReport => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const counts = getQuestionBankCounts(bank);

  const questionIdSet = new Set<string>();
  const questionsById = new Map<string, Question>();

  for (const question of bank.questions) {
    if (questionIdSet.has(question.id)) {
      errors.push(`Question id '${question.id}' is duplicated.`);
      continue;
    }

    questionIdSet.add(question.id);
    questionsById.set(question.id, question);
    validateQuestionShape(question, errors, warnings);
  }

  validateCaseStudies(bank.caseStudies, questionsById, errors);

  if (counts.activeQuestions === 0) {
    warnings.push("The bank is empty. Add or import questions before starting a run.");
  }

  for (const domain of DOMAIN_IDS) {
    const active = counts.byDomain[domain];
    if (active > 0 && active < DOMAIN_QUOTAS[domain]) {
      warnings.push(
        `${domain} has ${active} active questions. A full run needs at least ${DOMAIN_QUOTAS[domain]}.`,
      );
    }
  }

  for (const type of NON_CASE_QUESTION_TYPES) {
    const active = counts.byType[type];
    if (active > 0 && active < QUESTION_TYPE_QUOTAS[type]) {
      warnings.push(
        `${type} has ${active} active questions. A full run needs at least ${QUESTION_TYPE_QUOTAS[type]}.`,
      );
    }
  }

  if (counts.byType["case-study"] > 0 && bank.caseStudies.length === 0) {
    warnings.push("Case-study questions exist but no case study records are linked.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    counts,
  };
};

export const importQuestionBankFromText = (
  rawText: string,
): { bank: QuestionBank | null; report: QuestionBankValidationReport } => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText) as unknown;
  } catch {
    const invalidReport: QuestionBankValidationReport = {
      isValid: false,
      errors: ["Invalid JSON input. Check formatting and try again."],
      warnings: [],
      counts: getQuestionBankCounts(createEmptyQuestionBank()),
    };

    return {
      bank: null,
      report: invalidReport,
    };
  }

  const safeValue = parsed as QuestionBank;
  const normalized: QuestionBank = {
    version: safeValue.version || "2026.04.17",
    updatedAt: safeValue.updatedAt || new Date().toISOString(),
    questions: Array.isArray(safeValue.questions)
      ? safeValue.questions.map((question) => ({ active: true, ...question }))
      : [],
    caseStudies: Array.isArray(safeValue.caseStudies) ? safeValue.caseStudies : [],
  };

  const report = validateQuestionBank(normalized);

  return {
    bank: report.isValid ? normalized : null,
    report,
  };
};

export const exportQuestionBankText = (bank: QuestionBank): string => {
  return JSON.stringify(bank, null, 2);
};

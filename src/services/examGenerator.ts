import {
  CASE_STUDY_QUESTION_COUNT,
  DIFFICULTY_TARGETS,
  DOMAIN_QUOTAS,
  EXAM_TOTAL_QUESTIONS,
  QUESTION_TYPE_QUOTAS,
} from "../config/examBlueprint";
import type {
  CaseStudy,
  Difficulty,
  DomainId,
  GeneratedRun,
  Question,
  QuestionBank,
  QuestionType,
} from "../types/exam";
import type { SimulationRunReport } from "../types/results";
import { getActiveQuestions, validateQuestionBank } from "./questionBankService";

interface GenerateExamParams {
  bank: QuestionBank;
  previousRuns: SimulationRunReport[];
}

interface GenerateExamResult {
  run: GeneratedRun | null;
  warnings: string[];
  error?: string;
}

type NonCaseQuestionType = Exclude<QuestionType, "case-study">;

type DomainCounter = Record<DomainId, number>;
type TypeCounter = Record<NonCaseQuestionType, number>;

const NON_CASE_TYPES: NonCaseQuestionType[] = [
  "multiple-choice",
  "multi-select",
  "yes-no",
  "drag-drop",
  "hot-area",
];

const createDomainCounter = (): DomainCounter => ({
  D1: 0,
  D2: 0,
  D3: 0,
  D4: 0,
  D5: 0,
});

const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }

  return copy;
};

interface Edge {
  to: number;
  rev: number;
  cap: number;
}

const addEdge = (graph: Edge[][], from: number, to: number, cap: number): Edge => {
  const forward: Edge = { to, rev: graph[to].length, cap };
  const backward: Edge = { to: from, rev: graph[from].length, cap: 0 };
  graph[from].push(forward);
  graph[to].push(backward);
  return forward;
};

const maxFlow = (graph: Edge[][], source: number, sink: number): number => {
  let total = 0;

  while (true) {
    const parentNode = new Array<number>(graph.length).fill(-1);
    const parentEdge = new Array<number>(graph.length).fill(-1);
    const queue: number[] = [source];
    parentNode[source] = source;

    for (let index = 0; index < queue.length; index += 1) {
      const node = queue[index];
      if (node === sink) {
        break;
      }

      for (let edgeIndex = 0; edgeIndex < graph[node].length; edgeIndex += 1) {
        const edge = graph[node][edgeIndex];
        if (edge.cap > 0 && parentNode[edge.to] === -1) {
          parentNode[edge.to] = node;
          parentEdge[edge.to] = edgeIndex;
          queue.push(edge.to);
        }
      }
    }

    if (parentNode[sink] === -1) {
      break;
    }

    let pathCap = Number.POSITIVE_INFINITY;
    let cursor = sink;

    while (cursor !== source) {
      const from = parentNode[cursor];
      const edge = graph[from][parentEdge[cursor]];
      pathCap = Math.min(pathCap, edge.cap);
      cursor = from;
    }

    cursor = sink;
    while (cursor !== source) {
      const from = parentNode[cursor];
      const edgeIndex = parentEdge[cursor];
      const edge = graph[from][edgeIndex];
      edge.cap -= pathCap;
      graph[cursor][edge.rev].cap += pathCap;
      cursor = from;
    }

    total += pathCap;
  }

  return total;
};

const buildUsedQuestionSet = (previousRuns: SimulationRunReport[]): Set<string> => {
  const used = new Set<string>();

  for (const run of previousRuns) {
    for (const questionId of run.questionIds) {
      used.add(questionId);
    }
  }

  return used;
};

const subtractDomainCounts = (
  selectedCaseQuestions: Question[],
): { remaining: DomainCounter; valid: boolean } => {
  const remaining: DomainCounter = {
    D1: DOMAIN_QUOTAS.D1,
    D2: DOMAIN_QUOTAS.D2,
    D3: DOMAIN_QUOTAS.D3,
    D4: DOMAIN_QUOTAS.D4,
    D5: DOMAIN_QUOTAS.D5,
  };

  for (const question of selectedCaseQuestions) {
    remaining[question.domain] -= 1;
  }

  const valid = Object.values(remaining).every((value) => value >= 0);
  return { remaining, valid };
};

const buildAvailability = (
  questions: Question[],
): Record<NonCaseQuestionType, Record<DomainId, Question[]>> => {
  const buckets: Record<NonCaseQuestionType, Record<DomainId, Question[]>> = {
    "multiple-choice": { D1: [], D2: [], D3: [], D4: [], D5: [] },
    "multi-select": { D1: [], D2: [], D3: [], D4: [], D5: [] },
    "yes-no": { D1: [], D2: [], D3: [], D4: [], D5: [] },
    "drag-drop": { D1: [], D2: [], D3: [], D4: [], D5: [] },
    "hot-area": { D1: [], D2: [], D3: [], D4: [], D5: [] },
  };

  for (const question of questions) {
    if (question.type === "case-study") {
      continue;
    }

    buckets[question.type][question.domain].push(question);
  }

  return buckets;
};

const computeTypeFlow = (
  buckets: Record<NonCaseQuestionType, Record<DomainId, Question[]>>,
  domainRemaining: DomainCounter,
  typeTargets: TypeCounter,
): Record<NonCaseQuestionType, Record<DomainId, number>> | null => {
  const source = 0;
  const typeOffset = 1;
  const domainOffset = typeOffset + NON_CASE_TYPES.length;
  const sink = domainOffset + 5;
  const graph: Edge[][] = Array.from({ length: sink + 1 }, () => []);
  const typeNode = new Map<NonCaseQuestionType, number>();
  const domainNode = new Map<DomainId, number>();

  NON_CASE_TYPES.forEach((type, index) => {
    typeNode.set(type, typeOffset + index);
  });

  (["D1", "D2", "D3", "D4", "D5"] as DomainId[]).forEach((domain, index) => {
    domainNode.set(domain, domainOffset + index);
  });

  for (const type of NON_CASE_TYPES) {
    addEdge(graph, source, typeNode.get(type)!, typeTargets[type]);
  }

  const flowEdgeMap = new Map<string, { edge: Edge; cap: number }>();

  for (const type of NON_CASE_TYPES) {
    for (const domain of ["D1", "D2", "D3", "D4", "D5"] as DomainId[]) {
      const capacity = buckets[type][domain].length;
      if (capacity > 0) {
        const edge = addEdge(graph, typeNode.get(type)!, domainNode.get(domain)!, capacity);
        flowEdgeMap.set(`${type}|${domain}`, { edge, cap: capacity });
      }
    }
  }

  for (const domain of ["D1", "D2", "D3", "D4", "D5"] as DomainId[]) {
    addEdge(graph, domainNode.get(domain)!, sink, domainRemaining[domain]);
  }

  const expectedFlow = Object.values(typeTargets).reduce((sum, value) => sum + value, 0);
  const actualFlow = maxFlow(graph, source, sink);
  if (actualFlow !== expectedFlow) {
    return null;
  }

  const plan: Record<NonCaseQuestionType, Record<DomainId, number>> = {
    "multiple-choice": createDomainCounter(),
    "multi-select": createDomainCounter(),
    "yes-no": createDomainCounter(),
    "drag-drop": createDomainCounter(),
    "hot-area": createDomainCounter(),
  };

  for (const type of NON_CASE_TYPES) {
    for (const domain of ["D1", "D2", "D3", "D4", "D5"] as DomainId[]) {
      const key = `${type}|${domain}`;
      const flowEdge = flowEdgeMap.get(key);
      if (!flowEdge) {
        plan[type][domain] = 0;
        continue;
      }

      plan[type][domain] = flowEdge.cap - flowEdge.edge.cap;
    }
  }

  return plan;
};

const pickQuestionsByPlan = (
  buckets: Record<NonCaseQuestionType, Record<DomainId, Question[]>>,
  plan: Record<NonCaseQuestionType, Record<DomainId, number>>,
): Question[] => {
  const selected: Question[] = [];

  for (const type of NON_CASE_TYPES) {
    for (const domain of ["D1", "D2", "D3", "D4", "D5"] as DomainId[]) {
      const count = plan[type][domain];
      if (count <= 0) {
        continue;
      }

      const candidates = shuffle(buckets[type][domain]);
      selected.push(...candidates.slice(0, count));
    }
  }

  return selected;
};

const getCaseQuestions = (
  caseStudy: CaseStudy,
  questionsById: Map<string, Question>,
  unavailableIds: Set<string>,
): Question[] | null => {
  const questions: Question[] = [];

  for (const questionId of caseStudy.questionIds) {
    const question = questionsById.get(questionId);
    if (!question || question.type !== "case-study") {
      return null;
    }

    if (unavailableIds.has(question.id)) {
      return null;
    }

    questions.push(question);
  }

  if (questions.length !== CASE_STUDY_QUESTION_COUNT) {
    return null;
  }

  return questions;
};

const chooseInsertionIndex = (nonCaseLength: number): number => {
  if (nonCaseLength < 20) {
    return Math.floor(nonCaseLength / 2);
  }

  const min = 8;
  const max = nonCaseLength - 8;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const validateOutputQuotas = (questions: Question[]): boolean => {
  if (questions.length !== EXAM_TOTAL_QUESTIONS) {
    return false;
  }

  const domainCounter = createDomainCounter();
  const typeCounter: Record<QuestionType, number> = {
    "multiple-choice": 0,
    "multi-select": 0,
    "yes-no": 0,
    "case-study": 0,
    "drag-drop": 0,
    "hot-area": 0,
  };

  for (const question of questions) {
    domainCounter[question.domain] += 1;
    typeCounter[question.type] += 1;
  }

  const domainsValid =
    domainCounter.D1 === DOMAIN_QUOTAS.D1 &&
    domainCounter.D2 === DOMAIN_QUOTAS.D2 &&
    domainCounter.D3 === DOMAIN_QUOTAS.D3 &&
    domainCounter.D4 === DOMAIN_QUOTAS.D4 &&
    domainCounter.D5 === DOMAIN_QUOTAS.D5;

  const typesValid =
    typeCounter["multiple-choice"] === QUESTION_TYPE_QUOTAS["multiple-choice"] &&
    typeCounter["multi-select"] === QUESTION_TYPE_QUOTAS["multi-select"] &&
    typeCounter["yes-no"] === QUESTION_TYPE_QUOTAS["yes-no"] &&
    typeCounter["case-study"] === QUESTION_TYPE_QUOTAS["case-study"] &&
    typeCounter["drag-drop"] === QUESTION_TYPE_QUOTAS["drag-drop"] &&
    typeCounter["hot-area"] === QUESTION_TYPE_QUOTAS["hot-area"];

  return domainsValid && typesValid;
};

const checkDifficultyBalance = (questions: Question[]): string | null => {
  const counter: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  for (const question of questions) {
    counter[question.difficulty] += 1;
  }

  const delta =
    Math.abs(counter.easy - DIFFICULTY_TARGETS.easy) +
    Math.abs(counter.medium - DIFFICULTY_TARGETS.medium) +
    Math.abs(counter.hard - DIFFICULTY_TARGETS.hard);

  if (delta <= 8) {
    return null;
  }

  return "Generated run difficulty profile is outside the target ratio. Consider adding more balanced questions in the bank.";
};

export const generateExamRun = ({ bank, previousRuns }: GenerateExamParams): GenerateExamResult => {
  const warnings: string[] = [];
  const bankValidation = validateQuestionBank(bank);

  if (!bankValidation.isValid) {
    return {
      run: null,
      warnings,
      error: "Question bank has validation errors. Open Question Bank tab and fix issues.",
    };
  }

  const usedQuestionIds = buildUsedQuestionSet(previousRuns);
  const activeQuestions = getActiveQuestions(bank);
  const availableQuestions = activeQuestions.filter((question) => !usedQuestionIds.has(question.id));

  if (availableQuestions.length < EXAM_TOTAL_QUESTIONS) {
    return {
      run: null,
      warnings,
      error:
        "Not enough unseen active questions to generate a full 53-question run without repetition.",
    };
  }

  const questionsById = new Map(activeQuestions.map((question) => [question.id, question]));
  const unavailableIds = new Set(usedQuestionIds);
  const shuffledCaseStudies = shuffle(bank.caseStudies);

  for (const caseStudy of shuffledCaseStudies) {
    const caseQuestions = getCaseQuestions(caseStudy, questionsById, unavailableIds);
    if (!caseQuestions) {
      continue;
    }

    const remainingResult = subtractDomainCounts(caseQuestions);
    if (!remainingResult.valid) {
      continue;
    }

    const remainingTypeTargets: TypeCounter = {
      "multiple-choice": QUESTION_TYPE_QUOTAS["multiple-choice"],
      "multi-select": QUESTION_TYPE_QUOTAS["multi-select"],
      "yes-no": QUESTION_TYPE_QUOTAS["yes-no"],
      "drag-drop": QUESTION_TYPE_QUOTAS["drag-drop"],
      "hot-area": QUESTION_TYPE_QUOTAS["hot-area"],
    };

    const caseQuestionSet = new Set(caseQuestions.map((question) => question.id));
    const nonCasePool = availableQuestions.filter(
      (question) => question.type !== "case-study" && !caseQuestionSet.has(question.id),
    );

    const buckets = buildAvailability(nonCasePool);
    const plan = computeTypeFlow(buckets, remainingResult.remaining, remainingTypeTargets);

    if (!plan) {
      continue;
    }

    const selectedNonCase = pickQuestionsByPlan(buckets, plan);
    if (selectedNonCase.length + caseQuestions.length !== EXAM_TOTAL_QUESTIONS) {
      continue;
    }

    const nonCaseShuffled = shuffle(selectedNonCase);
    const insertionIndex = chooseInsertionIndex(nonCaseShuffled.length);
    const questions = [
      ...nonCaseShuffled.slice(0, insertionIndex),
      ...caseQuestions,
      ...nonCaseShuffled.slice(insertionIndex),
    ];

    if (!validateOutputQuotas(questions)) {
      continue;
    }

    const difficultyWarning = checkDifficultyBalance(questions);
    if (difficultyWarning) {
      warnings.push(difficultyWarning);
    }

    return {
      run: {
        runNumber: previousRuns.length + 1,
        generatedAt: new Date().toISOString(),
        questions,
        selectedCaseStudy: caseStudy,
      },
      warnings,
    };
  }

  return {
    run: null,
    warnings,
    error:
      "No feasible run found with current question bank constraints. Add more active questions across domains and types.",
  };
};

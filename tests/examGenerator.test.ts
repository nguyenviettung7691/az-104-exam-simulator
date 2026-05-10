import { describe, expect, it } from "vitest";
import {
  DOMAIN_QUOTAS,
  QUESTION_TYPE_QUOTAS,
} from "../src/config/examBlueprint";
import { generateExamRun } from "../src/services/examGenerator";
import type { CaseStudy, Question, QuestionBank } from "../src/types/exam";

const makeChoice = (
  id: string,
  domain: Question["domain"],
  type: "multiple-choice" | "hot-area" | "case-study",
): Question => ({
  id,
  domain,
  type,
  difficulty: "medium",
  company: "Contoso",
  scenario: "A regulated business needs to deploy Azure resources with strict controls.",
  stem: "Which option meets all technical constraints?",
  subtopic: `${domain}-${type}`,
  referenceTopic: "Microsoft Learn reference",
  explanation: "The correct option satisfies security, cost, and operational constraints.",
  options: [
    { id: "A", text: "Option A", rationale: "Does not satisfy all requirements." },
    { id: "B", text: "Option B", rationale: "Partial fit but violates one constraint." },
    { id: "C", text: "Option C", rationale: "Introduces unnecessary overhead." },
    { id: "D", text: "Option D", rationale: "Uses unsupported configuration." },
  ],
  correctOptionId: "A",
  active: true,
});

const makeMulti = (id: string, domain: Question["domain"]): Question => ({
  id,
  domain,
  type: "multi-select",
  difficulty: "medium",
  company: "Litware",
  scenario: "The operations team must choose two controls.",
  stem: "Which actions should you include?",
  subtopic: `${domain}-multi-select`,
  referenceTopic: "Microsoft Learn reference",
  explanation: "Both selected actions are required for least-privilege implementation.",
  options: [
    { id: "A", text: "Option A" },
    { id: "B", text: "Option B" },
    { id: "C", text: "Option C" },
    { id: "D", text: "Option D" },
  ],
  selectCount: 2,
  correctOptionIds: ["A", "C"],
  active: true,
});

const makeYesNo = (id: string, domain: Question["domain"]): Question => ({
  id,
  domain,
  type: "yes-no",
  difficulty: "easy",
  company: "Fabrikam",
  scenario: "Review each statement against the target design.",
  stem: "For each statement, answer Yes or No.",
  subtopic: `${domain}-yes-no`,
  referenceTopic: "Microsoft Learn reference",
  explanation: "Each statement is evaluated independently against requirements.",
  statements: [
    { id: "S1", text: "Statement one", answer: "Yes" },
    { id: "S2", text: "Statement two", answer: "No" },
  ],
  active: true,
});

const makeDragDrop = (id: string, domain: Question["domain"]): Question => ({
  id,
  domain,
  type: "drag-drop",
  difficulty: "hard",
  company: "Northwind",
  scenario: "You must order the deployment steps correctly.",
  stem: "Place the steps in order.",
  subtopic: `${domain}-drag-drop`,
  referenceTopic: "Microsoft Learn reference",
  explanation: "The sequence follows dependency order.",
  availableItems: ["Create policy", "Assign role", "Deploy resource"],
  answerSlots: ["Step 1", "Step 2", "Step 3"],
  correctOrder: ["Create policy", "Assign role", "Deploy resource"],
  active: true,
});

const makeBank = (): QuestionBank => {
  const questions: Question[] = [];
  const domains: Question["domain"][] = ["D1", "D2", "D3", "D4", "D5"];

  let counter = 1;
  for (const domain of domains) {
    for (let index = 0; index < 10; index += 1) {
      questions.push(makeChoice(`mc-${counter++}`, domain, "multiple-choice"));
    }

    for (let index = 0; index < 4; index += 1) {
      questions.push(makeMulti(`ms-${counter++}`, domain));
    }

    for (let index = 0; index < 3; index += 1) {
      questions.push(makeYesNo(`yn-${counter++}`, domain));
    }

    for (let index = 0; index < 2; index += 1) {
      questions.push(makeDragDrop(`dd-${counter++}`, domain));
    }

    questions.push(makeChoice(`ha-${counter++}`, domain, "hot-area"));
  }

  const caseQuestionIds = [
    "case-1",
    "case-2",
    "case-3",
    "case-4",
    "case-5",
  ];

  const caseDomains: Question["domain"][] = ["D1", "D2", "D3", "D4", "D5"];
  caseDomains.forEach((domain, index) => {
    questions.push({
      ...makeChoice(caseQuestionIds[index], domain, "case-study"),
      caseStudyId: "case-study-1",
    });
  });

  const caseStudy: CaseStudy = {
    id: "case-study-1",
    companyName: "Contoso",
    title: "Case Study 1",
    overview: "Contoso is modernizing its Azure platform.",
    currentEnvironment: ["Single subscription", "Hub-spoke network"],
    plannedChanges: ["Introduce regional resiliency", "Harden RBAC model"],
    requirements: [
      "Must meet least-privilege standards",
      "Must survive regional outages",
      "Must keep operational overhead low",
      "Must support two regions",
      "Must retain auditability",
    ],
    questionIds: caseQuestionIds,
  };

  return {
    version: "2026.04.17",
    updatedAt: new Date().toISOString(),
    questions,
    caseStudies: [caseStudy],
  };
};

describe("generateExamRun", () => {
  it("builds a 53-question run with exact domain and type quotas", () => {
    const bank = makeBank();
    const result = generateExamRun({ bank, previousRuns: [] });

    expect(result.error).toBeUndefined();
    expect(result.run).not.toBeNull();

    const questions = result.run?.questions ?? [];
    expect(questions).toHaveLength(53);

    const domainCounts = {
      D1: 0,
      D2: 0,
      D3: 0,
      D4: 0,
      D5: 0,
    };

    const typeCounts = {
      "multiple-choice": 0,
      "multi-select": 0,
      "yes-no": 0,
      "case-study": 0,
      "drag-drop": 0,
      "hot-area": 0,
    };

    for (const question of questions) {
      domainCounts[question.domain] += 1;
      typeCounts[question.type] += 1;
    }

    expect(domainCounts).toEqual(DOMAIN_QUOTAS);
    expect(typeCounts).toEqual(QUESTION_TYPE_QUOTAS);

    const caseIndexes = questions
      .map((question, index) => ({ question, index }))
      .filter((entry) => entry.question.type === "case-study")
      .map((entry) => entry.index);

    expect(caseIndexes).toHaveLength(5);
    expect(caseIndexes[4] - caseIndexes[0]).toBe(4);
  });
});

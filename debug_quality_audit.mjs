import { createBundledQuestionBank } from "./src/data/initialQuestions.ts";
import { initialQuestions } from "./src/data/initialQuestions.ts";
import { additionalQuestions } from "./src/data/additionalQuestions.ts";
import { finalPrepQuestions } from "./src/data/finalPrepQuestions.ts";
import { april2026ExpansionQuestions } from "./src/data/april2026ExpansionQuestions.ts";
import { mayExpansionQuestions } from "./src/data/mayExpansionQuestions.ts";

const bank = createBundledQuestionBank();

const thresholds = {
  easy: {
    minScenarioChars: 110,
    minStemChars: 28,
    minConstraintTokens: 1,
  },
  medium: {
    minScenarioChars: 150,
    minStemChars: 30,
    minConstraintTokens: 2,
  },
  hard: {
    minScenarioChars: 190,
    minStemChars: 32,
    minConstraintTokens: 3,
  },
};

const constraintTokenRegex = /must|without|while|only|minimum|minimize|least|cannot|required|ensure|prevent|unless/gi;

const tradeoffRegex = /while|without|minimize|least|at the same time|trade-?off|however|but/i;

const answerKeyCounts = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  other: 0,
};

const bySource = {
  initialQuestions: {
    total: 0,
    difficulty: { easy: 0, medium: 0, hard: 0 },
    answerKeys: { A: 0, B: 0, C: 0, D: 0, other: 0 },
  },
  additionalQuestions: {
    total: 0,
    difficulty: { easy: 0, medium: 0, hard: 0 },
    answerKeys: { A: 0, B: 0, C: 0, D: 0, other: 0 },
  },
  finalPrepQuestions: {
    total: 0,
    difficulty: { easy: 0, medium: 0, hard: 0 },
    answerKeys: { A: 0, B: 0, C: 0, D: 0, other: 0 },
  },
  april2026ExpansionQuestions: {
    total: 0,
    difficulty: { easy: 0, medium: 0, hard: 0 },
    answerKeys: { A: 0, B: 0, C: 0, D: 0, other: 0 },
  },
  mayExpansionQuestions: {
    total: 0,
    difficulty: { easy: 0, medium: 0, hard: 0 },
    answerKeys: { A: 0, B: 0, C: 0, D: 0, other: 0 },
  },
  unknown: {
    total: 0,
    difficulty: { easy: 0, medium: 0, hard: 0 },
    answerKeys: { A: 0, B: 0, C: 0, D: 0, other: 0 },
  },
};

const findings = [];

const sourceByQuestionId = new Map();
initialQuestions.forEach((question) => sourceByQuestionId.set(question.id, "initialQuestions"));
additionalQuestions.forEach((question) => sourceByQuestionId.set(question.id, "additionalQuestions"));
finalPrepQuestions.forEach((question) => sourceByQuestionId.set(question.id, "finalPrepQuestions"));
april2026ExpansionQuestions.forEach((question) =>
  sourceByQuestionId.set(question.id, "april2026ExpansionQuestions"),
);
mayExpansionQuestions.forEach((question) => sourceByQuestionId.set(question.id, "mayExpansionQuestions"));

const getSourceBucket = (questionId) => {
  return sourceByQuestionId.get(questionId) ?? "unknown";
};

const normalizedStemMap = new Map();

const normalizeTextFingerprint = (value) => {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
};

const looksLikeMojibake = (value) => {
  return /\u00c3|\u00e2|\u00ef/.test(value);
};

const countConstraintTokens = (text) => {
  const matches = text.match(constraintTokenRegex);
  return matches ? matches.length : 0;
};

for (const question of bank.questions) {
  const combined = `${question.scenario} ${question.stem}`;
  const source = getSourceBucket(question.id);
  const sourceBucket = bySource[source] ?? bySource.unknown;

  sourceBucket.total += 1;

  if (!thresholds[question.difficulty]) {
    findings.push({
      severity: "high",
      id: question.id,
      reason: `Invalid difficulty label '${String(question.difficulty)}'.`,
    });
    continue;
  }

  sourceBucket.difficulty[question.difficulty] += 1;

  const difficultyRule = thresholds[question.difficulty];

  if (question.type === "multiple-choice" || question.type === "hot-area" || question.type === "case-study") {
    if (question.correctOptionId in answerKeyCounts) {
      answerKeyCounts[question.correctOptionId] += 1;
      sourceBucket.answerKeys[question.correctOptionId] += 1;
    } else {
      answerKeyCounts.other += 1;
      sourceBucket.answerKeys.other += 1;
    }
  }

  const fingerprint = normalizeTextFingerprint(`${question.scenario} ${question.stem}`);
  const duplicateGroup = normalizedStemMap.get(fingerprint) ?? [];
  duplicateGroup.push(question.id);
  normalizedStemMap.set(fingerprint, duplicateGroup);

  const textFragments = [
    question.scenario,
    question.stem,
    question.subtopic,
    question.referenceTopic,
    question.explanation,
  ];

  if (
    question.type === "multiple-choice" ||
    question.type === "hot-area" ||
    question.type === "case-study" ||
    question.type === "multi-select"
  ) {
    question.options.forEach((option) => {
      textFragments.push(option.text);
      textFragments.push(option.rationale ?? "");
    });
  }

  if (question.type === "yes-no") {
    question.statements.forEach((statement) => {
      textFragments.push(statement.text);
    });
  }

  if (question.type === "drag-drop") {
    textFragments.push(...question.availableItems);
    textFragments.push(...question.answerSlots);
    textFragments.push(...question.correctOrder);
  }

  if (textFragments.some((value) => looksLikeMojibake(value))) {
    findings.push({
      severity: "high",
      id: question.id,
      reason: "Potential text encoding corruption (mojibake) detected.",
    });
  }

  if (!question.subtopic?.trim()) {
    findings.push({
      severity: "high",
      id: question.id,
      reason: "Missing subtopic metadata.",
    });
  }

  if (question.scenario.trim().length < difficultyRule.minScenarioChars) {
    findings.push({
      severity: "medium",
      id: question.id,
      reason: `Scenario too short for ${question.difficulty} threshold (${question.scenario.trim().length} < ${difficultyRule.minScenarioChars}).`,
    });
  }

  if (question.stem.trim().length < difficultyRule.minStemChars) {
    findings.push({
      severity: "medium",
      id: question.id,
      reason: `Stem too short for ${question.difficulty} threshold (${question.stem.trim().length} < ${difficultyRule.minStemChars}).`,
    });
  }

  const constraints = countConstraintTokens(combined);
  if (constraints < difficultyRule.minConstraintTokens) {
    findings.push({
      severity: "medium",
      id: question.id,
      reason: `Insufficient constraint language for ${question.difficulty} (${constraints} < ${difficultyRule.minConstraintTokens}).`,
    });
  }

  if (question.difficulty === "hard" && !tradeoffRegex.test(combined)) {
    findings.push({
      severity: "medium",
      id: question.id,
      reason: "Hard question lacks clear trade-off phrasing.",
    });
  }

  if (question.type === "multiple-choice" || question.type === "hot-area" || question.type === "case-study") {
    if (question.options.length < 4) {
      findings.push({
        severity: "high",
        id: question.id,
        reason: "Choice-style question has fewer than 4 options.",
      });
    }

    const shortRationaleCount = question.options.filter((option) => (option.rationale ?? "").trim().length < 20).length;
    if (shortRationaleCount > 1) {
      findings.push({
        severity: "low",
        id: question.id,
        reason: "Multiple options have very short rationale text.",
      });
    }
  }

  if (question.type === "multi-select") {
    if (question.selectCount < 2 || question.selectCount > 3) {
      findings.push({
        severity: "high",
        id: question.id,
        reason: `Unexpected selectCount ${question.selectCount}; expected 2 or 3 for AZ-104 realism.`,
      });
    }
  }

  if (question.type === "yes-no") {
    if (question.statements.length < 2 || question.statements.length > 3) {
      findings.push({
        severity: "high",
        id: question.id,
        reason: `Yes/No statement count out of bounds (${question.statements.length}).`,
      });
    }
  }
}

for (const ids of normalizedStemMap.values()) {
  if (ids.length >= 3) {
    findings.push({
      severity: "medium",
      id: ids[0],
      reason: `Repeated question fingerprint detected across ${ids.length} questions (e.g., ${ids.slice(0, 5).join(", ")}).`,
    });
  }
}

const bySeverity = {
  high: findings.filter((item) => item.severity === "high"),
  medium: findings.filter((item) => item.severity === "medium"),
  low: findings.filter((item) => item.severity === "low"),
};

const printExamples = (severity, items) => {
  if (items.length === 0) {
    console.log(`- ${severity}: none`);
    return;
  }

  console.log(`- ${severity}: ${items.length}`);
  items.slice(0, 15).forEach((item) => {
    console.log(`  - ${item.id}: ${item.reason}`);
  });
};

console.log("AZ-104 Bundled Bank Quality Audit");
console.log("================================");
console.log(`Questions: ${bank.questions.length}`);
console.log(`Case studies: ${bank.caseStudies.length}`);
console.log("");

console.log("Difficulty mix:");
const difficultyCounts = bank.questions.reduce(
  (acc, question) => {
    acc[question.difficulty] += 1;
    return acc;
  },
  { easy: 0, medium: 0, hard: 0 },
);
console.log(`- easy: ${difficultyCounts.easy}`);
console.log(`- medium: ${difficultyCounts.medium}`);
console.log(`- hard: ${difficultyCounts.hard}`);
console.log("");

console.log("Answer key distribution (choice-style questions):");
console.log(`- A: ${answerKeyCounts.A}`);
console.log(`- B: ${answerKeyCounts.B}`);
console.log(`- C: ${answerKeyCounts.C}`);
console.log(`- D: ${answerKeyCounts.D}`);
console.log(`- other: ${answerKeyCounts.other}`);
console.log("");

console.log("By source:");
Object.entries(bySource).forEach(([source, stats]) => {
  if (stats.total === 0) {
    return;
  }

  console.log(`- ${source}: ${stats.total} questions`);
  console.log(
    `  difficulty => easy: ${stats.difficulty.easy}, medium: ${stats.difficulty.medium}, hard: ${stats.difficulty.hard}`,
  );
  console.log(
    `  answer keys => A: ${stats.answerKeys.A}, B: ${stats.answerKeys.B}, C: ${stats.answerKeys.C}, D: ${stats.answerKeys.D}, other: ${stats.answerKeys.other}`,
  );
});
console.log("");

console.log("Findings:");
printExamples("high", bySeverity.high);
printExamples("medium", bySeverity.medium);
printExamples("low", bySeverity.low);
console.log("");
console.log(`Total findings: ${findings.length}`);
console.log("Note: This script is heuristic and intended as a triage aid, not an absolute correctness gate.");

type DifficultyLevel = "easy" | "medium" | "hard";

type PromptQuestion = {
  scenario: string;
  stem: string;
  difficulty: DifficultyLevel;
  hint?: string;
};

const complexityTargets: Record<
  DifficultyLevel,
  { minScenarioChars: number; minStemChars: number; minConstraintTokens: number }
> = {
  easy: { minScenarioChars: 110, minStemChars: 28, minConstraintTokens: 1 },
  medium: { minScenarioChars: 150, minStemChars: 32, minConstraintTokens: 2 },
  hard: { minScenarioChars: 240, minStemChars: 48, minConstraintTokens: 4 },
};

const constraintTokenRegex =
  /must|without|while|only|minimum|minimize|least|cannot|required|ensure|prevent|unless|except|within|before|after|avoid|limit/gi;

const tradeoffRegex =
  /while|without|minimize|least|at the same time|trade-?off|however|but|versus|vs\.?|balance|conflict/i;

const countConstraintTokens = (text: string): number => {
  const matches = text.match(constraintTokenRegex);
  return matches ? matches.length : 0;
};

const hardScenarioClause =
  " The solution must preserve least privilege, avoid broad exclusions, stay within the approved change window, and avoid introducing a higher-operations fallback path.";

const hardStemClause =
  " Select the option that satisfies every constraint simultaneously and avoids partial fixes that violate governance or operational risk boundaries.";

const hardHintClause =
  " Validate each option against all constraints together and eliminate answers that only satisfy one requirement.";

export const ensurePromptComplexity = <T extends PromptQuestion>(question: T): T => {
  const target = complexityTargets[question.difficulty];
  let scenario = question.scenario.trim();
  let stem = question.stem.trim();
  let hint = question.hint?.trim();

  if (scenario.length < target.minScenarioChars) {
    scenario = `${scenario} The implementation must ensure required controls, prevent avoidable service impact, and meet minimum compliance expectations without broad policy exceptions.`;
  }

  if (countConstraintTokens(`${scenario} ${stem}`) < target.minConstraintTokens) {
    stem = `${stem} Choose the option that must ensure required controls, satisfy minimum risk tolerance, and prevent service impact while minimizing operational overhead without broad exceptions.`;
  }

  if (stem.length < target.minStemChars) {
    stem = `${stem} Consider governance, resiliency, and least-privilege boundaries before selecting an approach.`;
  }

  if (question.difficulty === "hard") {
    if (scenario.length < complexityTargets.hard.minScenarioChars + 40) {
      scenario = `${scenario}${hardScenarioClause}`;
    }

    if (!tradeoffRegex.test(`${scenario} ${stem}`)) {
      stem = `${stem}${hardStemClause}`;
    }

    if (hint && !/all constraints|partial/i.test(hint)) {
      hint = `${hint} ${hardHintClause}`;
    }
  }

  return {
    ...question,
    scenario,
    stem,
    ...(hint ? { hint } : {}),
  };
};

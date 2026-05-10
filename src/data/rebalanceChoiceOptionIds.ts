import type { ChoiceQuestion } from "../types/exam";

const OPTION_IDS = ["A", "B", "C", "D"] as const;

const toSeed = (value: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

/**
 * Re-labels A/B/C/D option IDs deterministically per question ID.
 * This preserves semantic correctness while preventing authored key concentration.
 */
export const rebalanceChoiceOptionIds = (
  question: Omit<ChoiceQuestion, "active">,
): Omit<ChoiceQuestion, "active"> => {
  if (question.options.length !== OPTION_IDS.length) {
    return question;
  }

  const optionIds = question.options.map((option) => option.id);
  if (!OPTION_IDS.every((id) => optionIds.includes(id))) {
    return question;
  }

  const shift = toSeed(`${question.id}|authored-choice-label`) % OPTION_IDS.length;
  if (shift === 0) {
    return question;
  }

  const remap = new Map<string, string>();
  OPTION_IDS.forEach((id, index) => {
    remap.set(id, OPTION_IDS[(index + shift) % OPTION_IDS.length]);
  });

  const options = question.options.map((option) => ({
    ...option,
    id: remap.get(option.id) ?? option.id,
  }));

  return {
    ...question,
    options,
    correctOptionId: remap.get(question.correctOptionId) ?? question.correctOptionId,
  };
};

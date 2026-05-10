import type { ChoiceQuestion, MultiSelectQuestion, Question, QuestionOption } from "../types/exam";

type QuestionWithOptions = ChoiceQuestion | MultiSelectQuestion;

const hasOptions = (question: Question): question is QuestionWithOptions => {
  return (
    question.type === "multiple-choice" ||
    question.type === "hot-area" ||
    question.type === "case-study" ||
    question.type === "multi-select"
  );
};

const toSeed = (value: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const seededRandom = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const sameOrder = (left: QuestionOption[], right: QuestionOption[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((option, index) => option.id === right[index]?.id);
};

const rotate = (items: QuestionOption[], shiftBy: number): QuestionOption[] => {
  if (items.length <= 1 || shiftBy % items.length === 0) {
    return items;
  }

  return items.map((_, index) => items[(index + shiftBy) % items.length]);
};

const shuffleOptions = (options: QuestionOption[], seedKey: string): QuestionOption[] => {
  if (options.length <= 1) {
    return options;
  }

  const random = seededRandom(toSeed(seedKey));
  const shuffled = [...options];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  if (!sameOrder(options, shuffled)) {
    return shuffled;
  }

  const shift = (toSeed(`${seedKey}|rotate`) % (shuffled.length - 1)) + 1;
  return rotate(shuffled, shift);
};

export const withShuffledOptions = (question: Question, seedKey: string): Question => {
  if (!hasOptions(question)) {
    return question;
  }

  return {
    ...question,
    options: shuffleOptions(question.options, seedKey),
  };
};

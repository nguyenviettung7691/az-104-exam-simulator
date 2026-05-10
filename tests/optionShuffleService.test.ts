import { describe, expect, it } from "vitest";
import type { Question } from "../src/types/exam";
import { withShuffledOptions } from "../src/services/optionShuffleService";

const baseChoiceQuestion: Question = {
  id: "Q-SHUFFLE-1",
  domain: "D1",
  type: "multiple-choice",
  difficulty: "medium",
  company: "Contoso",
  scenario: "A platform team is validating randomized option order behavior.",
  stem: "Which setting should they choose?",
  subtopic: "Shuffle behavior",
  referenceTopic: "Internal simulator logic",
  explanation: "The correct option remains mapped by ID.",
  options: [
    { id: "A", text: "First option" },
    { id: "B", text: "Second option" },
    { id: "C", text: "Third option" },
    { id: "D", text: "Fourth option" },
  ],
  correctOptionId: "C",
  active: true,
};

describe("withShuffledOptions", () => {
  it("returns deterministic order for the same seed", () => {
    const first = withShuffledOptions(baseChoiceQuestion, "run-1|Q-SHUFFLE-1");
    const second = withShuffledOptions(baseChoiceQuestion, "run-1|Q-SHUFFLE-1");

    expect(first.type).toBe("multiple-choice");
    expect(second.type).toBe("multiple-choice");

    if (first.type === "multiple-choice" && second.type === "multiple-choice") {
      expect(first.options.map((option) => option.id)).toEqual(
        second.options.map((option) => option.id),
      );
    }
  });

  it("changes option order when the seed changes", () => {
    const first = withShuffledOptions(baseChoiceQuestion, "run-1|Q-SHUFFLE-1");
    const second = withShuffledOptions(baseChoiceQuestion, "run-2|Q-SHUFFLE-1");

    expect(first.type).toBe("multiple-choice");
    expect(second.type).toBe("multiple-choice");

    if (first.type === "multiple-choice" && second.type === "multiple-choice") {
      expect(first.options.map((option) => option.id)).not.toEqual(
        second.options.map((option) => option.id),
      );
    }
  });

  it("preserves answer IDs and correctness mapping", () => {
    const shuffled = withShuffledOptions(baseChoiceQuestion, "run-9|Q-SHUFFLE-1");

    expect(shuffled.type).toBe("multiple-choice");
    if (shuffled.type === "multiple-choice") {
      const optionIds = shuffled.options.map((option) => option.id);
      expect(optionIds).toContain("C");
      expect(shuffled.correctOptionId).toBe("C");
    }
  });

  it("distributes the displayed correct option position across many seeds", () => {
    const counts = [0, 0, 0, 0];

    for (let index = 0; index < 120; index += 1) {
      const shuffled = withShuffledOptions(baseChoiceQuestion, `run-${index}|Q-SHUFFLE-1`);
      expect(shuffled.type).toBe("multiple-choice");

      if (shuffled.type === "multiple-choice") {
        const position = shuffled.options.findIndex((option) => option.id === shuffled.correctOptionId);
        expect(position).toBeGreaterThanOrEqual(0);
        counts[position] += 1;
      }
    }

    // For 120 runs and 4 options, expected count is 30 each. Keep a wide bound
    // so this test catches pathological skew without flaking on deterministic PRNG variance.
    counts.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(16);
      expect(value).toBeLessThanOrEqual(44);
    });
  });

  it("does not modify question types without options", () => {
    const yesNoQuestion: Question = {
      id: "Q-YN-1",
      domain: "D1",
      type: "yes-no",
      difficulty: "easy",
      company: "Contoso",
      scenario: "Check immutable behavior for non-option question types.",
      stem: "For each statement, answer Yes or No.",
      subtopic: "Shuffle behavior",
      referenceTopic: "Internal simulator logic",
      explanation: "No option list exists for this type.",
      statements: [
        { id: "S1", text: "Statement 1", answer: "Yes" },
        { id: "S2", text: "Statement 2", answer: "No" },
      ],
      active: true,
    };

    const shuffled = withShuffledOptions(yesNoQuestion, "run-1|Q-YN-1");
    expect(shuffled).toBe(yesNoQuestion);
  });
});

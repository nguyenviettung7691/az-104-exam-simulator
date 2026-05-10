import type {
  ChoiceQuestion,
  DragDropQuestion,
  MultiSelectQuestion,
  Question,
  UserAnswer,
  YesNoQuestion,
} from "../types/exam";
import type { QuestionEvaluation } from "../types/results";

const toSortedKey = (values: string[]): string => {
  return [...values].sort((left, right) => left.localeCompare(right)).join("|");
};

const asSkipped = (): UserAnswer => ({
  type: "skipped",
});

const evaluateChoice = (
  question: ChoiceQuestion,
  userAnswer: UserAnswer,
): Pick<
  QuestionEvaluation,
  "isCorrect" | "correctAnswerLabel" | "wrongOptionReasons" | "userAnswer"
> => {
  if (userAnswer.type !== "choice" || userAnswer.optionIds.length !== 1) {
    return {
      isCorrect: false,
      correctAnswerLabel: question.correctOptionId,
      wrongOptionReasons: ["Your answer format did not match a single-option response."],
      userAnswer: asSkipped(),
    };
  }

  const selectedId = userAnswer.optionIds[0];
  const isCorrect = selectedId === question.correctOptionId;

  const wrongOptionReasons = question.options
    .filter((option) => option.id !== question.correctOptionId)
    .map((option) => {
      if (option.rationale) {
        return `${option.id}) ${option.rationale}`;
      }

      return `${option.id}) This option does not satisfy all constraints in the scenario.`;
    });

  return {
    isCorrect,
    correctAnswerLabel: question.correctOptionId,
    wrongOptionReasons,
    userAnswer,
  };
};

const evaluateMultiSelect = (
  question: MultiSelectQuestion,
  userAnswer: UserAnswer,
): Pick<
  QuestionEvaluation,
  "isCorrect" | "correctAnswerLabel" | "wrongOptionReasons" | "userAnswer"
> => {
  if (userAnswer.type !== "choice") {
    return {
      isCorrect: false,
      correctAnswerLabel: question.correctOptionIds.join(", "),
      wrongOptionReasons: ["Your answer format did not match a multi-select response."],
      userAnswer: asSkipped(),
    };
  }

  const isCorrect =
    userAnswer.optionIds.length === question.correctOptionIds.length &&
    toSortedKey(userAnswer.optionIds) === toSortedKey(question.correctOptionIds);

  const wrongOptionReasons = question.options
    .filter((option) => !question.correctOptionIds.includes(option.id))
    .map((option) => {
      if (option.rationale) {
        return `${option.id}) ${option.rationale}`;
      }

      return `${option.id}) This option is a common trap but does not belong in the required set.`;
    });

  return {
    isCorrect,
    correctAnswerLabel: question.correctOptionIds.join(", "),
    wrongOptionReasons,
    userAnswer,
  };
};

const evaluateYesNo = (
  question: YesNoQuestion,
  userAnswer: UserAnswer,
): Pick<
  QuestionEvaluation,
  "isCorrect" | "correctAnswerLabel" | "wrongOptionReasons" | "userAnswer"
> => {
  if (userAnswer.type !== "yes-no") {
    return {
      isCorrect: false,
      correctAnswerLabel: question.statements
        .map((statement) => `${statement.id}: ${statement.answer}`)
        .join(" | "),
      wrongOptionReasons: ["Your answer format did not match a Yes/No statement response."],
      userAnswer: asSkipped(),
    };
  }

  const mismatches: string[] = [];

  for (const statement of question.statements) {
    const selected = userAnswer.values[statement.id];
    if (!selected || selected !== statement.answer) {
      mismatches.push(
        `${statement.id}) Expected ${statement.answer} based on scenario constraints.`,
      );
    }
  }

  return {
    isCorrect: mismatches.length === 0,
    correctAnswerLabel: question.statements
      .map((statement) => `${statement.id}: ${statement.answer}`)
      .join(" | "),
    wrongOptionReasons:
      mismatches.length > 0
        ? mismatches
        : ["All statements were evaluated correctly."],
    userAnswer,
  };
};

const evaluateDragDrop = (
  question: DragDropQuestion,
  userAnswer: UserAnswer,
): Pick<
  QuestionEvaluation,
  "isCorrect" | "correctAnswerLabel" | "wrongOptionReasons" | "userAnswer"
> => {
  if (userAnswer.type !== "drag-drop") {
    return {
      isCorrect: false,
      correctAnswerLabel: question.correctOrder.join(" -> "),
      wrongOptionReasons: ["Your answer format did not match an ordered response."],
      userAnswer: asSkipped(),
    };
  }

  const isCorrect =
    userAnswer.orderedItems.length === question.correctOrder.length &&
    userAnswer.orderedItems.every((value, index) => value === question.correctOrder[index]);

  return {
    isCorrect,
    correctAnswerLabel: question.correctOrder.join(" -> "),
    wrongOptionReasons: [
      `Correct order: ${question.correctOrder.join(" -> ")}. Azure operations here must happen in sequence.`,
    ],
    userAnswer,
  };
};

export const buildHintText = (question: Question): string => {
  if (question.hint?.trim()) {
    return question.hint;
  }

  switch (question.type) {
    case "multiple-choice":
    case "hot-area":
    case "case-study":
      return "Focus on the phrase least administrative effort or strict compliance; eliminate options that violate either.";
    case "multi-select":
      return "Count the exact number of required selections first, then remove options that overlap but do not satisfy minimum privilege.";
    case "yes-no":
      return "Evaluate each statement independently against the hard technical requirements in the scenario.";
    case "drag-drop":
      return "Think about dependency order: identity and networking prerequisites usually come before workloads.";
    default:
      return "Use the scenario constraints to eliminate conflicting options.";
  }
};

export const evaluateQuestion = (
  question: Question,
  userAnswer?: UserAnswer,
): QuestionEvaluation => {
  const safeAnswer = userAnswer ?? asSkipped();

  let evaluation: Pick<
    QuestionEvaluation,
    "isCorrect" | "correctAnswerLabel" | "wrongOptionReasons" | "userAnswer"
  >;

  switch (question.type) {
    case "multiple-choice":
    case "hot-area":
    case "case-study":
      evaluation = evaluateChoice(question, safeAnswer);
      break;
    case "multi-select":
      evaluation = evaluateMultiSelect(question, safeAnswer);
      break;
    case "yes-no":
      evaluation = evaluateYesNo(question, safeAnswer);
      break;
    case "drag-drop":
      evaluation = evaluateDragDrop(question, safeAnswer);
      break;
    default:
      evaluation = {
        isCorrect: false,
        correctAnswerLabel: "N/A",
        wrongOptionReasons: ["Unsupported question format."],
        userAnswer: asSkipped(),
      };
  }

  return {
    questionId: question.id,
    isCorrect: evaluation.isCorrect,
    correctAnswerLabel: evaluation.correctAnswerLabel,
    explanation: question.explanation,
    wrongOptionReasons: evaluation.wrongOptionReasons,
    referenceTopic: question.referenceTopic,
    userAnswer: evaluation.userAnswer,
    difficulty: question.difficulty,
    domain: question.domain,
    type: question.type,
    subtopic: question.subtopic,
  };
};

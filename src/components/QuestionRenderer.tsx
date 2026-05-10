import type {
  ChoiceQuestion,
  DragDropQuestion,
  MultiSelectQuestion,
  Question,
  UserAnswer,
  YesNoQuestion,
} from "../types/exam";

interface QuestionRendererProps {
  question: Question;
  value?: UserAnswer;
  onChange: (value: UserAnswer) => void;
  disabled?: boolean;
}

const renderChoice = (
  question: ChoiceQuestion,
  value: UserAnswer | undefined,
  onChange: (value: UserAnswer) => void,
  disabled: boolean,
) => {
  const selectedId = value?.type === "choice" ? value.optionIds[0] : "";

  return (
    <div className="answer-options">
      {question.options.map((option) => (
        <label
          key={option.id}
          className={`option-row${selectedId === option.id ? " selected" : ""}${disabled ? " option-row-disabled" : ""}`}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.id}
            checked={selectedId === option.id}
            onChange={() => onChange({ type: "choice", optionIds: [option.id] })}
            disabled={disabled}
          />
          <span>
            {option.id}) {option.text}
          </span>
        </label>
      ))}
    </div>
  );
};

const renderMultiSelect = (
  question: MultiSelectQuestion,
  value: UserAnswer | undefined,
  onChange: (value: UserAnswer) => void,
  disabled: boolean,
) => {
  const selectedIds = value?.type === "choice" ? value.optionIds : [];

  const toggle = (optionId: string): void => {
    if (disabled) {
      return;
    }

    const exists = selectedIds.includes(optionId);
    const next = exists
      ? selectedIds.filter((item) => item !== optionId)
      : [...selectedIds, optionId];

    onChange({ type: "choice", optionIds: next });
  };

  const isComplete = selectedIds.length === question.selectCount;

  return (
    <div className="answer-options">
      <p className="select-note">
        Select {question.selectCount} answers.
        <span className={`multiselect-badge${isComplete ? " badge-complete" : ""}`}>
          {selectedIds.length} / {question.selectCount} selected
        </span>
      </p>
      {question.options.map((option) => (
        <label
          key={option.id}
          className={`option-row${selectedIds.includes(option.id) ? " selected" : ""}${disabled ? " option-row-disabled" : ""}`}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(option.id)}
            onChange={() => toggle(option.id)}
            disabled={disabled}
          />
          <span>
            {option.id}) {option.text}
          </span>
        </label>
      ))}
    </div>
  );
};

const renderYesNo = (
  question: YesNoQuestion,
  value: UserAnswer | undefined,
  onChange: (value: UserAnswer) => void,
  disabled: boolean,
) => {
  const values = value?.type === "yes-no" ? value.values : {};

  const setStatement = (statementId: string, answer: "Yes" | "No"): void => {
    if (disabled) {
      return;
    }

    onChange({
      type: "yes-no",
      values: {
        ...values,
        [statementId]: answer,
      },
    });
  };

  return (
    <div className="yes-no-grid">
      {question.statements.map((statement) => (
        <div key={statement.id} className="yes-no-row">
          <p className="statement-label">
            {statement.id}) {statement.text}
          </p>
          <div className="yes-no-options">
            <label>
              <input
                type="radio"
                name={`${question.id}-${statement.id}`}
                checked={values[statement.id] === "Yes"}
                onChange={() => setStatement(statement.id, "Yes")}
                disabled={disabled}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`${question.id}-${statement.id}`}
                checked={values[statement.id] === "No"}
                onChange={() => setStatement(statement.id, "No")}
                disabled={disabled}
              />
              No
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

const renderDragDrop = (
  question: DragDropQuestion,
  value: UserAnswer | undefined,
  onChange: (value: UserAnswer) => void,
  disabled: boolean,
) => {
  const ordered =
    value?.type === "drag-drop"
      ? value.orderedItems
      : question.answerSlots.map(() => "");

  const setSlot = (slotIndex: number, nextValue: string): void => {
    if (disabled) {
      return;
    }

    const next = [...ordered];
    next[slotIndex] = nextValue;
    onChange({ type: "drag-drop", orderedItems: next });
  };

  return (
    <div className="drag-drop-editor">
      <div className="available-items">
        <strong>Available Items</strong>
        <ul>
          {question.availableItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="answer-slots">
        <strong>Answer Slots</strong>
        {question.answerSlots.map((slot, index) => (
          <label key={slot} className="slot-row">
            <span>{slot}</span>
            <select
              value={ordered[index] ?? ""}
              onChange={(event) => setSlot(index, event.target.value)}
              disabled={disabled}
            >
              <option value="">Select item</option>
              {question.availableItems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
};

const isComplete = (question: Question, value: UserAnswer | undefined): boolean => {
  if (!value) {
    return false;
  }

  switch (question.type) {
    case "multiple-choice":
    case "hot-area":
    case "case-study":
      return value.type === "choice" && value.optionIds.length === 1;
    case "multi-select":
      return value.type === "choice" && value.optionIds.length > 0;
    case "yes-no": {
      if (value.type !== "yes-no") {
        return false;
      }

      return question.statements.every((statement) => value.values[statement.id]);
    }
    case "drag-drop":
      return (
        value.type === "drag-drop" &&
        value.orderedItems.length === question.answerSlots.length &&
        value.orderedItems.every((item) => item)
      );
    default:
      return false;
  }
};

export const QuestionRenderer = ({
  question,
  value,
  onChange,
  disabled = false,
}: QuestionRendererProps) => {
  return (
    <div className="question-renderer">
      <div className="scenario-box">
        <p className="scenario-company">{question.company}</p>
        <p>{question.scenario}</p>
      </div>
      <p className="question-stem">{question.stem}</p>

      {question.type === "multiple-choice" ||
      question.type === "hot-area" ||
      question.type === "case-study"
        ? renderChoice(question, value, onChange, disabled)
        : null}

      {question.type === "multi-select"
        ? renderMultiSelect(question, value, onChange, disabled)
        : null}

      {question.type === "yes-no" ? renderYesNo(question, value, onChange, disabled) : null}

      {question.type === "drag-drop"
        ? renderDragDrop(question, value, onChange, disabled)
        : null}

      {!disabled ? (
        <p className="completion-indicator">
          {isComplete(question, value) ? "Ready to submit" : "Provide an answer to continue"}
        </p>
      ) : null}
    </div>
  );
};

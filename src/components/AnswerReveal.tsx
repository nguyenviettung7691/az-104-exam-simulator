import type { QuestionEvaluation } from "../types/results";

interface AnswerRevealProps {
  evaluation: QuestionEvaluation;
}

export const AnswerReveal = ({ evaluation }: AnswerRevealProps) => {
  return (
    <section className="answer-reveal" aria-live="polite">
      <div className={`reveal-verdict ${evaluation.isCorrect ? "verdict-correct" : "verdict-incorrect"}`}>
        {evaluation.isCorrect ? "✓ Correct" : "✗ Incorrect"}
      </div>

      <p className="reveal-line">
        <strong>Correct Answer:</strong> {evaluation.correctAnswerLabel}
      </p>
      <p className="reveal-line">
        <strong>Explanation:</strong> {evaluation.explanation}
      </p>

      {evaluation.wrongOptionReasons.length > 0 ? (
        <details className="reveal-details">
          <summary>Why other options are wrong</summary>
          <ul>
            {evaluation.wrongOptionReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="reveal-line reveal-reference-line">
        <strong>Reference:</strong> {evaluation.referenceTopic}
      </p>
    </section>
  );
};

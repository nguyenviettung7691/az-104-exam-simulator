import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DOMAIN_DEFINITIONS,
  type GeneratedRun,
  type PresentationMode,
  type Question,
  type QuestionBank,
  type UserAnswer,
} from "../types/exam";
import type { QuestionEvaluation, SimulationRunReport } from "../types/results";
import { EXAM_DURATION_MINUTES } from "../config/examBlueprint";
import { buildHintText, evaluateQuestion } from "../services/evaluationService";
import { generateExamRun } from "../services/examGenerator";
import { withShuffledOptions } from "../services/optionShuffleService";
import { buildSimulationRunReport } from "../services/scoringService";
import { AnswerReveal } from "./AnswerReveal";
import { CaseStudyPanel } from "./CaseStudyPanel";
import { QuestionRenderer } from "./QuestionRenderer";
import { ResultsReport } from "./ResultsReport";

interface SimulationRunnerProps {
  bank: QuestionBank;
  previousRuns: SimulationRunReport[];
  preferredMode: PresentationMode | null;
  onModeChange: (mode: PresentationMode) => void;
  onReportReady: (report: SimulationRunReport) => void;
  onRunActiveChange: (active: boolean) => void;
  onRequestNewRun: () => void;
}

interface ActiveSession {
  run: GeneratedRun;
  startedAt: string;
  currentIndex: number;
  batchStart: number;
  answers: Record<string, UserAnswer>;
  evaluations: Record<string, QuestionEvaluation>;
  hintsShown: Record<string, string>;
}

const typeLabel = (type: Question["type"]): string => {
  switch (type) {
    case "multiple-choice":
      return "Multiple Choice";
    case "multi-select":
      return "Multiple Response";
    case "yes-no":
      return "Yes/No";
    case "case-study":
      return "Case Study";
    case "drag-drop":
      return "Drag-and-Drop";
    case "hot-area":
      return "Hot Area";
    default:
      return type;
  }
};

const toDifficultyLabel = (difficulty: Question["difficulty"]): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

const createEmptySession = (run: GeneratedRun): ActiveSession => {
  return {
    run,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    batchStart: 0,
    answers: {},
    evaluations: {},
    hintsShown: {},
  };
};

const EXAM_DURATION_SECONDS = EXAM_DURATION_MINUTES * 60;
const MAX_PAUSE_SECONDS = 5 * 60;
const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};

const getCaseQuestionIndex = (run: GeneratedRun, questionId: string): number => {
  const index = run.selectedCaseStudy.questionIds.findIndex((id) => id === questionId);
  return index + 1;
};

const getPausedSummary = (
  questions: Question[],
  evaluations: Record<string, QuestionEvaluation>,
): string => {
  const answered = Object.keys(evaluations).length;
  const byDomain = new Map<string, { done: number; total: number }>();

  for (const question of questions) {
    const current = byDomain.get(question.domain) ?? { done: 0, total: 0 };
    current.total += 1;

    if (evaluations[question.id]) {
      current.done += 1;
    }

    byDomain.set(question.domain, current);
  }

  const domainSummary = [...byDomain.entries()]
    .map(([domain, value]) => `${domain}: ${value.done}/${value.total}`)
    .join(" · ");

  return `Answered ${answered}/53 · ${domainSummary}`;
};

const randomFrom = <T,>(items: T[]): T | null => {
  if (items.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? null;
};

const pickReplacementQuestion = (
  bank: QuestionBank,
  runQuestions: Question[],
  currentQuestion: Question,
): Question | null => {
  const existingIds = new Set(runQuestions.map((question) => question.id));
  existingIds.delete(currentQuestion.id);

  const activePool = bank.questions.filter(
    (question) => question.active !== false && !existingIds.has(question.id),
  );

  if (activePool.length === 0) {
    return null;
  }

  const sameTypeAndDomain = activePool.filter(
    (question) =>
      question.domain === currentQuestion.domain &&
      question.type === currentQuestion.type,
  );

  const sameDomain = activePool.filter(
    (question) => question.domain === currentQuestion.domain,
  );

  const sameType = activePool.filter(
    (question) => question.type === currentQuestion.type,
  );

  return (
    randomFrom(sameTypeAndDomain) ??
    randomFrom(sameDomain) ??
    randomFrom(sameType) ??
    randomFrom(activePool)
  );
};

export const SimulationRunner = ({
  bank,
  previousRuns,
  preferredMode,
  onModeChange,
  onReportReady,
  onRunActiveChange,
  onRequestNewRun,
}: SimulationRunnerProps) => {
  const [mode, setMode] = useState<PresentationMode | null>(preferredMode);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [error, setError] = useState<string>("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [paused, setPaused] = useState<boolean>(false);
  const [pausedSummary, setPausedSummary] = useState<string>("");
  const [singleRevealId, setSingleRevealId] = useState<string | null>(null);
  const [batchRevealIds, setBatchRevealIds] = useState<string[]>([]);
  const [latestReport, setLatestReport] = useState<SimulationRunReport | null>(null);
  const [pendingFinalQuestionId, setPendingFinalQuestionId] = useState<string | null>(null);
  const [pauseUsedSeconds, setPauseUsedSeconds] = useState<number>(0);
  const [pauseNow, setPauseNow] = useState<number>(() => Date.now());
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);
  const [runNotice, setRunNotice] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(EXAM_DURATION_SECONDS);
  const [isGeneratingRun, setIsGeneratingRun] = useState<boolean>(false);
  const timeLeftRef = useRef<number>(EXAM_DURATION_SECONDS);
  const examEndAtRef = useRef<number>(0);
  const pauseLimitTimeoutRef = useRef<number | null>(null);
  const lastReportedRunKeyRef = useRef<string>("");

  // Initialize examEndAtRef safely on mount
  useEffect(() => {
    examEndAtRef.current = Date.now() + EXAM_DURATION_SECONDS * 1000;
  }, []);

  const clearPauseLimitTimeout = useCallback((): void => {
    if (pauseLimitTimeoutRef.current !== null) {
      window.clearTimeout(pauseLimitTimeoutRef.current);
      pauseLimitTimeoutRef.current = null;
    }
  }, []);

  const startRun = (): void => {
    if (!mode) {
      setError("Choose how you want questions presented before starting a run.");
      return;
    }
    if (isGeneratingRun) {
      return;
    }
    setIsGeneratingRun(true);
    window.setTimeout(() => {
      const generated = generateExamRun({
        bank,
        previousRuns,
      });

      if (!generated.run) {
        setError(generated.error ?? "Unable to generate exam run.");
        setWarnings(generated.warnings);
        setIsGeneratingRun(false);
        return;
      }

      setError("");
      setWarnings(generated.warnings);
      setPaused(false);
      setPausedSummary("");
      setSingleRevealId(null);
      setBatchRevealIds([]);
      setLatestReport(null);
      setPendingFinalQuestionId(null);
      setPauseUsedSeconds(0);
      setPauseNow(Date.now());
      setPauseStartedAt(null);
      clearPauseLimitTimeout();
      setRunNotice("");
      setTimeLeft(EXAM_DURATION_SECONDS);
      timeLeftRef.current = EXAM_DURATION_SECONDS;
      examEndAtRef.current = Date.now() + EXAM_DURATION_SECONDS * 1000;
      setSession(createEmptySession(generated.run));
      setIsGeneratingRun(false);
      scrollToTop();
    }, 0);
  };

  const finalizeIfComplete = useCallback((nextSession: ActiveSession): ActiveSession => {
    if (Object.keys(nextSession.evaluations).length < nextSession.run.questions.length) {
      return nextSession;
    }

    const evaluations = nextSession.run.questions
      .map((question) => nextSession.evaluations[question.id])
      .filter((value): value is QuestionEvaluation => Boolean(value));

    const report = buildSimulationRunReport({
      runNumber: nextSession.run.runNumber,
      startedAt: nextSession.startedAt,
      completedAt: new Date().toISOString(),
      durationSeconds: Math.max(
        1,
        Math.round((Date.now() - new Date(nextSession.startedAt).getTime()) / 1000),
      ),
      questions: nextSession.run.questions,
      evaluations,
    });

    setLatestReport(report);
    setPendingFinalQuestionId(null);
    setPaused(false);
    setPausedSummary("");
    setPauseStartedAt(null);
    clearPauseLimitTimeout();
    return nextSession;
  }, [clearPauseLimitTimeout]);

  const forceFinalizeSession = useCallback((current: ActiveSession): ActiveSession => {
    const nextAnswers = { ...current.answers };
    const nextEvaluations = { ...current.evaluations };

    for (const question of current.run.questions) {
      if (!nextEvaluations[question.id]) {
        nextAnswers[question.id] = { type: "skipped" as const };
        nextEvaluations[question.id] = evaluateQuestion(question, { type: "skipped" });
      }
    }

    return finalizeIfComplete({ ...current, answers: nextAnswers, evaluations: nextEvaluations });
  }, [finalizeIfComplete]);

  const resetToRunStart = useCallback((): void => {
    clearPauseLimitTimeout();
    setSession(null);
    setPaused(false);
    setPausedSummary("");
    setSingleRevealId(null);
    setBatchRevealIds([]);
    setLatestReport(null);
    setPendingFinalQuestionId(null);
    setPauseUsedSeconds(0);
    setPauseNow(Date.now());
    setPauseStartedAt(null);
    setRunNotice("");
    setTimeLeft(EXAM_DURATION_SECONDS);
    timeLeftRef.current = EXAM_DURATION_SECONDS;
    examEndAtRef.current = Date.now() + EXAM_DURATION_SECONDS * 1000;
    onRequestNewRun();
    scrollToTop();
  }, [clearPauseLimitTimeout, onRequestNewRun]);

  const stopRun = (): void => {
    if (!session) {
      return;
    }

    const confirmed = window.confirm(
      "Stop this exam now?\n\nUnanswered questions will be marked as skipped and the current run will be finalized.",
    );

    if (!confirmed) {
      return;
    }

    setSession((current) => {
      if (!current) {
        return current;
      }

      return forceFinalizeSession(current);
    });
  };

  const finalizeFromFinalReveal = (): void => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      return finalizeIfComplete(current);
    });
    scrollToTop();
  };

  // Tick + time-up: use a ref to avoid stale closure; setSession called inside
  // the interval callback (async), not synchronously in the effect body.
  useEffect(() => {
    if (!session || latestReport) {
      return;
    }

    const tick = (): void => {
      if (paused) {
        return;
      }

      const next = Math.max(0, Math.ceil((examEndAtRef.current - Date.now()) / 1000));
      if (next === timeLeftRef.current) {
        return;
      }

      timeLeftRef.current = next;
      setTimeLeft(next);

      if (next === 0) {
        setSession((current) => {
          if (!current) {
            return current;
          }

          return forceFinalizeSession(current);
        });
      }
    };

    tick();
    const id = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(id);
  }, [session, paused, latestReport, forceFinalizeSession]);

  useEffect(() => {
    onRunActiveChange(Boolean(session) && !latestReport);
  }, [session, latestReport, onRunActiveChange]);

  useEffect(() => {
    if (!latestReport) {
      return;
    }

    const reportKey = `${latestReport.runNumber}|${latestReport.completedAt}`;
    if (lastReportedRunKeyRef.current === reportKey) {
      return;
    }

    lastReportedRunKeyRef.current = reportKey;
    onReportReady(latestReport);
    scrollToTop();
  }, [latestReport, onReportReady]);

  useEffect(() => {
    if (!paused || !pauseStartedAt) {
      return;
    }

    const id = window.setInterval(() => {
      setPauseNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [paused, pauseStartedAt]);

  useEffect(() => {
    return () => {
      clearPauseLimitTimeout();
    };
  }, [clearPauseLimitTimeout]);

  const updateAnswer = (questionId: string, answer: UserAnswer): void => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        answers: {
          ...current.answers,
          [questionId]: answer,
        },
      };
    });
  };

  const setHint = (question: Question): void => {
    setSession((current) => {
      if (!current || current.hintsShown[question.id]) {
        return current;
      }

      return {
        ...current,
        hintsShown: {
          ...current.hintsShown,
          [question.id]: buildHintText(question),
        },
      };
    });
  };

  const submitSingle = (): void => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const question = current.run.questions[current.currentIndex];
      const answer = current.answers[question.id];
      const evaluation = evaluateQuestion(question, answer);
      const isLastQuestion = current.currentIndex >= current.run.questions.length - 1;
      const next = {
        ...current,
        evaluations: {
          ...current.evaluations,
          [question.id]: evaluation,
        },
      };

      setSingleRevealId(question.id);
      if (isLastQuestion) {
        setPendingFinalQuestionId(question.id);
        return next;
      }

      setPendingFinalQuestionId(null);
      return finalizeIfComplete(next);
    });
  };

  const skipSingle = (): void => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const question = current.run.questions[current.currentIndex];
      const evaluation = evaluateQuestion(question, { type: "skipped" });
      const isLast = current.currentIndex >= current.run.questions.length - 1;
      const next = {
        ...current,
        answers: {
          ...current.answers,
          [question.id]: { type: "skipped" as const },
        },
        evaluations: {
          ...current.evaluations,
          [question.id]: evaluation,
        },
        currentIndex: isLast ? current.currentIndex : current.currentIndex + 1,
      };

      setSingleRevealId(null);
      setPendingFinalQuestionId(null);
      return finalizeIfComplete(next);
    });
  };

  const nextSingle = (): void => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const nextIndex = Math.min(current.currentIndex + 1, current.run.questions.length - 1);
      return {
        ...current,
        currentIndex: nextIndex,
      };
    });

    setSingleRevealId(null);
    setPendingFinalQuestionId(null);
    scrollToTop();
  };

  const submitBatch = (): void => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const currentBatch = current.run.questions.slice(current.batchStart, current.batchStart + 10);
      const batchEvaluationIds: string[] = [];
      const nextEvaluations = { ...current.evaluations };
      const nextAnswers = { ...current.answers };

      for (const question of currentBatch) {
        const answer = nextAnswers[question.id] ?? { type: "skipped" as const };
        const evaluation = evaluateQuestion(question, answer);
        nextAnswers[question.id] = answer;
        nextEvaluations[question.id] = evaluation;
        batchEvaluationIds.push(question.id);
      }

      setBatchRevealIds(batchEvaluationIds);

      const next = {
        ...current,
        answers: nextAnswers,
        evaluations: nextEvaluations,
      };

      setPendingFinalQuestionId(null);
      return finalizeIfComplete(next);
    });
  };

  const nextBatch = (): void => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        batchStart: Math.min(current.batchStart + 10, current.run.questions.length - 1),
      };
    });

    setBatchRevealIds([]);
    scrollToTop();
  };

  // Define resumeRun before pauseRun to avoid temporal dead zone
  const resumeRun = (autoTriggered = false): void => {
    const remainingBudget = Math.max(0, MAX_PAUSE_SECONDS - pauseUsedSeconds);
    const elapsed = pauseStartedAt
      ? Math.max(0, Math.floor((Date.now() - pauseStartedAt) / 1000))
      : 0;
    const consumed = Math.min(remainingBudget, elapsed);

    clearPauseLimitTimeout();
    setPauseStartedAt(null);

    if (consumed > 0) {
      setPauseUsedSeconds((value) => Math.min(MAX_PAUSE_SECONDS, value + consumed));
      examEndAtRef.current += consumed * 1000;
      const adjustedLeft = Math.max(0, Math.ceil((examEndAtRef.current - Date.now()) / 1000));
      timeLeftRef.current = adjustedLeft;
      setTimeLeft(adjustedLeft);
    }

    setPaused(false);
    setPausedSummary("");
    setPauseNow(Date.now());

    if (remainingBudget - consumed <= 0 || autoTriggered) {
      setRunNotice("Pause limit reached (5:00 total). Additional pauses are disabled.");
    }

    setSession((current) => {
      if (!current) {
        return current;
      }

      const replaceIndex =
        mode === "single"
          ? current.currentIndex
          : Math.min(current.batchStart, current.run.questions.length - 1);
      const currentQuestion = current.run.questions[replaceIndex];
      const replacement = pickReplacementQuestion(bank, current.run.questions, currentQuestion);

      if (!replacement) {
        setRunNotice(
          "Pause resumed, but no unused active replacement question was available. Continuing with the current question.",
        );
        return current;
      }

      const nextQuestions = [...current.run.questions];
      nextQuestions[replaceIndex] = replacement;

      const nextAnswers = { ...current.answers };
      const nextEvaluations = { ...current.evaluations };
      const nextHints = { ...current.hintsShown };
      delete nextAnswers[currentQuestion.id];
      delete nextEvaluations[currentQuestion.id];
      delete nextHints[currentQuestion.id];

      setSingleRevealId(null);
      setBatchRevealIds([]);
      setPendingFinalQuestionId(null);

      return {
        ...current,
        run: {
          ...current.run,
          questions: nextQuestions,
        },
        answers: nextAnswers,
        evaluations: nextEvaluations,
        hintsShown: nextHints,
      };
    });
  };

  const pauseRun = (): void => {
    if (!session) {
      return;
    }

    const remainingPauseBudget = Math.max(0, MAX_PAUSE_SECONDS - pauseUsedSeconds);
    if (remainingPauseBudget <= 0) {
      setRunNotice("Pause limit reached (5:00 total). Continue the exam or stop the run.");
      return;
    }

    setPaused(true);
    setPauseStartedAt(Date.now());
    clearPauseLimitTimeout();
    pauseLimitTimeoutRef.current = window.setTimeout(() => {
      resumeRun(true);
    }, remainingPauseBudget * 1000);
    setPausedSummary(getPausedSummary(session.run.questions, session.evaluations));
    setPauseNow(Date.now());
    setRunNotice("");
  };

  const onModeSelected = (nextMode: PresentationMode): void => {
    setMode(nextMode);
    onModeChange(nextMode);
  };

  const currentSingleQuestion = useMemo(() => {
    if (!session) {
      return null;
    }

    return session.run.questions[session.currentIndex] ?? null;
  }, [session]);

  const displayedSingleQuestion = useMemo(() => {
    if (!session || !currentSingleQuestion) {
      return null;
    }

    return withShuffledOptions(
      currentSingleQuestion,
      `${session.run.runNumber}|${currentSingleQuestion.id}`,
    );
  }, [session, currentSingleQuestion]);

  const currentBatch = useMemo(() => {
    if (!session || mode !== "batch") {
      return [];
    }

    return session.run.questions.slice(session.batchStart, session.batchStart + 10);
  }, [session, mode]);

  const displayedBatch = useMemo(() => {
    if (!session || mode !== "batch") {
      return [];
    }

    return currentBatch.map((question) =>
      withShuffledOptions(question, `${session.run.runNumber}|${question.id}`),
    );
  }, [session, mode, currentBatch]);

  const pauseInCurrentSession = useMemo(() => {
    return paused && pauseStartedAt
      ? Math.floor((pauseNow - pauseStartedAt) / 1000)
      : 0;
  }, [paused, pauseNow, pauseStartedAt]);

  const remainingPauseSeconds = useMemo(() => {
    return Math.max(
      0,
      MAX_PAUSE_SECONDS - pauseUsedSeconds - Math.max(0, pauseInCurrentSession),
    );
  }, [pauseUsedSeconds, pauseInCurrentSession]);

  const canPause = remainingPauseSeconds > 0;
  const completedCount = useMemo(() => {
    if (!session) {
      return 0;
    }

    return Object.keys(session.evaluations).length;
  }, [session]);
  const domainProgress = useMemo(() => {
    if (!session) {
      return [];
    }

    return (Object.entries(DOMAIN_DEFINITIONS) as [string, { shortTitle: string }][]).map(
      ([domain, info]) => {
        let total = 0;
        let done = 0;

        for (const question of session.run.questions) {
          if (question.domain !== domain) {
            continue;
          }

          total += 1;
          if (session.evaluations[question.id]) {
            done += 1;
          }
        }

        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return { domain, shortTitle: info.shortTitle, total, done, pct };
      },
    );
  }, [session]);

  if (latestReport) {
    return <ResultsReport report={latestReport} onNewRun={resetToRunStart} />;
  }

  return (
    <section className="simulation-panel">
      <header className="simulation-header">
        <h2>AZ-104 EXAM SIMULATION</h2>
        <p>53 Questions | ~120 Minutes | Pass: 700/1000</p>
      </header>

      {!session ? (
        <div className="start-box">
          <h3>Start a New Run</h3>
          <p>Run #{previousRuns.length + 1} will be generated from your active question pool.</p>

          <div className="mode-cards">
            <button
              type="button"
              className={`mode-card${mode === "single" ? " selected" : ""}`}
              onClick={() => onModeSelected("single")}
            >
              <div className="mode-card-title">One at a time</div>
              <div className="mode-card-desc">Answer each question individually before seeing the result.</div>
            </button>
            <button
              type="button"
              className={`mode-card${mode === "batch" ? " selected" : ""}`}
              onClick={() => onModeSelected("batch")}
            >
              <div className="mode-card-title">Batches of 10</div>
              <div className="mode-card-desc">Answer 10 questions at a time, then review all at once.</div>
            </button>
          </div>

          <button type="button" className="btn-generate" onClick={startRun} disabled={isGeneratingRun}>
            {isGeneratingRun ? "Generating..." : `Generate Run #${previousRuns.length + 1}`}
          </button>

          {error ? <p className="inline-error">{error}</p> : null}

          {warnings.length > 0 ? (
            <ul className="inline-warning">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {session ? (
        <div className="run-shell">
          <div className="run-sticky-header">
            <div className="run-topline">
              <p>Run #{session.run.runNumber}</p>
              <div className="exam-progress-wrap">
                <div className="exam-progress-bar">
                  <div
                    className="exam-progress-fill"
                    style={{
                      width: `${Math.round((completedCount / session.run.questions.length) * 100)}%`,
                    }}
                  />
                </div>
                <span className="run-progress-count">
                  {completedCount}/{session.run.questions.length}
                </span>
              </div>
              <p
                className={
                  "run-timer" +
                  (timeLeft === 0 ? " timer-expired" : timeLeft < 600 ? " timer-warning" : "")
                }
              >
                {formatTime(timeLeft)}
              </p>
              <p className="run-pause-budget">Pause left {formatTime(remainingPauseSeconds)}</p>
            </div>

            <div className="domain-mini-bars">
              {domainProgress.map((entry) => (
                <div key={entry.domain} className="domain-mini-bar">
                  <div className="domain-mini-bar-label">
                    <span>{entry.shortTitle}</span>
                    <span>{entry.done}/{entry.total}</span>
                  </div>
                  <div className="domain-mini-bar-track">
                    <div className="domain-mini-bar-fill" style={{ width: `${entry.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {paused ? (
            <div className="pause-box">
              <p>{pausedSummary}</p>
              <p className="pause-box-budget">Pause time remaining: {formatTime(remainingPauseSeconds)}</p>
              <button type="button" onClick={() => resumeRun()}>
                Resume Run
              </button>
              <button type="button" className="danger" onClick={stopRun}>
                Stop Exam
              </button>
            </div>
          ) : null}

          {runNotice ? <p className="inline-warning run-notice">{runNotice}</p> : null}

          {!paused && mode === "single" && currentSingleQuestion && displayedSingleQuestion ? (
            <article className="single-question">
              <div className="question-navigator" aria-label="Question navigation">
                <div className="q-dot-track">
                  {session.run.questions.map((q, idx) => {
                    const ev = session.evaluations[q.id];
                    const isCurrent = idx === session.currentIndex;
                    const dotClass = isCurrent
                      ? "dot-current"
                      : ev
                        ? ev.isCorrect
                          ? "dot-correct"
                          : ev.userAnswer.type === "skipped"
                            ? "dot-skipped"
                            : "dot-incorrect"
                        : "dot-unanswered";
                    return (
                      <button
                        key={q.id}
                        type="button"
                        className={`q-dot ${dotClass}`}
                        title={`Question ${idx + 1}`}
                        onClick={() => {
                          setSession((s) => s ? { ...s, currentIndex: idx } : s);
                          setSingleRevealId(session.evaluations[q.id] ? q.id : null);
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="q-nav-legend">
                  <span><span className="q-nav-legend-dot" style={{ background: "var(--azure)" }} />Current</span>
                  <span><span className="q-nav-legend-dot" style={{ background: "var(--teal)" }} />Correct</span>
                  <span><span className="q-nav-legend-dot" style={{ background: "var(--red)" }} />Incorrect</span>
                  <span><span className="q-nav-legend-dot" style={{ background: "var(--orange)" }} />Skipped</span>
                  <span><span className="q-nav-legend-dot" style={{ background: "rgba(0,120,212,0.2)" }} />Unanswered</span>
                </div>
              </div>

              <div className="question-meta-row">
                <span className="q-meta-pill">Q {session.currentIndex + 1} of {session.run.questions.length}</span>
                <span className="q-meta-pill pill-domain">Domain {currentSingleQuestion.domain}</span>
                <span className="q-meta-pill">{typeLabel(currentSingleQuestion.type)}</span>
                <span className={`q-meta-pill pill-${currentSingleQuestion.difficulty}`}>{toDifficultyLabel(currentSingleQuestion.difficulty)}</span>
              </div>

              {currentSingleQuestion.type === "case-study" ? (
                <CaseStudyPanel
                  caseStudy={session.run.selectedCaseStudy}
                  caseQuestionIndex={getCaseQuestionIndex(session.run, currentSingleQuestion.id)}
                />
              ) : null}

              <QuestionRenderer
                question={displayedSingleQuestion}
                value={session.answers[currentSingleQuestion.id]}
                onChange={(value) => updateAnswer(currentSingleQuestion.id, value)}
                disabled={Boolean(singleRevealId)}
              />

              {session.hintsShown[currentSingleQuestion.id] ? (
                <p className="hint-box">Hint: {session.hintsShown[currentSingleQuestion.id]}</p>
              ) : null}

              <div className="question-actions">
                {!singleRevealId ? (
                  <>
                    <button type="button" onClick={() => setHint(currentSingleQuestion)}>
                      Hint
                    </button>
                    <button type="button" onClick={skipSingle}>
                      Skip
                    </button>
                    <button type="button" onClick={pauseRun} disabled={!canPause}>
                      Pause
                    </button>
                    <button type="button" className="btn-submit" onClick={submitSingle}>
                      {session.currentIndex >= session.run.questions.length - 1 ? "Finish Exam" : "Submit Answer"}
                    </button>
                    <button type="button" className="danger" onClick={stopRun}>
                      Stop Exam
                    </button>
                  </>
                ) : (
                  pendingFinalQuestionId === singleRevealId ? (
                    <button type="button" className="btn-submit" onClick={finalizeFromFinalReveal}>
                      Finish Exam
                    </button>
                  ) : (
                    <button type="button" className="btn-submit" onClick={nextSingle}>
                      Next Question →
                    </button>
                  )
                )}
              </div>

              {singleRevealId && session.evaluations[singleRevealId] ? (
                <AnswerReveal evaluation={session.evaluations[singleRevealId]} />
              ) : null}
            </article>
          ) : null}

          {!paused && mode === "batch" ? (
            <article className="batch-question-list">
              <h3>
                Batch {Math.floor(session.batchStart / 10) + 1} · Questions {session.batchStart + 1}
                -
                {Math.min(session.batchStart + 10, session.run.questions.length)}
              </h3>

              {displayedBatch.map((question, index) => (
                <div className="batch-question-card" key={question.id}>
                  <div className="question-meta-row">
                    <span className="q-meta-pill">Q {session.batchStart + index + 1} of {session.run.questions.length}</span>
                    <span className="q-meta-pill pill-domain">Domain {question.domain}</span>
                    <span className="q-meta-pill">{typeLabel(question.type)}</span>
                    <span className={`q-meta-pill pill-${question.difficulty}`}>{toDifficultyLabel(question.difficulty)}</span>
                  </div>

                  {question.type === "case-study" ? (
                    <CaseStudyPanel
                      caseStudy={session.run.selectedCaseStudy}
                      caseQuestionIndex={getCaseQuestionIndex(session.run, question.id)}
                    />
                  ) : null}

                  <QuestionRenderer
                    question={question}
                    value={session.answers[question.id]}
                    onChange={(value) => updateAnswer(question.id, value)}
                    disabled={batchRevealIds.length > 0}
                  />

                  {session.hintsShown[question.id] ? (
                    <p className="hint-box">Hint: {session.hintsShown[question.id]}</p>
                  ) : (
                    <button type="button" onClick={() => setHint(question)} disabled={batchRevealIds.length > 0}>
                      Hint
                    </button>
                  )}
                </div>
              ))}

              <div className="question-actions">
                <button type="button" onClick={pauseRun} disabled={!canPause}>
                  Pause
                </button>
                {batchRevealIds.length === 0 ? (
                  <button type="button" className="btn-submit" onClick={submitBatch}>
                    Submit Batch
                  </button>
                ) : (
                  <button type="button" className="btn-submit" onClick={nextBatch}>
                    Next Batch →
                  </button>
                )}
                <button type="button" className="danger" onClick={stopRun}>
                  Stop Exam
                </button>
              </div>

              {batchRevealIds.length > 0 ? (
                <div className="batch-reveal-grid">
                  {batchRevealIds.map((questionId) => {
                    const evaluation = session.evaluations[questionId];
                    return evaluation ? <AnswerReveal key={questionId} evaluation={evaluation} /> : null;
                  })}
                </div>
              ) : null}
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

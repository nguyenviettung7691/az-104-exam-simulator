import { startTransition, useEffect, useMemo, useState } from "react";
import { CumulativeAssessment } from "./components/CumulativeAssessment";
import { QuestionBankAdmin } from "./components/QuestionBankAdmin";
import { SimulationRunner } from "./components/SimulationRunner";
import { validateBlueprint } from "./config/examBlueprint";
import {
  appendRunHistory,
  buildCumulativeAssessment,
  clearRunHistory,
  loadPresentationModePreference,
  loadRunHistory,
  savePresentationModePreference,
} from "./services/historyService";
import {
  createEmptyQuestionBank,
  exportQuestionBankText,
  importQuestionBankFromText,
  loadBundledQuestionBankFromJson,
  loadQuestionBank,
  saveQuestionBank,
  validateQuestionBank,
} from "./services/questionBankService";
import type { PresentationMode, QuestionBank } from "./types/exam";
import type { SimulationRunReport } from "./types/results";

type AppView = "simulation" | "question-bank" | "history";

const downloadText = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

function App() {
  const initialBank = useMemo(() => loadQuestionBank(), []);
  const [view, setView] = useState<AppView>("simulation");
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [bank, setBank] = useState<QuestionBank>(initialBank);
  const [validationReport, setValidationReport] = useState(() =>
    validateQuestionBank(initialBank),
  );
  const [runHistory, setRunHistory] = useState<SimulationRunReport[]>(
    loadRunHistory(),
  );
  const [preferredMode, setPreferredMode] = useState<PresentationMode | null>(
    loadPresentationModePreference(),
  );
  const [importFeedback, setImportFeedback] = useState<string>("");

  const cumulativeAssessment = useMemo(
    () => buildCumulativeAssessment(runHistory),
    [runHistory],
  );

  const blueprintErrors = useMemo(() => validateBlueprint(), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const onBankChanged = (
    nextBank: QuestionBank,
    nextReport: ReturnType<typeof validateQuestionBank> | null = null,
  ): void => {
    setBank(nextBank);
    setValidationReport(nextReport ?? validateQuestionBank(nextBank));
    window.setTimeout(() => {
      saveQuestionBank(nextBank);
    }, 0);
  };

  const importBank = (rawText: string): void => {
    const result = importQuestionBankFromText(rawText);
    setValidationReport(result.report);

    if (!result.bank) {
      setImportFeedback("Import failed. Resolve validation errors and retry.");
      return;
    }

    onBankChanged(result.bank);
    setImportFeedback(
      `Import successful. Loaded ${result.bank.questions.length} questions and ${result.bank.caseStudies.length} case studies.`,
    );
  };

  const exportBank = (): void => {
    downloadText("az104-question-bank.json", exportQuestionBankText(bank));
  };

  const loadBundledBank = async (): Promise<void> => {
    const result = await loadBundledQuestionBankFromJson();

    if (!result.bank) {
      setImportFeedback(result.errorMessage ?? "Bundled bank load failed.");
      return;
    }

    onBankChanged(result.bank, result.report);
    setImportFeedback(
      `Bundled bank loaded from JSON. Loaded ${result.bank.questions.length} questions and ${result.bank.caseStudies.length} case studies.`,
    );
  };

  const clearBank = (): void => {
    if (bank.questions.length === 0 && bank.caseStudies.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Clear the entire question bank?\n\nThis removes ${bank.questions.length} questions and ${bank.caseStudies.length} case studies.`,
    );

    if (!confirmed) {
      return;
    }

    onBankChanged(createEmptyQuestionBank());
    setImportFeedback("Question bank cleared.");
  };

  const toggleQuestion = (questionId: string, nextActive: boolean): void => {
    const nextBank: QuestionBank = {
      ...bank,
      questions: bank.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          active: nextActive,
        };
      }),
    };

    onBankChanged(nextBank);
  };

  const onReportReady = (report: SimulationRunReport): void => {
    const history = appendRunHistory(report);
    setRunHistory(history);
  };

  const onModeChange = (mode: PresentationMode): void => {
    setPreferredMode(mode);
    savePresentationModePreference(mode);
  };

  const clearHistory = (): void => {
    if (runHistory.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Clear run history?\n\nThis will permanently remove ${runHistory.length} saved run ${runHistory.length === 1 ? "entry" : "entries"}.`,
    );

    if (!confirmed) {
      return;
    }

    clearRunHistory();
    setRunHistory([]);
  };

  const onRequestNewRun = (): void => {
    startTransition(() => {
      setView("simulation");
    });
  };

  const onSimulationRunActiveChange = (active: boolean): void => {
    setIsExamActive(active);
  };

  return (
    <div className="app-shell">
      {!isExamActive ? (
        <>
          <header className="app-hero">
            <div className="hero-copy">
              <p className="hero-badge">AZ-104 Exam Simulator</p>
              <h1>Microsoft Azure Administrator Associate</h1>
              <p>
                Run realistic 53-question simulations, enforce official domain/type quotas, and track
                cumulative readiness across attempts.
              </p>
            </div>

            <div className="hero-art" aria-hidden="true">
              <img className="hero-art-badge" src="/az104.png" alt="" />
            </div>
          </header>

          {blueprintErrors.length > 0 ? (
            <section className="global-alert">
              <h2>Blueprint Configuration Error</h2>
              <ul>
                {blueprintErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <nav className="app-nav" aria-label="Primary">
            <button
              type="button"
              className={view === "simulation" ? "active" : ""}
              onClick={() =>
                startTransition(() => {
                  setView("simulation");
                })
              }
            >
              Simulation
            </button>
            <button
              type="button"
              className={view === "question-bank" ? "active" : ""}
              onClick={() =>
                startTransition(() => {
                  setView("question-bank");
                })
              }
              disabled={isExamActive}
              title={isExamActive ? "Finish or stop the current exam to access Question Bank." : undefined}
            >
              Question Bank
            </button>
            <button
              type="button"
              className={view === "history" ? "active" : ""}
              onClick={() =>
                startTransition(() => {
                  setView("history");
                })
              }
              disabled={isExamActive}
              title={isExamActive ? "Finish or stop the current exam to access Results and Trends." : undefined}
            >
              Results and Trends
            </button>
          </nav>
        </>
      ) : null}

      <main className="app-main">
        {view === "simulation" ? (
          <SimulationRunner
            bank={bank}
            previousRuns={runHistory}
            preferredMode={preferredMode}
            onModeChange={onModeChange}
            onReportReady={onReportReady}
            onRunActiveChange={onSimulationRunActiveChange}
            onRequestNewRun={onRequestNewRun}
          />
        ) : null}

        {view === "question-bank" ? (
          <>
            {importFeedback ? <p className="inline-feedback">{importFeedback}</p> : null}
            <QuestionBankAdmin
              bank={bank}
              report={validationReport}
              onImportText={importBank}
              onExport={exportBank}
              onLoadBundledBank={loadBundledBank}
              onClear={clearBank}
              onToggleQuestion={toggleQuestion}
            />
          </>
        ) : null}

        {view === "history" ? (
          <section>
            <CumulativeAssessment assessment={cumulativeAssessment} />
            {runHistory.length > 0 ? (
              <div className="history-actions">
                <button type="button" className="danger" onClick={clearHistory}>
                  Clear Run History
                </button>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>

      {!isExamActive ? (
        <footer className="app-references" aria-label="Official AZ-104 documents">
          <h3>Reference Links (Official)</h3>
          <ul className="reference-links">
            <li>
              <a
                href="https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104"
                target="_blank"
                rel="external noopener noreferrer"
              >
                Study guide
              </a>
            </li>
            <li>
              <a
                href="https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator"
                target="_blank"
                rel="external noopener noreferrer"
              >
                Exam page
              </a>
            </li>
            <li>
              <a
                href="https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience"
                target="_blank"
                rel="external noopener noreferrer"
              >
                Exam duration and experience
              </a>
            </li>
          </ul>
        </footer>
      ) : null}
    </div>
  );
}

export default App;

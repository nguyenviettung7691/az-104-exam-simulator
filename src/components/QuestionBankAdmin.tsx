import { useMemo, useState, type ChangeEvent } from "react";
import {
  DOMAIN_DEFINITIONS,
  DOMAIN_IDS,
  QUESTION_TYPES,
} from "../types/exam";
import type {
  DomainId,
  QuestionBank,
  QuestionBankValidationReport,
  QuestionType,
} from "../types/exam";
import { DOMAIN_QUOTAS, QUESTION_TYPE_QUOTAS } from "../config/examBlueprint";

const typeLabels: Record<QuestionType, string> = {
  "multiple-choice": "Multiple Choice",
  "multi-select": "Multiple Response",
  "yes-no": "Yes/No",
  "case-study": "Case Study",
  "drag-drop": "Drag-and-Drop",
  "hot-area": "Hot Area",
};

/** Full exam runs a count covers for a given per-run quota */
const runsAvailable = (count: number, quota: number): number =>
  quota > 0 ? Math.floor(count / quota) : 0;

/** Bar fill % capped at 5 runs = 100% */
const coveragePct = (count: number, quota: number): number =>
  Math.min(Math.round((count / Math.max(quota * 5, 1)) * 100), 100);

const coverageColor = (runs: number): string => {
  if (runs >= 2) return "bar-pass";
  if (runs >= 1) return "bar-review";
  return "bar-danger";
};

interface QuestionBankAdminProps {
  bank: QuestionBank;
  report: QuestionBankValidationReport;
  onImportText: (rawText: string) => void;
  onExport: () => void;
  onLoadBundledBank: () => void;
  onClear: () => void;
  onToggleQuestion: (questionId: string, nextActive: boolean) => void;
}

export const QuestionBankAdmin = ({
  bank,
  report,
  onImportText,
  onExport,
  onLoadBundledBank,
  onClear,
  onToggleQuestion,
}: QuestionBankAdminProps) => {
  const [importText, setImportText] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [importExpanded, setImportExpanded] = useState<boolean>(
    bank.questions.length === 0,
  );
  const [fileName, setFileName] = useState<string>("");

  // Filter state
  const [search, setSearch] = useState<string>("");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");

  const isEmpty = bank.questions.length === 0;

  const sortedQuestions = useMemo(
    () => [...bank.questions].sort((a, b) => a.id.localeCompare(b.id)),
    [bank.questions],
  );

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedQuestions.filter((question) => {
      if (filterDomain !== "all" && question.domain !== filterDomain) return false;
      if (filterType !== "all" && question.type !== filterType) return false;
      if (filterActive === "active" && question.active === false) return false;
      if (filterActive === "inactive" && question.active !== false) return false;
      if (q) {
        const hay = `${question.id} ${question.subtopic} ${question.stem}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sortedQuestions, search, filterDomain, filterType, filterActive]);

  const minRunsAvailable = useMemo(() => {
    if (isEmpty) return 0;
    return Math.min(
      ...DOMAIN_IDS.map((d) =>
        runsAvailable(report.counts.byDomain[d as DomainId] ?? 0, DOMAIN_QUOTAS[d as DomainId]),
      ),
    );
  }, [report.counts.byDomain, isEmpty]);

  const loadFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setImportText(text);
      setFeedback(`"${file.name}" loaded — click Import to apply.`);
    };
    reader.readAsText(file);
  };

  const importJson = (): void => {
    onImportText(importText);
    setImportExpanded(false);
  };

  const copyTemplate = async (): Promise<void> => {
    const template = {
      version: "2026.04.17",
      updatedAt: new Date().toISOString(),
      questions: [],
      caseStudies: [],
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
      setFeedback("Empty bank template copied to clipboard.");
    } catch {
      setFeedback("Clipboard blocked by browser — copy the template from the README.");
    }
  };

  return (
    <section className="admin-panel">
      <h2>Question Bank</h2>
      <p>
        Load the bundled 375-question AZ-104 bank with 7 case studies, or import your
        own validated bank JSON to generate runs.
      </p>

      {/* ── Action row */}
      <div className="bank-action-row">
        <button type="button" className="btn-generate" onClick={onLoadBundledBank}>
          Load Bundled 375-Question Bank
        </button>
        <button type="button" onClick={copyTemplate}>
          Copy Empty Template
        </button>
        <button type="button" onClick={onExport} disabled={isEmpty}>
          Export Bank JSON
        </button>
        <div className="bank-action-divider" />
        <button type="button" className="danger" onClick={onClear} disabled={isEmpty}>
          Clear Bank
        </button>
      </div>

      {/* ── Import accordion */}
      <div className="import-section">
        <button
          type="button"
          className="import-section-toggle"
          onClick={() => setImportExpanded((v) => !v)}
        >
          <span>{importExpanded ? "▼" : "►"}</span>
          Import / Replace Bank
        </button>

        {importExpanded ? (
          <div className="import-section-body">
            {/* File drop zone */}
            <div>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.88rem" }}>
                From file
              </p>
              <label
                className={`file-drop-zone${fileName ? " has-file" : ""}`}
                htmlFor="bank-file"
              >
                <span className="file-drop-icon">{fileName ? "✓" : "📂"}</span>
                <span className="file-drop-text">
                  {fileName ? fileName : "Click to choose a JSON file"}
                </span>
                <span className="file-drop-hint">
                  {fileName ? "Click to choose a different file" : "or drag and drop"}
                </span>
              </label>
              <input
                id="bank-file"
                type="file"
                accept="application/json"
                onChange={loadFile}
                style={{ display: "none" }}
              />
            </div>

            {/* Paste JSON */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ fontWeight: 600, marginBottom: 0, fontSize: "0.88rem" }}>
                Or paste JSON
              </p>
              <textarea
                id="bank-json"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                placeholder='{"version":"2026.04.17","questions":[],"caseStudies":[]}'
                style={{ resize: "vertical" }}
              />
              <button
                type="button"
                className="btn-submit"
                onClick={importJson}
                disabled={!importText.trim()}
              >
                Import JSON
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Feedback / validation */}
      {feedback ? (
        <p className="inline-feedback" style={{ marginBottom: "0.8rem" }}>
          {feedback}
        </p>
      ) : null}

      {!report.isValid ? (
        <div className="validation-box error">
          <h3>Validation Errors</h3>
          <ul>
            {report.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.warnings.length > 0 ? (
        <div className="validation-box warning">
          <h3>Warnings</h3>
          <ul>
            {report.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ── Empty state */}
      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No questions loaded</h3>
          <p>
            Load the bundled bank above or import your own JSON to start running
            simulations.
          </p>
        </div>
      ) : (
        <>
          {/* ── Stats cards */}
          <div className="counts-grid">
            <div className="count-card">
              <strong>Active Questions</strong>
              <span>{report.counts.activeQuestions}</span>
              <div className="count-card-sub">of {report.counts.totalQuestions} total</div>
            </div>
            <div className="count-card">
              <strong>Exam Runs Available</strong>
              <span
                style={{
                  color:
                    minRunsAvailable >= 2
                      ? "var(--teal)"
                      : minRunsAvailable >= 1
                        ? "var(--orange)"
                        : "var(--red)",
                }}
              >
                {minRunsAvailable}
              </span>
              <div className="count-card-sub">no-repeat runs (bottleneck domain)</div>
            </div>
            <div className="count-card">
              <strong>Case Studies</strong>
              <span>{bank.caseStudies.length}</span>
              <div className="count-card-sub">loaded</div>
            </div>
          </div>

          {/* ── Domain coverage bars */}
          <div className="counts-table">
            <h3>Domain Coverage</h3>
            <div className="coverage-bar-rows">
              {DOMAIN_IDS.map((d) => {
                const count = report.counts.byDomain[d as DomainId] ?? 0;
                const quota = DOMAIN_QUOTAS[d as DomainId];
                const runs = runsAvailable(count, quota);
                const pct = coveragePct(count, quota);
                return (
                  <div key={d} className="domain-bar-row">
                    <div className="domain-bar-row-label">
                      <span className="domain-bar-row-name">
                        {DOMAIN_DEFINITIONS[d as DomainId].shortTitle}
                      </span>
                      <span className="domain-bar-row-stat">
                        {count} questions · ~{runs} {runs === 1 ? "run" : "runs"}
                      </span>
                    </div>
                    <div className="domain-bar-track">
                      <div
                        className={`domain-bar-fill ${coverageColor(runs)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Type coverage bars */}
          <div className="counts-table">
            <h3>Question Type Coverage</h3>
            <div className="coverage-bar-rows">
              {QUESTION_TYPES.map((t) => {
                const count = report.counts.byType[t] ?? 0;
                const quota = QUESTION_TYPE_QUOTAS[t];
                const runs = runsAvailable(count, quota);
                const pct = coveragePct(count, quota);
                return (
                  <div key={t} className="domain-bar-row">
                    <div className="domain-bar-row-label">
                      <span className="domain-bar-row-name">{typeLabels[t]}</span>
                      <span className="domain-bar-row-stat">
                        {count} questions · ~{runs} {runs === 1 ? "run" : "runs"}
                      </span>
                    </div>
                    <div className="domain-bar-track">
                      <div
                        className={`domain-bar-fill ${coverageColor(runs)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Question pool */}
          <div className="question-list">
            <h3>
              Question Pool
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: "var(--ink-soft)",
                  marginLeft: "0.6rem",
                }}
              >
                {report.counts.activeQuestions} active / {report.counts.totalQuestions} total
              </span>
            </h3>

            <div className="qbank-filter-bar">
              <input
                type="search"
                placeholder="Search by ID, topic, or question text…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
              >
                <option value="all">All Domains</option>
                {DOMAIN_IDS.map((d) => (
                  <option key={d} value={d}>
                    {DOMAIN_DEFINITIONS[d as DomainId].shortTitle}
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabels[t]}
                  </option>
                ))}
              </select>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>

            <p className="qbank-filter-count">
              Showing {filteredQuestions.length} of {sortedQuestions.length} questions
            </p>

            {filteredQuestions.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem 1rem" }}>
                <div className="empty-state-icon">🔍</div>
                <h3>No questions match</h3>
                <p>Try adjusting the search or filter selections above.</p>
              </div>
            ) : (
              <ul>
                {filteredQuestions.map((question) => (
                  <li key={question.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={question.active !== false}
                        onChange={(e) =>
                          onToggleQuestion(question.id, e.target.checked)
                        }
                      />
                      <div className="qbank-item-body">
                        <div className="qbank-item-pills">
                          <span className="q-meta-pill pill-domain">
                            {question.domain}
                          </span>
                          <span className="q-meta-pill">{typeLabels[question.type]}</span>
                          <span
                            className={`q-meta-pill pill-${question.difficulty}`}
                          >
                            {question.difficulty.charAt(0).toUpperCase() +
                              question.difficulty.slice(1)}
                          </span>
                        </div>
                        <span className="qbank-item-text">
                          {question.id} · {question.subtopic}
                        </span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
};

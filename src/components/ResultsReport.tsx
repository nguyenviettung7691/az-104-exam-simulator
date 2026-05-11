import { useEffect, useState } from "react";
import { PASS_SCALED_SCORE } from "../config/examBlueprint";
import { DOMAIN_DEFINITIONS } from "../types/exam";
import type { SimulationRunReport } from "../types/results";

interface ResultsReportProps {
  report: SimulationRunReport;
  onNewRun?: () => void;
}

const typeLabels: Record<string, string> = {
  "multiple-choice": "Multiple Choice",
  "multi-select": "Multiple Response",
  "yes-no": "Yes/No",
  "case-study": "Case Study",
  "drag-drop": "Drag-and-Drop",
  "hot-area": "Hot Area",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** SVG circular gauge that animates on mount */
const ScoreRing = ({ score, passed }: { score: number; passed: boolean }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(score / 1000, 1));
  const color = passed ? "#009f88" : "#c23428";

  return (
    <svg className="score-ring-svg" viewBox="0 0 90 90" aria-hidden="true">
      <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="9" />
      <circle
        cx="45"
        cy="45"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={visible ? offset : circumference}
        transform="rotate(-90 45 45)"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.2,0.64,1)" }}
      />
      <text x="45" y="49" textAnchor="middle" fontFamily="var(--heading)" fontSize="14" fontWeight="800" fill={color}>
        {score}
      </text>
    </svg>
  );
};

const DOMAIN_PASS_PCT = 70; // visual threshold line on domain bars

export const ResultsReport = ({ report, onNewRun }: ResultsReportProps) => {
  const pct = Math.round((report.rawCorrect / report.totalQuestions) * 100);
  const incorrect = report.totalQuestions - report.rawCorrect;

  return (
    <section className="results-report">
      {/* Title row */}
      <div className="results-title-row">
        <h2>AZ-104 SIMULATION RESULTS</h2>
        <span className="results-run-badge">Run #{report.runNumber}</span>
      </div>

      {/* Pass/Fail banner */}
      <div className={`result-banner ${report.passed ? "banner-pass" : "banner-fail"}`}>
        <div className="result-banner-ring-wrap">
          <ScoreRing score={report.scaledScore} passed={report.passed} />
          <div>
            <div className="result-banner-verdict">{report.passed ? "PASS" : "FAIL"}</div>
            <div className="result-threshold-line">
              Threshold: {PASS_SCALED_SCORE} / 1000
            </div>
          </div>
        </div>
        <div className="result-banner-meta">
          <div className="result-banner-score">{report.scaledScore}</div>
          <div className="result-meta-note">scaled score (estimated)</div>
          <div className="result-meta-summary">
            {report.rawCorrect} / {report.totalQuestions} correct · {pct}%
          </div>
        </div>
      </div>

      {/* Stats chips */}
      <div className="results-stats-row">
        <div className="results-stat-chip">
          <span className="results-stat-chip-label">Correct</span>
          <span className="results-stat-chip-value chip-val-pass">{report.rawCorrect}</span>
          <span className="results-stat-chip-sub">of {report.totalQuestions} questions</span>
        </div>
        <div className="results-stat-chip">
          <span className="results-stat-chip-label">Incorrect</span>
          <span className="results-stat-chip-value chip-val-fail">{incorrect}</span>
          <span className="results-stat-chip-sub">questions missed</span>
        </div>
        <div className="results-stat-chip">
          <span className="results-stat-chip-label">Accuracy</span>
          <span className="results-stat-chip-value">{pct}%</span>
          <span className="results-stat-chip-sub">overall</span>
        </div>
        <div className="results-stat-chip">
          <span className="results-stat-chip-label">Time Taken</span>
          <span className="results-stat-chip-value chip-val-time">{formatDuration(report.durationSeconds)}</span>
          <span className="results-stat-chip-sub">of 120 min</span>
        </div>
      </div>

      {/* Domain bar chart */}
      <div className="results-section-card">
        <h3>Domain Breakdown</h3>
        <div className="domain-bar-rows">
          {report.domainBreakdown.map((line) => (
            <div key={line.domain} className="domain-bar-row">
              <div className="domain-bar-row-label">
                <span className="domain-bar-row-name">
                  {DOMAIN_DEFINITIONS[line.domain].shortTitle}
                  <span className={`domain-status-badge ${line.status === "PASS" ? "badge-pass" : "badge-review"}`}>
                    {line.status}
                  </span>
                </span>
                <span className="domain-bar-row-stat">
                  {line.correct}/{line.total} · {line.percentage}%
                </span>
              </div>
              <div className="domain-bar-outer">
                <div className="domain-bar-track">
                  <div
                    className={`domain-bar-fill ${line.status === "PASS" ? "bar-pass" : "bar-review"}`}
                    style={{ width: `${line.percentage}%` }}
                  />
                </div>
                <div
                  className="domain-bar-threshold"
                  style={{ left: `${DOMAIN_PASS_PCT}%` }}
                  title="Pass threshold (~70%)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak / Strong area cards */}
      <div className="results-grid">
        <div className="results-card results-card-weak">
          <h3>Weak Areas</h3>
          {report.weakAreas.length > 0 ? (
            <div className="area-chip-list">
              {report.weakAreas.map((item) => (
                <span key={item} className="area-chip chip-weak">{item}</span>
              ))}
            </div>
          ) : (
            <p className="card-empty-msg">No weak areas detected — excellent run!</p>
          )}
        </div>

        <div className="results-card results-card-strong">
          <h3>Strong Areas</h3>
          {report.strongAreas.length > 0 ? (
            <div className="area-chip-list">
              {report.strongAreas.map((item) => (
                <span key={item} className="area-chip chip-strong">{item}</span>
              ))}
            </div>
          ) : (
            <p className="card-empty-msg">No strong areas above threshold this run.</p>
          )}
        </div>
      </div>

      {/* Next Steps */}
      {report.weakAreas.length > 0 ? (
        <div className="next-steps-card">
          <h3>Recommended Next Steps</h3>
          <ol>
            {report.weakAreas.slice(0, 4).map((area) => (
              <li key={area}>
                Review and practice: <strong>{area}</strong>
              </li>
            ))}
            {!report.passed ? (
              <li>Run another simulation to track your progress toward the 700 threshold.</li>
            ) : null}
          </ol>
        </div>
      ) : null}

      {/* Question type breakdown */}
      <div className="results-section-card">
        <h3>Question Type Performance</h3>
        <div className="table-scroll">
          <table className="qtype-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Score</th>
                <th className="qtype-col-accuracy">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {report.questionTypeBreakdown.map((line) => {
                const typePct = line.total > 0 ? Math.round((line.correct / line.total) * 100) : 0;
                return (
                  <tr key={line.type}>
                    <td>
                      <span className="qtype-label">{typeLabels[line.type] ?? line.type}</span>
                    </td>
                    <td className="qtype-score">{line.correct}/{line.total}</td>
                    <td>
                      <div className="qtype-bar-wrap">
                        <div className="qtype-bar-track">
                          <div className="qtype-bar-fill" style={{ width: `${typePct}%` }} />
                        </div>
                        <span className="qtype-bar-label">{typePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action bar */}
      <div className="results-action-bar">
        <button type="button" className="btn-ghost" onClick={() => window.print()}>
          Print / Export PDF
        </button>
        {onNewRun ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "auto" });
              onNewRun();
            }}
          >
            Start New Run
          </button>
        ) : null}
      </div>
    </section>
  );
};

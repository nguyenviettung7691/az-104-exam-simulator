import { useEffect, useState } from "react";
import { DOMAIN_DEFINITIONS } from "../types/exam";
import type { CumulativeAssessment as CumulativeAssessmentModel, DomainTrendLine } from "../types/results";

const PASS_SCALED = 700;

interface CumulativeAssessmentProps {
  assessment: CumulativeAssessmentModel | null;
}

const trendColor = (trend: "Improving" | "Stable" | "Declining"): string => {
  if (trend === "Improving") return "#005c4e";
  if (trend === "Declining") return "#8b1c14";
  return "var(--ink-soft)";
};

const trendBg = (trend: "Improving" | "Stable" | "Declining"): string => {
  if (trend === "Improving") return "rgba(0,159,136,0.12)";
  if (trend === "Declining") return "rgba(194,52,40,0.10)";
  return "rgba(0,0,0,0.06)";
};

const trendIcon = (trend: "Improving" | "Stable" | "Declining"): string => {
  if (trend === "Improving") return "↑";
  if (trend === "Declining") return "↓";
  return "→";
};

/** SVG sparkline for per-run averages derived from domain data */
const Sparkline = ({ domainTrends, totalRuns }: { domainTrends: DomainTrendLine[]; totalRuns: number }) => {
  const runAverages = Array.from({ length: totalRuns }, (_, i) => {
    const vals = domainTrends.map((d) => d.percentagesByRun[i] ?? 0);
    return vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  });

  const W = 120, H = 40, pad = 4;
  const min = Math.max(0, Math.min(...runAverages) - 10);
  const max = Math.min(100, Math.max(...runAverages) + 10);
  const xStep = totalRuns > 1 ? (W - pad * 2) / (totalRuns - 1) : 0;
  const toY = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const points = runAverages.map((v, i) => `${pad + i * xStep},${toY(v)}`).join(" ");
  const last = runAverages[runAverages.length - 1];
  const lastX = pad + (totalRuns - 1) * xStep;
  const lastY = toY(last);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ca-sparkline" aria-hidden="true">
      <polyline fill="none" stroke="var(--azure)" strokeWidth="2" strokeLinejoin="round" points={points} />
      {runAverages.map((v, i) => (
        <circle key={i} cx={pad + i * xStep} cy={toY(v)} r="2.5" fill="var(--azure)" opacity="0.6" />
      ))}
      <circle cx={lastX} cy={lastY} r="3.5" fill="var(--teal)" />
    </svg>
  );
};

/** Animated horizontal bar */
const AnimBar = ({
  pct,
  color,
  threshold,
}: {
  pct: number;
  color: string;
  threshold?: number;
}) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="ca-bar-track">
      <div
        className="ca-bar-fill"
        style={{ width: `${width}%`, background: color, transition: "width 0.6s cubic-bezier(0.34,1.1,0.64,1)" }}
      />
      {threshold !== undefined && (
        <div className="ca-bar-threshold" style={{ left: `${threshold}%` }} title={`${threshold}% threshold`} />
      )}
    </div>
  );
};

/** Domain trend row — shows latest bar + delta chip */
const DomainTrendRow = ({ line }: { line: DomainTrendLine }) => {
  const latest = line.percentagesByRun[line.percentagesByRun.length - 1] ?? 0;
  const first = line.percentagesByRun[0] ?? latest;
  const delta = latest - first;
  const barColor =
    line.trend === "Improving"
      ? "linear-gradient(90deg,#009f88,#00c4a8)"
      : line.trend === "Declining"
        ? "linear-gradient(90deg,#c23428,#e04a3e)"
        : "linear-gradient(90deg,var(--azure),var(--azure-deep))";

  return (
    <div className="ca-domain-row">
      <div className="ca-domain-header">
        <span className="ca-domain-name">{DOMAIN_DEFINITIONS[line.domain].shortTitle}</span>
        <div className="ca-domain-right">
          {line.percentagesByRun.length > 1 && (
            <span
              className="ca-delta-badge"
              style={{
                color: trendColor(line.trend),
                background: trendBg(line.trend),
              }}
            >
              {delta > 0 ? `+${delta}` : delta === 0 ? "=" : delta}%
            </span>
          )}
          <span className="ca-domain-stat">{latest}%</span>
        </div>
      </div>
      <AnimBar pct={latest} color={barColor} threshold={70} />
      {line.percentagesByRun.length > 1 && (
        <div className="ca-run-history">
          {line.percentagesByRun.map((p, i) => (
            <span key={i} className="ca-run-pip">
              <span className="ca-run-pip-label">Run {i + 1}</span>
              <span className="ca-run-pip-val">{p}%</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const CumulativeAssessment = ({
  assessment,
}: CumulativeAssessmentProps) => {
  if (!assessment) {
    return (
      <section className="cumulative-box">
        <h2>Results &amp; Trends</h2>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No runs completed yet</h3>
          <p>Complete your first simulation to see your score history and trend analysis here.</p>
        </div>
      </section>
    );
  }

  const showFullBreakdown = assessment.totalRuns >= 2;
  const scoreTowardPass = Math.min(100, Math.round((assessment.averageScaledScore / 1000) * 100));
  const thresholdPct = PASS_SCALED / 10; // 70%
  const aboveThreshold = assessment.averageScaledScore >= PASS_SCALED;

  return (
    <section className="cumulative-box">
      {/* Header */}
      <div className="ca-header">
        <div>
          <h2 className="ca-title">Results &amp; Trends</h2>
          <span className="ca-run-count">{assessment.totalRuns} {assessment.totalRuns === 1 ? "run" : "runs"} · {assessment.totalQuestionsAnswered} questions</span>
        </div>
        <span
          className="ca-trend-pill"
          style={{ color: trendColor(assessment.trend), background: trendBg(assessment.trend) }}
        >
          {trendIcon(assessment.trend)} {assessment.trend}
        </span>
      </div>

      {/* Top stat cards */}
      <div className="ca-stat-grid">
        {/* Average Score */}
        <div className="ca-stat-card ca-stat-score">
          <div className="ca-stat-label">Average Score</div>
          <div className="ca-stat-big" style={{ color: aboveThreshold ? "var(--teal)" : "var(--azure-deep)" }}>
            {assessment.averageRawPercentage}%
          </div>
          <div className="ca-stat-sub">Scaled: {assessment.averageScaledScore} / 1000</div>
          <div className="ca-score-bar-wrap">
            <AnimBar pct={scoreTowardPass} color={aboveThreshold ? "linear-gradient(90deg,var(--teal),#00c4a8)" : "linear-gradient(90deg,var(--azure),var(--azure-deep))"} threshold={thresholdPct} />
            <div className="ca-score-bar-labels">
              <span>0</span>
              <span style={{ color: "var(--ink-soft)", fontFamily: "var(--mono)" }}>Pass: 700</span>
              <span>1000</span>
            </div>
          </div>
        </div>

        {/* Trend sparkline */}
        {showFullBreakdown && (
          <div className="ca-stat-card ca-stat-trend">
            <div className="ca-stat-label">Score Trajectory</div>
            <Sparkline domainTrends={assessment.domainTrends} totalRuns={assessment.totalRuns} />
            <div className="ca-stat-sub" style={{ marginTop: "0.3rem" }}>
              Avg. % across {assessment.totalRuns} runs
            </div>
          </div>
        )}

        {/* Exam ready */}
        <div className={`ca-stat-card ca-stat-ready ${assessment.readyForRealExam ? "ca-ready-yes" : "ca-ready-no"}`}>
          <div className="ca-stat-label">Exam Ready?</div>
          <div className="ca-ready-icon">{assessment.readyForRealExam ? "✓" : "⏳"}</div>
          <div className="ca-ready-verdict">{assessment.readyForRealExam ? "Ready!" : "Not yet"}</div>
          <div className="ca-stat-sub">
            {assessment.readyForRealExam
              ? "Consistent performance above pass threshold."
              : "Aim for 700+ scaled across multiple runs."}
          </div>
        </div>
      </div>

      {showFullBreakdown ? (
        <>
          {/* Domain trends */}
          <div className="ca-section">
            <div className="ca-section-header">
              <span className="ca-section-icon">📈</span>
              <h3>Domain Trends</h3>
              <span className="ca-section-hint">Latest score · 70% threshold line</span>
            </div>
            <div className="ca-domain-grid">
              {assessment.domainTrends.map((line) => (
                <DomainTrendRow key={line.domain} line={line} />
              ))}
            </div>
          </div>

          {/* Persistent weak topics */}
          {assessment.persistentWeakTopics.length > 0 && (
            <div className="ca-section">
              <div className="ca-section-header">
                <span className="ca-section-icon">⚠️</span>
                <h3>Persistent Weak Topics</h3>
                <span className="ca-section-hint">Missed in multiple runs</span>
              </div>
              <div className="ca-weak-grid">
                {assessment.persistentWeakTopics.map((topic) => (
                  <div key={topic.topic} className="ca-weak-card">
                    <span className="ca-weak-name">{topic.topic}</span>
                    <span className={`ca-miss-badge ${topic.misses >= 3 ? "miss-high" : topic.misses >= 2 ? "miss-med" : "miss-low"}`}>
                      ✗ {topic.misses} {topic.misses === 1 ? "run" : "runs"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assessment.persistentWeakTopics.length === 0 && (
            <div className="ca-section">
              <div className="ca-no-weak">
                <span>🎯</span>
                <span>No persistent weak topics — great consistency!</span>
              </div>
            </div>
          )}

          {/* Recommended focus */}
          {assessment.recommendedFocus.length > 0 && (
            <div className="ca-section">
              <div className="ca-section-header">
                <span className="ca-section-icon">🎯</span>
                <h3>Recommended Next Focus</h3>
              </div>
              <div className="ca-focus-list">
                {assessment.recommendedFocus.map((topic, i) => (
                  <div key={topic} className="ca-focus-item">
                    <span className="ca-focus-num">{i + 1}</span>
                    <span className="ca-focus-topic">{topic}</span>
                    {i === 0 && <span className="ca-focus-priority">Top priority</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="ca-unlock-hint">
          <span className="ca-unlock-icon">🔓</span>
          <p>Complete a second run to unlock domain trend analysis, weak topic tracking, and personalized focus recommendations.</p>
        </div>
      )}
    </section>
  );
};

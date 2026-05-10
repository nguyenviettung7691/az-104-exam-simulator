import { useMemo, useState } from "react";
import type { CaseStudy } from "../types/exam";

interface CaseStudyPanelProps {
  caseStudy: CaseStudy;
  caseQuestionIndex: number;
}

type CaseStudyTabId =
  | "overview"
  | "current-environment"
  | "planned-changes"
  | "requirements"
  | "questions";

export const CaseStudyPanel = ({
  caseStudy,
  caseQuestionIndex,
}: CaseStudyPanelProps) => {
  const [activeTab, setActiveTab] = useState<CaseStudyTabId>("overview");

  const tabs = useMemo(
    () => [
      { id: "overview", title: "Overview" },
      { id: "current-environment", title: "Environment" },
      { id: "planned-changes", title: "Changes" },
      { id: "requirements", title: "Requirements" },
      { id: "questions", title: "Questions" },
    ] as const,
    [],
  );

  return (
    <section className="case-study-panel">
      <header>
        <p className="case-study-label">CASE STUDY — Section locked after completion</p>
        <h3>{caseStudy.title}</h3>
      </header>

      <div className="case-study-tabs" role="tablist" aria-label="Case study tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`case-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="case-study-content">
        {activeTab === "overview" ? <p>{caseStudy.overview}</p> : null}

        {activeTab === "current-environment" ? (
          <ul>
            {caseStudy.currentEnvironment.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {activeTab === "planned-changes" ? (
          <ul>
            {caseStudy.plannedChanges.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {activeTab === "requirements" ? (
          <ul>
            {caseStudy.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {activeTab === "questions" ? (
          <div>
            <p>
              You are answering question {caseQuestionIndex} of 5 for this case study.
            </p>
            <p>
              Each case-study question references requirements and environment details from the
              tabs above.
            </p>
          </div>
        ) : null}
      </div>

      <p className="case-study-lock-warning">
        In the real exam, this section is locked once you proceed. Review all tabs before
        answering.
      </p>
    </section>
  );
};

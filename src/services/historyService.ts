import { DOMAIN_IDS, type PresentationMode } from "../types/exam";
import type {
  CumulativeAssessment,
  DomainTrendLine,
  PersistentWeakTopic,
  SimulationRunReport,
} from "../types/results";
import { loadJson, removeKey, saveJson } from "./storage";

const RUN_HISTORY_KEY = "az104.runHistory";
const PRESENTATION_MODE_KEY = "az104.presentationMode";

const toTrend = (first: number, last: number): "Improving" | "Stable" | "Declining" => {
  const delta = last - first;
  if (delta >= 3) {
    return "Improving";
  }

  if (delta <= -3) {
    return "Declining";
  }

  return "Stable";
};

export const loadRunHistory = (): SimulationRunReport[] => {
  return loadJson<SimulationRunReport[]>(RUN_HISTORY_KEY, []);
};

export const saveRunHistory = (reports: SimulationRunReport[]): void => {
  saveJson(RUN_HISTORY_KEY, reports);
};

export const appendRunHistory = (report: SimulationRunReport): SimulationRunReport[] => {
  const history = loadRunHistory();
  const alreadyExists = history.some(
    (entry) => entry.runNumber === report.runNumber && entry.startedAt === report.startedAt,
  );

  if (alreadyExists) {
    return history;
  }

  const next = [...history, report];
  saveRunHistory(next);
  return next;
};

export const clearRunHistory = (): void => {
  removeKey(RUN_HISTORY_KEY);
};

export const loadPresentationModePreference = (): PresentationMode | null => {
  return loadJson<PresentationMode | null>(PRESENTATION_MODE_KEY, null);
};

export const savePresentationModePreference = (mode: PresentationMode): void => {
  saveJson(PRESENTATION_MODE_KEY, mode);
};

const buildDomainTrends = (reports: SimulationRunReport[]): DomainTrendLine[] => {
  return DOMAIN_IDS.map((domain) => {
    const percentagesByRun = reports.map((report) => {
      const line = report.domainBreakdown.find((entry) => entry.domain === domain);
      return line ? line.percentage : 0;
    });

    const first = percentagesByRun[0] ?? 0;
    const last = percentagesByRun[percentagesByRun.length - 1] ?? first;

    return {
      domain,
      percentagesByRun,
      trend: toTrend(first, last),
    };
  });
};

const buildPersistentWeakTopics = (
  reports: SimulationRunReport[],
): PersistentWeakTopic[] => {
  const missesByTopic = new Map<string, number>();

  for (const report of reports) {
    const runMisses = new Set<string>();

    for (const evaluation of report.evaluations) {
      if (!evaluation.isCorrect) {
        runMisses.add(evaluation.subtopic);
      }
    }

    for (const topic of runMisses) {
      missesByTopic.set(topic, (missesByTopic.get(topic) ?? 0) + 1);
    }
  }

  return [...missesByTopic.entries()]
    .filter(([, misses]) => misses >= 2)
    .sort((left, right) => right[1] - left[1])
    .map(([topic, misses]) => ({ topic, misses }));
};

export const buildCumulativeAssessment = (
  reports: SimulationRunReport[],
): CumulativeAssessment | null => {
  if (reports.length === 0) {
    return null;
  }

  const totalQuestionsAnswered = reports.reduce(
    (sum, report) => sum + report.totalQuestions,
    0,
  );

  const averageRawPercentage =
    reports.reduce((sum, report) => sum + (report.rawCorrect / report.totalQuestions) * 100, 0) /
    reports.length;

  const averageScaledScore =
    reports.reduce((sum, report) => sum + report.scaledScore, 0) / reports.length;

  const trend = toTrend(reports[0].scaledScore, reports[reports.length - 1].scaledScore);
  const domainTrends = buildDomainTrends(reports);
  const persistentWeakTopics = buildPersistentWeakTopics(reports);

  const domainAverages = domainTrends.map((domainTrend) => {
    const total = domainTrend.percentagesByRun.reduce((sum, value) => sum + value, 0);
    return total / Math.max(1, domainTrend.percentagesByRun.length);
  });

  const readyForRealExam =
    reports.length >= 2 && domainAverages.every((percentage) => percentage >= 80);

  const recommendedFocus = persistentWeakTopics
    .slice(0, 3)
    .map((item) => item.topic);

  return {
    totalRuns: reports.length,
    totalQuestionsAnswered,
    averageRawPercentage: Math.round(averageRawPercentage * 10) / 10,
    averageScaledScore: Math.round(averageScaledScore),
    trend,
    domainTrends,
    persistentWeakTopics,
    readyForRealExam,
    recommendedFocus,
  };
};

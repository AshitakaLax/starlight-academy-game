import { gameConfig } from "../../config/gameConfig.js";

function normalizeScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
}

function normalizeStars(value) {
  return Number.isInteger(value) && value >= 0 && value <= 3 ? value : 0;
}

function normalizeRun(run) {
  if (!run || typeof run !== "object") return null;
  const traceAccuracyScore = normalizeScore(run.traceAccuracyScore);
  const rhythmTimingScore = normalizeScore(run.rhythmTimingScore);
  const combinedScore = normalizeScore(run.combinedScore);
  if (traceAccuracyScore === null || rhythmTimingScore === null || combinedScore === null) return null;
  return Object.freeze({
    traceAccuracyScore,
    rhythmTimingScore,
    combinedScore,
    starRating: normalizeStars(run.starRating)
  });
}

export function createInitialGymnasticsState() {
  return { routines: {} };
}

/** Read saved routine records defensively; unknown IDs and malformed runs are ignored. */
export function selectGymnasticsProgress(state, routineCatalog) {
  if (!routineCatalog || typeof routineCatalog.list !== "function") {
    throw new TypeError("selectGymnasticsProgress requires a routine catalog.");
  }
  const stored = state?.gymnastics?.routines && typeof state.gymnastics.routines === "object"
    ? state.gymnastics.routines : {};
  const routines = {};
  for (const routine of routineCatalog.list()) {
    const raw = stored[routine.id] && typeof stored[routine.id] === "object" ? stored[routine.id] : {};
    const personalBestRaw = raw.personalBest && typeof raw.personalBest === "object" ? raw.personalBest : {};
    const lastRun = normalizeRun(raw.lastRun);
    const history = Array.isArray(raw.recentRuns)
      ? raw.recentRuns.map(normalizeRun).filter(Boolean).slice(-gameConfig.gymnastics.completedHistoryLimit)
      : [];
    routines[routine.id] = Object.freeze({
      completedRuns: Number.isSafeInteger(raw.completedRuns) && raw.completedRuns >= 0 ? raw.completedRuns : 0,
      personalBest: Object.freeze({
        traceAccuracyScore: normalizeScore(personalBestRaw.traceAccuracyScore) ?? 0,
        rhythmTimingScore: normalizeScore(personalBestRaw.rhythmTimingScore) ?? 0,
        combinedScore: normalizeScore(personalBestRaw.combinedScore) ?? 0,
        starRating: normalizeStars(personalBestRaw.starRating)
      }),
      lastRun,
      recentRuns: Object.freeze(history)
    });
  }
  return Object.freeze({ routines: Object.freeze(routines) });
}

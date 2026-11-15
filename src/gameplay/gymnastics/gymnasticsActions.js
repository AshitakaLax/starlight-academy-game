import { isPlainObject } from "../../core/state/stateUtils.js";
import { gameConfig } from "../../config/gameConfig.js";
import { selectGymnasticsProgress } from "./gymnasticsState.js";

function calculateCombinedScore(traceAccuracyScore, rhythmTimingScore) {
  const weights = gameConfig.gymnastics.scoreWeights;
  return Math.round(traceAccuracyScore * weights.trace + rhythmTimingScore * weights.rhythm);
}

function calculateStarRating(score) {
  return gameConfig.gymnastics.starThresholds.reduce((stars, threshold) => stars + (score >= threshold ? 1 : 0), 0);
}

export function createGymnasticsActionDefinitions({ routineCatalog } = {}) {
  if (!routineCatalog || typeof routineCatalog.has !== "function" || typeof routineCatalog.list !== "function") {
    throw new TypeError("createGymnasticsActionDefinitions requires a routine catalog.");
  }
  return Object.freeze({
    "gymnastics/routine-completed": Object.freeze({
      validate(payload) {
        return isPlainObject(payload) && Object.keys(payload).length === 3
          && Object.keys(payload).every((key) => ["routineId", "traceAccuracyScore", "rhythmTimingScore"].includes(key))
          && typeof payload.routineId === "string" && routineCatalog.has(payload.routineId)
          && Number.isInteger(payload.traceAccuracyScore) && payload.traceAccuracyScore >= 0 && payload.traceAccuracyScore <= 100
          && Number.isInteger(payload.rhythmTimingScore) && payload.rhythmTimingScore >= 0 && payload.rhythmTimingScore <= 100
          ? true : "gymnastics/routine-completed expects a registered routine and two scores from 0 to 100.";
      },
      reduce(state, payload) {
        const progress = selectGymnasticsProgress(state, routineCatalog);
        const current = progress.routines[payload.routineId];
        const combinedScore = calculateCombinedScore(payload.traceAccuracyScore, payload.rhythmTimingScore);
        const starRating = calculateStarRating(combinedScore);
        const run = Object.freeze({
          traceAccuracyScore: payload.traceAccuracyScore,
          rhythmTimingScore: payload.rhythmTimingScore,
          combinedScore,
          starRating
        });
        const nextRoutine = Object.freeze({
          completedRuns: Math.min(Number.MAX_SAFE_INTEGER, current.completedRuns + 1),
          personalBest: Object.freeze({
            traceAccuracyScore: Math.max(current.personalBest.traceAccuracyScore, run.traceAccuracyScore),
            rhythmTimingScore: Math.max(current.personalBest.rhythmTimingScore, run.rhythmTimingScore),
            combinedScore: Math.max(current.personalBest.combinedScore, run.combinedScore),
            starRating: Math.max(current.personalBest.starRating, run.starRating)
          }),
          lastRun: run,
          recentRuns: Object.freeze([...current.recentRuns, run].slice(-gameConfig.gymnastics.completedHistoryLimit))
        });
        const domain = isPlainObject(state.gymnastics) ? state.gymnastics : {};
        return {
          ...state,
          gymnastics: {
            ...domain,
            routines: {
              ...(isPlainObject(domain.routines) ? domain.routines : {}),
              [payload.routineId]: nextRoutine
            }
          }
        };
      }
    })
  });
}

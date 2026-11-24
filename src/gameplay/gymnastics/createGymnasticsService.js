import { gameConfig } from "../../config/gameConfig.js";
import { createGymnasticsEngine } from "./gymnasticsEngine.js";
import { selectGymnasticsProgress } from "./gymnasticsState.js";

export function createGymnasticsService({ store, routineCatalog } = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.dispatch !== "function") {
    throw new TypeError("createGymnasticsService requires a compatible game store.");
  }
  if (!routineCatalog || typeof routineCatalog.get !== "function" || typeof routineCatalog.list !== "function") {
    throw new TypeError("createGymnasticsService requires a routine catalog.");
  }

  const sessions = new WeakSet();
  const recordedSessions = new WeakSet();

  function getProgress() {
    return selectGymnasticsProgress(store.getState(), routineCatalog);
  }

  function getSnapshot() {
    const progress = getProgress();
    return Object.freeze({
      routines: Object.freeze(routineCatalog.list().map((routine) => Object.freeze({
        ...routine,
        progress: progress.routines[routine.id]
      })))
    });
  }

  function createSession(routineId) {
    const routine = routineCatalog.get(routineId);
    if (!routine) throw new RangeError("Unknown gymnastics routine: " + routineId);
    const session = createGymnasticsEngine({ routine, config: gameConfig.gymnastics });
    sessions.add(session);
    return session;
  }

  function recordCompletion(session) {
    if (!session || typeof session.getSnapshot !== "function" || !sessions.has(session)) {
      throw new TypeError("recordCompletion requires a session created by this service.");
    }
    if (recordedSessions.has(session)) {
      return Object.freeze({ recorded: false, reason: "already-recorded", progress: getProgress() });
    }
    const result = session.getSnapshot();
    if (!result.completed || result.stage !== "completed") {
      throw new Error("A gymnastics routine must reach completion before its scores can be recorded.");
    }
    store.dispatch({
      type: "gymnastics/routine-completed",
      payload: {
        routineId: result.routineId,
        traceAccuracyScore: result.traceAccuracyScore,
        rhythmTimingScore: result.rhythmTimingScore
      }
    });
    recordedSessions.add(session);
    return Object.freeze({
      recorded: true,
      routineId: result.routineId,
      result,
      progress: getProgress().routines[result.routineId]
    });
  }

  return Object.freeze({ getSnapshot, getProgress, createSession, recordCompletion });
}

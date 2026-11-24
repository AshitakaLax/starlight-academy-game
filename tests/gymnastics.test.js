import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import { gameConfig } from "../src/config/gameConfig.js";
import { createGymnasticsRoutine, createGymnasticsRoutineCatalog, defaultGymnasticsRoutines } from "../src/gameplay/gymnastics/gymnasticsCatalog.js";
import { createGymnasticsEngine } from "../src/gameplay/gymnastics/gymnasticsEngine.js";
import { createInitialGymnasticsState, selectGymnasticsProgress } from "../src/gameplay/gymnastics/gymnasticsState.js";
import { createGymnasticsActionDefinitions } from "../src/gameplay/gymnastics/gymnasticsActions.js";
import { createGymnasticsService } from "../src/gameplay/gymnastics/createGymnasticsService.js";

const routineCatalog = createGymnasticsRoutineCatalog(defaultGymnasticsRoutines);
const routine = routineCatalog.list()[0];
const beatIntervalMs = 60000 / routine.bpm;
const countInDurationMs = routine.countInBeats * beatIntervalMs;

function makeHarness(saved = null) {
  const defaults = {
    ...createInitialGameState(),
    gymnastics: createInitialGymnasticsState()
  };
  const initialState = saved ? mergeGameStateDefaults(defaults, saved) : defaults;
  const store = createGameStore({
    initialState,
    actions: createGymnasticsActionDefinitions({ routineCatalog })
  });
  const service = createGymnasticsService({ store, routineCatalog });
  return { store, service };
}

function beginTracing(engine, startAt = 0) {
  engine.start(startAt);
  engine.update(startAt + countInDurationMs + 1);
}

function traceRoutine(engine) {
  for (const point of routine.tracePath) engine.recordTracePoint(point);
}

function completeWithNoBeats(engine, startAt = 0, trace = true) {
  beginTracing(engine, startAt);
  if (trace) traceRoutine(engine);
  const rhythmStart = startAt + countInDurationMs + 1;
  engine.finishTrace(rhythmStart);
  const finalCheckpoint = routine.beatCheckpoints.at(-1) * beatIntervalMs;
  return engine.update(rhythmStart + finalCheckpoint + gameConfig.gymnastics.timingWindowMs + 1);
}

function completeWithPerfectBeats(engine, startAt = 0) {
  beginTracing(engine, startAt);
  traceRoutine(engine);
  const rhythmStart = startAt + countInDurationMs + 1;
  engine.finishTrace(rhythmStart);
  for (const beat of routine.beatCheckpoints) {
    const result = engine.tapBeat(rhythmStart + beat * beatIntervalMs);
    assert.equal(result.accepted, true);
  }
  return engine.update(rhythmStart + routine.beatCheckpoints.at(-1) * beatIntervalMs
    + gameConfig.gymnastics.timingWindowMs + 1);
}

test("routine catalog registers a valid data-driven ribbon routine", () => {
  assert.equal(routineCatalog.list().length, 1);
  assert.equal(routine.id, "routine.starlight-ribbon");
  assert.equal(routine.bpm, 96);
  assert.equal(routine.countInBeats, 4);
  assert.ok(routine.tracePath.length >= 2);
  assert.ok(routine.beatCheckpoints.length >= 2);
  assert.equal(routineCatalog.get(routine.id), routine);
  assert.equal(routineCatalog.has("routine.unknown"), false);
});

test("routine definitions reject invalid identifiers, tempo, path points, and beat order", () => {
  assert.throws(() => createGymnasticsRoutine({ ...routine, id: "bad-id" }), /routine namespace/);
  assert.throws(() => createGymnasticsRoutine({ ...routine, bpm: 200 }), /40 and 180/);
  assert.throws(() => createGymnasticsRoutine({ ...routine, tracePath: [{ x: 2, y: 0 }, { x: 1, y: 1 }] }), /normalized points/);
  assert.throws(() => createGymnasticsRoutine({ ...routine, beatCheckpoints: [0, 2, 2] }), /increasing/);
  assert.throws(() => createGymnasticsRoutineCatalog([routine, routine]), /already registered/);
});

test("routine preview advances through a count-in before enabling tracing", () => {
  const engine = createGymnasticsEngine({ routine });
  assert.equal(engine.getSnapshot().stage, "preview");
  assert.throws(() => engine.recordTracePoint({ x: 0.1, y: 0.1 }), /tracing stage/);
  engine.start(500);
  assert.equal(engine.getSnapshot().stage, "count-in");
  assert.equal(engine.getSnapshot().countInBeat, 4);
  engine.update(500 + beatIntervalMs);
  assert.equal(engine.getSnapshot().countInBeat, 3);
  engine.update(500 + countInDurationMs);
  assert.equal(engine.getSnapshot().stage, "tracing");
});

test("tracing accuracy is computed independently from rhythm timing", () => {
  const engine = createGymnasticsEngine({ routine });
  beginTracing(engine);
  assert.throws(() => engine.recordTracePoint({ x: 1.2, y: 0.2 }), /normalized/);
  traceRoutine(engine);
  const snapshot = engine.finishTrace(countInDurationMs + 1);
  assert.equal(snapshot.stage, "rhythm");
  assert.equal(snapshot.traceAccuracyScore, 100);
  assert.equal(snapshot.rhythmTimingScore, null);
  assert.equal(snapshot.combinedScore, null);
  assert.equal(snapshot.checkpoints.every((checkpoint) => checkpoint.status === "pending"), true);
});

test("a trace can be skipped without blocking entry to the rhythm stage", () => {
  const engine = createGymnasticsEngine({ routine });
  beginTracing(engine);
  const snapshot = engine.finishTrace(countInDurationMs + 1);
  assert.equal(snapshot.stage, "rhythm");
  assert.equal(snapshot.traceAccuracyScore, 0);
});

test("lenient rhythm windows accept early or late taps and score precision separately", () => {
  const engine = createGymnasticsEngine({ routine });
  beginTracing(engine);
  const rhythmStart = countInDurationMs + 1;
  engine.finishTrace(rhythmStart);
  assert.equal(engine.tapBeat(rhythmStart + 200).accepted, true);
  assert.equal(engine.tapBeat(rhythmStart + beatIntervalMs - 200).accepted, true);
  const snapshot = engine.getSnapshot();
  assert.equal(snapshot.checkpoints[0].offsetMs, 200);
  assert.equal(snapshot.checkpoints[1].offsetMs, -200);
  assert.equal(snapshot.rhythmTimingScore, null);
});

test("a tap on the inclusive timing-window boundary is accepted", () => {
  const engine = createGymnasticsEngine({ routine });
  beginTracing(engine);
  const rhythmStart = countInDurationMs + 1;
  engine.finishTrace(rhythmStart);
  const boundary = rhythmStart + gameConfig.gymnastics.timingWindowMs;
  assert.equal(engine.tapBeat(boundary).accepted, true);
  assert.equal(engine.getSnapshot().checkpoints[0].status, "hit");
});

test("tapping outside the lenient window does not consume the next checkpoint", () => {
  const engine = createGymnasticsEngine({ routine });
  beginTracing(engine);
  const rhythmStart = countInDurationMs + 1;
  engine.finishTrace(rhythmStart);
  const result = engine.tapBeat(rhythmStart + gameConfig.gymnastics.timingWindowMs + 1);
  assert.equal(result.accepted, false);
  assert.equal(engine.getSnapshot().checkpoints[0].status, "missed");
  assert.equal(engine.getSnapshot().checkpoints[1].status, "pending");
});

test("perfect tracing and on-beat taps produce independent 100 scores and three stars", () => {
  const engine = createGymnasticsEngine({ routine });
  const result = completeWithPerfectBeats(engine);
  assert.equal(result.stage, "completed");
  assert.equal(result.traceAccuracyScore, 100);
  assert.equal(result.rhythmTimingScore, 100);
  assert.equal(result.combinedScore, 100);
  assert.equal(result.starRating, 3);
  assert.equal(result.completed, true);
});

test("missing every beat still completes the routine and preserves the trace score", () => {
  const engine = createGymnasticsEngine({ routine });
  const result = completeWithNoBeats(engine, 0, true);
  assert.equal(result.stage, "completed");
  assert.equal(result.traceAccuracyScore, 100);
  assert.equal(result.rhythmTimingScore, 0);
  assert.equal(result.combinedScore, 50);
  assert.equal(result.starRating, 1);
  assert.equal(result.checkpoints.every((checkpoint) => checkpoint.status === "missed"), true);
});

test("missing every cue and skipping the trace still reaches a zero-star completion", () => {
  const engine = createGymnasticsEngine({ routine });
  const result = completeWithNoBeats(engine, 0, false);
  assert.equal(result.completed, true);
  assert.equal(result.traceAccuracyScore, 0);
  assert.equal(result.rhythmTimingScore, 0);
  assert.equal(result.combinedScore, 0);
  assert.equal(result.starRating, 0);
});

test("routine timestamps must be finite, non-negative, and monotonic", () => {
  const engine = createGymnasticsEngine({ routine });
  assert.throws(() => engine.start(-1), /non-negative/);
  engine.start(100);
  assert.throws(() => engine.update(99), /monotonic/);
  assert.throws(() => engine.update(Number.NaN), /finite/);
});

test("gymnastics configuration keeps weighted scores and star thresholds centralized", () => {
  assert.equal(gameConfig.gymnastics.scoreWeights.trace + gameConfig.gymnastics.scoreWeights.rhythm, 1);
  assert.deepEqual(gameConfig.gymnastics.starThresholds, [50, 70, 90]);
  assert.ok(gameConfig.gymnastics.timingWindowMs >= 200);
});

test("service records completed runs once and keeps independent personal bests", () => {
  const { service } = makeHarness();
  const missed = service.createSession(routine.id);
  completeWithNoBeats(missed);
  const first = service.recordCompletion(missed);
  assert.equal(first.recorded, true);
  assert.equal(first.progress.completedRuns, 1);
  assert.equal(first.progress.lastRun.traceAccuracyScore, 100);
  assert.equal(first.progress.lastRun.rhythmTimingScore, 0);
  assert.equal(first.progress.personalBest.traceAccuracyScore, 100);
  assert.equal(first.progress.personalBest.rhythmTimingScore, 0);
  assert.equal(service.recordCompletion(missed).recorded, false);

  const perfect = service.createSession(routine.id);
  completeWithPerfectBeats(perfect);
  const second = service.recordCompletion(perfect);
  assert.equal(second.progress.completedRuns, 2);
  assert.equal(second.progress.personalBest.rhythmTimingScore, 100);
  assert.equal(second.progress.personalBest.combinedScore, 100);
  assert.equal(second.progress.personalBest.starRating, 3);

  const laterMissed = service.createSession(routine.id);
  completeWithNoBeats(laterMissed, 10000, false);
  const third = service.recordCompletion(laterMissed);
  assert.equal(third.progress.completedRuns, 3);
  assert.equal(third.progress.personalBest.combinedScore, 100);
  assert.equal(third.progress.personalBest.traceAccuracyScore, 100);
  assert.equal(third.progress.lastRun.combinedScore, 0);
});

test("service rejects unfinished or foreign sessions", () => {
  const { service } = makeHarness();
  const session = service.createSession(routine.id);
  session.start(0);
  assert.throws(() => service.recordCompletion(session), /must reach completion/);
  assert.throws(() => service.recordCompletion(createGymnasticsEngine({ routine })), /session created by this service/);
});

test("routine action rejects forged IDs, invalid scores, and extra payload fields", () => {
  const { store } = makeHarness();
  assert.throws(() => store.dispatch({
    type: "gymnastics/routine-completed",
    payload: { routineId: "routine.missing", traceAccuracyScore: 100, rhythmTimingScore: 100 }
  }), /registered routine/);
  assert.throws(() => store.dispatch({
    type: "gymnastics/routine-completed",
    payload: { routineId: routine.id, traceAccuracyScore: 101, rhythmTimingScore: 100 }
  }), /scores from 0 to 100/);
  assert.throws(() => store.dispatch({
    type: "gymnastics/routine-completed",
    payload: { routineId: routine.id, traceAccuracyScore: 100, rhythmTimingScore: 100, starRating: 3 }
  }), /scores from 0 to 100/);
});

test("gymnastics progress survives save serialization and legacy defaults are merged", () => {
  const original = makeHarness();
  const session = original.service.createSession(routine.id);
  completeWithPerfectBeats(session);
  original.service.recordCompletion(session);
  const serialized = JSON.parse(JSON.stringify(original.store.getState()));

  const restored = makeHarness(serialized);
  const progress = restored.service.getProgress().routines[routine.id];
  assert.equal(progress.completedRuns, 1);
  assert.equal(progress.personalBest.traceAccuracyScore, 100);
  assert.equal(progress.personalBest.rhythmTimingScore, 100);
  assert.equal(progress.lastRun.starRating, 3);

  const legacy = mergeGameStateDefaults({
    ...createInitialGameState(),
    gymnastics: createInitialGymnasticsState()
  }, { app: { screenId: "academy" } });
  assert.deepEqual(selectGymnasticsProgress(legacy, routineCatalog).routines[routine.id].recentRuns, []);
});

test("saved progress ignores malformed runs and unknown routine identifiers", () => {
  const state = {
    gymnastics: {
      routines: {
        [routine.id]: {
          completedRuns: -2,
          personalBest: { traceAccuracyScore: 500, rhythmTimingScore: 45, combinedScore: 60, starRating: 8 },
          lastRun: { traceAccuracyScore: 101, rhythmTimingScore: 20, combinedScore: 30, starRating: 1 },
          recentRuns: [{ traceAccuracyScore: 30, rhythmTimingScore: 40, combinedScore: 35, starRating: 0 }]
        },
        "routine.unknown": { completedRuns: 999 }
      }
    }
  };
  const progress = selectGymnasticsProgress(state, routineCatalog).routines[routine.id];
  assert.equal(progress.completedRuns, 0);
  assert.equal(progress.personalBest.traceAccuracyScore, 0);
  assert.equal(progress.personalBest.rhythmTimingScore, 45);
  assert.equal(progress.personalBest.starRating, 0);
  assert.equal(progress.lastRun, null);
  assert.equal(progress.recentRuns.length, 1);
});

import { gameConfig } from "../../config/gameConfig.js";

function assertTimestamp(nowMs, previous = null) {
  if (!Number.isFinite(nowMs) || nowMs < 0) throw new TypeError("A routine timestamp must be a non-negative finite number.");
  if (previous !== null && nowMs < previous) throw new RangeError("Routine timestamps must be monotonic.");
  return nowMs;
}

function distance(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance(point, start);
  const projection = Math.max(0, Math.min(1,
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return distance(point, { x: start.x + projection * dx, y: start.y + projection * dy });
}

function samplePath(path, spacing) {
  const samples = [path[0]];
  for (let index = 1; index < path.length; index += 1) {
    const start = path[index - 1];
    const end = path[index];
    const steps = Math.max(1, Math.ceil(distance(start, end) / spacing));
    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;
      samples.push({
        x: start.x + (end.x - start.x) * fraction,
        y: start.y + (end.y - start.y) * fraction
      });
    }
  }
  return samples;
}

function scoreTrace(targets, trace, tolerance) {
  if (trace.length === 0) return 0;
  let covered = 0;
  for (const target of targets) {
    let nearest = Infinity;
    if (trace.length === 1) {
      nearest = distance(target, trace[0]);
    } else {
      for (let index = 1; index < trace.length; index += 1) {
        nearest = Math.min(nearest, distanceToSegment(target, trace[index - 1], trace[index]));
      }
    }
    if (nearest <= tolerance) covered += 1;
  }
  return Math.round((covered / targets.length) * 100);
}

function deriveCombinedScore(traceAccuracyScore, rhythmTimingScore, config) {
  const weights = config.scoreWeights;
  return Math.round(traceAccuracyScore * weights.trace + rhythmTimingScore * weights.rhythm);
}

function deriveStarRating(score, thresholds) {
  return thresholds.reduce((stars, threshold) => stars + (score >= threshold ? 1 : 0), 0);
}

function validateConfig(config) {
  if (!config || !Number.isFinite(config.traceTolerance) || config.traceTolerance <= 0 || config.traceTolerance > 0.5
      || !Number.isFinite(config.traceSampleSpacing) || config.traceSampleSpacing <= 0 || config.traceSampleSpacing > 0.25
      || !Number.isFinite(config.timingWindowMs) || config.timingWindowMs < 50 || config.timingWindowMs > 1000
      || !config.scoreWeights || !Number.isFinite(config.scoreWeights.trace)
      || !Number.isFinite(config.scoreWeights.rhythm) || config.scoreWeights.trace < 0
      || config.scoreWeights.rhythm < 0
      || Math.abs(config.scoreWeights.trace + config.scoreWeights.rhythm - 1) > 0.000001
      || !Array.isArray(config.starThresholds) || config.starThresholds.length !== 3
      || !config.starThresholds.every((value, index) => Number.isInteger(value) && value >= 1 && value <= 100
        && (index === 0 || value > config.starThresholds[index - 1]))) {
    throw new TypeError("Gymnastics scoring configuration is invalid.");
  }
}

/**
 * Deterministic routine state machine. The host supplies timestamps, so count-in
 * and beat windows do not depend on animation-frame frequency.
 */
export function createGymnasticsEngine({ routine, config = gameConfig.gymnastics } = {}) {
  if (!routine || typeof routine.id !== "string" || !Array.isArray(routine.tracePath)
      || !Array.isArray(routine.beatCheckpoints)) {
    throw new TypeError("createGymnasticsEngine requires a validated routine.");
  }
  validateConfig(config);
  const beatIntervalMs = 60000 / routine.bpm;
  const countInDurationMs = routine.countInBeats * beatIntervalMs;
  const traceTargets = samplePath(routine.tracePath, config.traceSampleSpacing);
  let stage = "preview";
  let startedAtMs = null;
  let rhythmStartedAtMs = null;
  let lastTimestamp = null;
  let tracePoints = [];
  let traceAccuracyScore = null;
  let rhythmTimingScore = null;
  let combinedScore = null;
  let starRating = null;
  let checkpoints = [];

  function reset() {
    stage = "preview";
    startedAtMs = null;
    rhythmStartedAtMs = null;
    lastTimestamp = null;
    tracePoints = [];
    traceAccuracyScore = null;
    rhythmTimingScore = null;
    combinedScore = null;
    starRating = null;
    checkpoints = routine.beatCheckpoints.map((beat, index) => ({
      id: routine.id + ".beat-" + (index + 1),
      beat,
      atMs: Math.round(beat * beatIntervalMs),
      status: "pending",
      offsetMs: null
    }));
  }
  reset();

  function update(nowMs) {
    const now = assertTimestamp(nowMs, lastTimestamp);
    lastTimestamp = now;
    if (stage === "count-in" && now - startedAtMs >= countInDurationMs) {
      stage = "tracing";
    }
    if (stage === "rhythm") {
      const elapsed = now - rhythmStartedAtMs;
      for (const checkpoint of checkpoints) {
        if (checkpoint.status === "pending" && elapsed > checkpoint.atMs + config.timingWindowMs) {
          checkpoint.status = "missed";
        }
      }
      const lastCheckpoint = checkpoints.at(-1);
      if (lastCheckpoint && elapsed > lastCheckpoint.atMs + config.timingWindowMs
          && checkpoints.every((checkpoint) => checkpoint.status !== "pending")) {
        rhythmTimingScore = Math.round(checkpoints.reduce((total, checkpoint) => {
          if (checkpoint.status !== "hit") return total;
          const precision = 1 - Math.min(1, Math.abs(checkpoint.offsetMs) / config.timingWindowMs) * 0.35;
          return total + precision * 100;
        }, 0) / checkpoints.length);
        combinedScore = deriveCombinedScore(traceAccuracyScore ?? 0, rhythmTimingScore, config);
        starRating = deriveStarRating(combinedScore, config.starThresholds);
        stage = "completed";
      }
    }
    return getSnapshot();
  }

  function start(nowMs) {
    if (stage !== "preview" && stage !== "completed") {
      throw new Error("A routine can only start from preview or after completion.");
    }
    reset();
    const now = assertTimestamp(nowMs);
    lastTimestamp = now;
    startedAtMs = now;
    stage = "count-in";
    return getSnapshot();
  }

  function recordTracePoint(point) {
    if (stage !== "tracing") throw new Error("Trace points can only be added during the tracing stage.");
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)
        || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
      throw new TypeError("A trace point must contain normalized x and y coordinates from 0 to 1.");
    }
    tracePoints.push(Object.freeze({ x: point.x, y: point.y }));
    return tracePoints.length;
  }

  function finishTrace(nowMs) {
    update(nowMs);
    if (stage !== "tracing") throw new Error("The count-in must finish before tracing can be completed.");
    traceAccuracyScore = scoreTrace(traceTargets, tracePoints, config.traceTolerance);
    rhythmStartedAtMs = lastTimestamp;
    stage = "rhythm";
    return getSnapshot();
  }

  function tapBeat(nowMs) {
    update(nowMs);
    if (stage !== "rhythm") return Object.freeze({ accepted: false, reason: "not-in-rhythm-stage", snapshot: getSnapshot() });
    const elapsed = lastTimestamp - rhythmStartedAtMs;
    let nearest = null;
    for (const checkpoint of checkpoints) {
      if (checkpoint.status !== "pending") continue;
      const offset = elapsed - checkpoint.atMs;
      if (Math.abs(offset) <= config.timingWindowMs
          && (!nearest || Math.abs(offset) < Math.abs(nearest.offsetMs))) {
        nearest = { checkpoint, offsetMs: offset };
      }
    }
    if (!nearest) {
      const next = checkpoints.find((checkpoint) => checkpoint.status === "pending");
      return Object.freeze({
        accepted: false,
        reason: next && elapsed < next.atMs - config.timingWindowMs ? "too-early" : "outside-timing-window",
        snapshot: getSnapshot()
      });
    }
    nearest.checkpoint.status = "hit";
    nearest.checkpoint.offsetMs = Math.round(nearest.offsetMs);
    return Object.freeze({ accepted: true, reason: "beat-recorded", checkpointId: nearest.checkpoint.id, snapshot: getSnapshot() });
  }

  function getSnapshot() {
    const elapsedCountIn = stage === "count-in" ? Math.max(0, lastTimestamp - startedAtMs) : 0;
    const countInBeat = stage === "count-in"
      ? Math.max(1, routine.countInBeats - Math.floor(elapsedCountIn / beatIntervalMs))
      : null;
    const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.status === "pending") ?? null;
    return Object.freeze({
      routineId: routine.id,
      stage,
      countInBeat,
      beatIntervalMs,
      tracePointCount: tracePoints.length,
      tracePoints: Object.freeze(tracePoints.map((point) => Object.freeze({ ...point }))),
      traceAccuracyScore,
      rhythmTimingScore,
      combinedScore,
      starRating,
      nextCheckpointId: nextCheckpoint?.id ?? null,
      checkpoints: Object.freeze(checkpoints.map((checkpoint) => Object.freeze({ ...checkpoint }))),
      completed: stage === "completed"
    });
  }

  return Object.freeze({
    start,
    update,
    recordTracePoint,
    finishTrace,
    tapBeat,
    reset,
    getSnapshot
  });
}

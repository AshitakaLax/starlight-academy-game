/**
 * Gymnastics routine engine: preview, count-in, trace path, beat checkpoints,
 * lenient timing windows, separate accuracy/timing scores, combined score, stars.
 */
import { CONFIG } from "../../systems/config/config.js";

export class GymnasticsEngine {
  constructor() {
    this.routineId = null;
    this.state = "idle"; // idle | preview | countin | running | complete
    this.intendedPath = [];
    this.tracePoints = [];
    this.checkpoints = []; // { atMs, position, hit }
    this.startedAt = 0;
    this.countInMs = 2000;
    this.tempoMs = 500;
  }

  preview(routineId, intendedPath = [], checkpoints = []) {
    this.routineId = routineId;
    this.intendedPath = intendedPath;
    this.checkpoints = checkpoints.map((c) => ({ ...c, hit: false, delta: null }));
    this.tracePoints = [];
    this.state = "preview";
    return { state: this.state };
  }

  countIn() {
    this.state = "countin";
    this.startedAt = performance.now() + this.countInMs;
    return { state: this.state, countInMs: this.countInMs };
  }

  start() {
    this.state = "running";
    this.startedAt = performance.now();
    this.tracePoints = [];
    this.checkpoints.forEach((c) => { c.hit = false; c.delta = null; });
    return { state: this.state };
  }

  recordTrace(point) {
    if (this.state !== "running") return;
    this.tracePoints.push({ ...point, t: performance.now() - this.startedAt });
  }

  hitCheckpoint(index, timeMs) {
    const cp = this.checkpoints[index];
    if (!cp) return { ok: false };
    const expected = cp.atMs;
    const delta = timeMs - expected;
    const window = CONFIG.gymnastics.timingWindowsMs.standard;
    cp.delta = delta;
    cp.hit = Math.abs(delta) <= window;
    return { ok: true, hit: cp.hit, delta };
  }

  // Routine always completes; never throws or blocks.
  finish() {
    this.state = "complete";
    const tracing = this.computeTracing();
    const rhythm = this.computeRhythm();
    const combined = Math.round((tracing + rhythm) / 2);
    const stars = this.stars(tracing, rhythm);
    return { routineId: this.routineId, tracing, rhythm, combined, stars, completed: true };
  }

  computeTracing() {
    if (!this.intendedPath?.length || !this.tracePoints?.length) return 0;
    let total = 0;
    for (const p of this.tracePoints) {
      let min = Infinity;
      for (const q of this.intendedPath) {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < min) min = d;
      }
      total += min;
    }
    const avg = total / this.tracePoints.length;
    return Math.max(0, Math.min(100, Math.round(100 - avg * 2)));
  }

  computeRhythm() {
    const deltas = this.checkpoints.map((c) => c.delta).filter((d) => d !== null);
    if (!deltas.length) return 0;
    const window = CONFIG.gymnastics.timingWindowsMs.standard;
    let total = 0;
    for (const d of deltas) {
      const ad = Math.abs(d);
      if (ad <= window * 2) total += 100 * (1 - ad / (window * 2));
    }
    return Math.round(total / deltas.length);
  }

  stars(tracing, rhythm) {
    const t = CONFIG.gymnastics.starThresholds;
    if (tracing >= t.threeStar.tracing && rhythm >= t.threeStar.rhythm) return 3;
    if (tracing >= t.twoStar.tracing && rhythm >= t.twoStar.rhythm) return 2;
    return 1;
  }
}
export default GymnasticsEngine;

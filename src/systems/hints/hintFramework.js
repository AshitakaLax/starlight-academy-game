/**
 * Configurable hint framework with escalation and Professor Hoot demonstrations.
 */
import { HintEngine } from "./hintEngine.js";

export class HintFramework {
  constructor(narrationEngine = null) {
    this.engine = new HintEngine();
    this.narration = narrationEngine;
    /** @type {Map<string, Array>} */
    this.steps = new Map();
  }

  register(activityKey, steps) {
    this.steps.set(activityKey, Array.isArray(steps) ? steps : []);
    this.engine.reset(activityKey);
  }

  recordIncorrect(activityKey) {
    const count = this.engine.recordIncorrect(activityKey);
    const stage = this.engine.stage(activityKey);
    const steps = this.steps.get(activityKey) || [];
    const step = steps[Math.min(count - 1, steps.length - 1)] || null;
    if (step && typeof step.narrate === "string" && this.narration) {
      this.narration.speak(step.narrate);
    }
    return { count, stage, step, blocked: false };
  }

  demonstrate(activityKey) {
    const steps = this.steps.get(activityKey) || [];
    const demo = steps.find((s) => s && s.type === "demonstration") || steps[steps.length - 1] || null;
    if (demo && demo.narrate && this.narration) this.narration.speak(demo.narrate);
    return { demonstration: demo, canRetry: true, blocked: false };
  }

  reset(activityKey) {
    this.engine.reset(activityKey);
  }

  isBlocked() {
    return false;
  }
}
export default HintFramework;

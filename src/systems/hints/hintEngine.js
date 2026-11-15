/**
 * Hint escalation framework. Activities provide hint steps; engine tracks attempt count.
 */
export class HintEngine {
  constructor() {
    this.attempts = new Map(); // key -> count
  }

  reset(key) {
    this.attempts.delete(key);
  }

  recordIncorrect(key) {
    const c = (this.attempts.get(key) || 0) + 1;
    this.attempts.set(key, c);
    return c;
  }

  stage(key) {
    const c = this.attempts.get(key) || 0;
    if (c <= 1) return "gentle";
    if (c === 2) return "clue";
    return "demonstrate";
  }

  canRetry() {
    return true;
  }
}
export default HintEngine;

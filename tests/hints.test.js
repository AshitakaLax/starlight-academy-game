import test from "node:test";
import assert from "node:assert/strict";
import { HintFramework } from "../src/systems/hints/hintFramework.js";

test("hint escalation stages", () => {
  const hf = new HintFramework();
  hf.register("act", [
    { type: "gentle", text: "try again" },
    { type: "clue", text: "look here" },
    { type: "demonstration", text: "watch", narrate: "watch" },
  ]);
  const r1 = hf.recordIncorrect("act");
  assert.equal(r1.stage, "gentle");
  const r2 = hf.recordIncorrect("act");
  assert.equal(r2.stage, "clue");
  const r3 = hf.recordIncorrect("act");
  assert.equal(r3.stage, "demonstrate");
  const demo = hf.demonstrate("act");
  assert.equal(demo.canRetry, true);
  assert.equal(demo.blocked, false);
  assert.equal(hf.isBlocked(), false);
});

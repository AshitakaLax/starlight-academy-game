import test from "node:test";
import assert from "node:assert/strict";
import { RenderEngine } from "../src/rendering/renderEngine.js";

test("render engine registers layers and masks", () => {
  const re = new RenderEngine(null);
  let drawn = false;
  re.registerLayer("bg", () => { drawn = true; }, 0);
  assert.equal(re.layers.size, 1);
  const mask = re.createMask("clip", 10, 10);
  assert.ok(mask);
  assert.equal(re.getMask("clip").width, 10);
  re.removeLayer("bg");
  assert.equal(re.layers.size, 0);
});

test("stop cancels running state", () => {
  const re = new RenderEngine(null);
  re.running = true;
  re.raf = 123;
  re.stop();
  assert.equal(re.running, false);
  assert.equal(re.raf, null);
});

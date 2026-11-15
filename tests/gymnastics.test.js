import test from "node:test";
import assert from "node:assert/strict";
import { GymnasticsEngine } from "../src/gameplay/gymnastics/gymnasticsEngine.js";

test("routine always completes", () => {
  const g = new GymnasticsEngine();
  g.preview("r1", [{x:0,y:0},{x:10,y:0}], [{atMs:500,position:{x:5,y:0}}]);
  g.countIn();
  g.start();
  g.recordTrace({x:0,y:0});
  g.recordTrace({x:10,y:0});
  g.hitCheckpoint(0, 520);
  const res = g.finish();
  assert.equal(res.completed, true);
  assert.ok(res.stars >= 1);
  assert.equal(typeof res.tracing, "number");
  assert.equal(typeof res.rhythm, "number");
});

test("missed checkpoint does not end routine", () => {
  const g = new GymnasticsEngine();
  g.preview("r2", [], [{atMs:100,position:{x:0,y:0}}]);
  g.start();
  const res = g.finish();
  assert.equal(res.completed, true);
});

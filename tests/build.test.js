import test from "node:test";
import assert from "node:assert/strict";
import { buildGame } from "../build/build.mjs";

test("build emits a self-contained offline HTML document", async () => {
  const result = await buildGame({ write: false });
  const html = result.html;

  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<style>[\s\S]*<\/style>/i);
  assert.match(html, /<script>[\s\S]*<\/script>/i);
  assert.match(html, /Starlight Academy/);
  assert.match(html, /academy-emblem/);
  assert.match(html, /chapterCount\s*:\s*10/);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc\s*=/i);
  assert.doesNotMatch(html, /<link\b[^>]*\bhref\s*=/i);
  assert.doesNotMatch(html, /\b(?:src|href)\s*=\s*["']https?:\/\//i);
  assert.ok(result.javascriptBytes > 0);
  assert.ok(result.cssBytes > 0);
  assert.ok(result.inputFiles.some((file) => file.includes("browser-entry.js")));
});

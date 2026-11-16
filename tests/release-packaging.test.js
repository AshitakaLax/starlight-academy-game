import test from "node:test";
import assert from "node:assert/strict";
import { validateStandaloneHtml } from "../scripts/package-release.mjs";

function validHtml() {
  return `<!doctype html>
<html lang="en">
<head><title>Starlight Academy: Studio of Magic & Motion</title><style>body{margin:0}</style></head>
<body><main id="app"></main><script>
const chapters = 10;
const quests = 20;
const finale = "The Grand Starlight Championship";
const questOne = "The Firefly Gap Maze";
const questNineteen = "The Starlight Skill Matchmaker";
const questTwenty = "The Grand Constellation Planner";
</script></body></html>`;
}

test("release validator accepts a fully embedded standalone academy document", () => {
  const result = validateStandaloneHtml(validHtml());
  assert.deepEqual(result, {
    htmlBytes: Buffer.byteLength(validHtml()),
    inlineStyles: 1,
    inlineScripts: 1,
    chapterCount: 10,
    sideQuestCount: 20,
    remoteRuntimeResources: 0
  });
});

test("release validator rejects external scripts, stylesheets, images, and remote CSS", () => {
  for (const mutation of [
    (html) => html.replace("<script>", '<script src="https://cdn.example/game.js">'),
    (html) => html.replace("</head>", '<link rel="stylesheet" href="style.css"></head>'),
    (html) => html.replace("</body>", '<img src="assets/logo.png"></body>'),
    (html) => html.replace("body{margin:0}", 'body{background:url("https://example.com/bg.png")}')
  ]) {
    assert.throws(() => validateStandaloneHtml(mutation(validHtml())), /external|remote/i);
  }
});

test("release validator rejects template markers, missing content, or incomplete release counts", () => {
  assert.throws(() => validateStandaloneHtml(validHtml().replace("<script>", "%INLINE_JS%<script>")), /template marker/);
  assert.throws(() => validateStandaloneHtml(validHtml().replace("The Grand Starlight Championship", "Finale")), /missing required finale/);
  assert.throws(() => validateStandaloneHtml(validHtml(), { chapterCount: 9, sideQuestCount: 20 }), /must declare all 10 chapters/);
});

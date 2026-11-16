import test from "node:test";
import assert from "node:assert/strict";
import { chapterDefinitions } from "../src/chapters/registry.js";
import { sideQuestDefinitions } from "../src/side-quests/registry.js";
import { buildQuestBoardSnapshot } from "../src/gameplay/chapter-runtime/questBoard.js";

function runtimeEntry(definition, {
  status = "not-started",
  prerequisitesMet = true,
  completedRuns = 0,
  personalBest = null,
  currentActivityIndex = 0,
  lastRun = null
} = {}) {
  return {
    ...definition,
    prerequisitesMet,
    progress: {
      status,
      completedRuns,
      personalBest,
      currentActivityIndex,
      lastRun
    }
  };
}

test("the quest board represents all ten chapters and twenty optional quests", () => {
  const entries = [
    ...chapterDefinitions.map((definition) => runtimeEntry(definition)),
    ...sideQuestDefinitions.map((definition) => runtimeEntry(definition))
  ];
  const board = buildQuestBoardSnapshot({ progressionEntries: entries });

  assert.equal(board.summary.totalCount, 30);
  assert.equal(board.summary.chapterCount, 10);
  assert.equal(board.summary.questCount, 20);
  assert.deepEqual(board.chapters.map((entry) => entry.id), chapterDefinitions.map((entry) => entry.id));
  assert.deepEqual(board.quests.map((entry) => entry.id), sideQuestDefinitions.map((entry) => entry.id));
  assert.equal(Object.isFrozen(board), true);
  assert.equal(Object.isFrozen(board.chapters[0].skills), true);
});

test("chapter and quest status reflects prerequisite availability and saved runtime progress", () => {
  const entries = [
    runtimeEntry(chapterDefinitions[0], { status: "completed" }),
    runtimeEntry(chapterDefinitions[1], { status: "in-progress", prerequisitesMet: true, currentActivityIndex: 2 }),
    runtimeEntry(chapterDefinitions[2], { prerequisitesMet: false }),
    runtimeEntry(sideQuestDefinitions[0], { prerequisitesMet: false }),
    runtimeEntry(sideQuestDefinitions[1], { status: "completed", prerequisitesMet: true })
  ];
  const board = buildQuestBoardSnapshot({ progressionEntries: entries });

  assert.deepEqual(board.chapters.map((entry) => entry.status), ["completed", "in-progress", "locked"]);
  assert.deepEqual(board.quests.map((entry) => entry.status), ["locked", "completed"]);
  assert.equal(board.summary.completed, 2);
  assert.equal(board.summary.inProgress, 1);
  assert.equal(board.summary.locked, 2);
  assert.equal(board.chapters[1].currentActivityIndex, 2);
});

test("the board shows personal-best stars and keeps current replay status separate from the record", () => {
  const personalBest = { scorePercent: 100, starRating: 3, completedActivityCount: 4, skippedActivityCount: 0 };
  const lastRun = { scorePercent: 25, starRating: 0, completedActivityCount: 1, skippedActivityCount: 3 };
  const board = buildQuestBoardSnapshot({
    progressionEntries: [runtimeEntry(chapterDefinitions[0], {
      status: "completed",
      completedRuns: 2,
      personalBest,
      lastRun
    })]
  });
  const [entry] = board.chapters;

  assert.equal(entry.status, "completed");
  assert.equal(entry.completedRuns, 2);
  assert.equal(entry.stars, 3);
  assert.equal(entry.starsLabel, "★★★");
  assert.equal(entry.personalBestScore, 100);
  assert.equal(entry.lastRun.scorePercent, 25);
});

test("skill mastery records summarize demonstrated and developing curriculum skills", () => {
  const chapter = chapterDefinitions[0];
  const state = {
    curriculum: {
      skills: {
        "math.skip-counting": { masteryStatus: "demonstrated", totalResponses: 5 },
        "math.multiplication": { masteryStatus: "in-progress", totalResponses: 2 }
      }
    }
  };
  const board = buildQuestBoardSnapshot({
    progressionEntries: [runtimeEntry(chapter)],
    state
  });
  const [entry] = board.chapters;

  assert.ok(entry.skills.some((skill) => skill.id === "math.skip-counting" && skill.masteryStatus === "demonstrated"));
  assert.ok(entry.skills.some((skill) => skill.id === "math.multiplication" && skill.masteryStatus === "in-progress"));
  assert.equal(entry.mastery.masteredSkillCount, 1);
  assert.equal(entry.mastery.practicedSkillCount, 1);
  assert.equal(board.summary.masteredSkillCount, 1);
});

test("invalid quest-board input fails with an actionable error", () => {
  assert.throws(() => buildQuestBoardSnapshot(), /progressionEntries/);
  assert.throws(() => buildQuestBoardSnapshot({ progressionEntries: [{}] }), /id and runtime progress/);
});

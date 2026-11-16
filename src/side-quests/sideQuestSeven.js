import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const geometrySkills = ["math.shape-recognition", "math.symmetry", "math.angles"];

export const sideQuestSevenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-07.shape-riddle",
    title: "The Sky Gallery Shape Riddles",
    skillIds: geometrySkills,
    objectives: [
      "Combine side, angle, and symmetry clues to identify a two-dimensional shape.",
      "Use several geometric properties together instead of relying on a single clue."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.geometry-shape-riddle",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const shapeRiddleDemonstration = {
  title: "Combine clues to identify a shape",
  introduction: "A shape can be identified by checking more than one property at the same time.",
  steps: [
    { label: "Count the sides", explanation: "A square has four sides, and all four have the same length.", visual: { kind: "diagram", content: "4 equal sides", ariaLabel: "A square has four equal sides" } },
    { label: "Check the corners", explanation: "A square has four right angles.", visual: { kind: "diagram", content: "4 right angles", ariaLabel: "A square has four right angles" } },
    { label: "Check the mirror lines", explanation: "A square has four lines of symmetry, so all the clues point to a square.", visual: { kind: "equation", content: "4 sides · 4 right angles · 4 symmetry lines = square", ariaLabel: "Four sides, four right angles, and four symmetry lines identify a square" } }
  ],
  summary: "Use the full set of clues. A shape should match every property, not just one."
};

export const sideQuestSevenHintDefinitions = Object.freeze([
  {
    activityId: "quest-07.shape-riddle",
    title: "Professor Hoot's shape-riddle clues",
    skillIds: geometrySkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Read every clue. Start by counting sides, then check the angle clue and the number of mirror lines." },
      { attempt: 2, kind: "strategy", message: "Some shapes share a property. For example, a square and a rhombus both have four equal sides, but their angle clues are different. Find the only shape that matches all the clues." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will solve a shape riddle by checking three properties.", demonstration: shapeRiddleDemonstration }
    ]
  }
]);

export const sideQuestSevenReward = createRewardDefinition({
  id: "reward.quest-07-sky-gallery-compass",
  sourceId: "quest-07",
  title: "Sky Gallery Compass",
  starGems: 55,
  starlightSparkles: 3,
  replayPolicy: { type: "once" }
});

export const sideQuestSevenDefinition = createSideQuestDefinition({
  id: "quest-07",
  questType: "mastery",
  sourceChapterId: "chapter-04",
  title: "The Sky Gallery Shape Riddles",
  description: "Unlock the gallery's hidden platforms by solving shape riddles that combine side, angle, and mirror-line clues.",
  objectives: [
    "Identify shapes from multiple geometric properties.",
    "Explain why each clue is needed to distinguish shapes with similar features."
  ],
  activities: [{
    id: "quest-07.gallery-riddle-vault",
    title: "The Sky Gallery Shape Riddles",
    type: "challenge",
    description: "Study each shape diagram and its clues, then choose the one shape that matches every property.",
    activityId: "quest-07.shape-riddle",
    skillIds: geometrySkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Gallery riddles solved",
      successText: "Every hidden platform is identified! You used all the geometry clues together."
    }
  }],
  majorRewardIds: [sideQuestSevenReward.id]
});

import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

export const sideQuestOneActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-01.firefly-gap-maze",
    title: "The Firefly Gap Maze",
    skillIds: ["math.skip-counting"],
    objectives: ["Find a missing interior number by identifying and extending a consistent skip-counting step."],
    supportedTiers,
    answerRules: { type: "numeric", tolerance: 0 },
    generatorId: "quests.skip-counting-gap",
    generatorConstraints: {
      foundation: { startMin: 0, startMax: 8, stepMin: 2, stepMax: 3, sequenceLength: 4, choiceCount: 4 },
      core: { startMin: 5, startMax: 35, stepMin: 3, stepMax: 7, sequenceLength: 5, choiceCount: 4 },
      stretch: { startMin: 10, startMax: 60, stepMin: 5, stepMax: 12, sequenceLength: 6, choiceCount: 4 }
    }
  })
]);

const fireflyGapDemonstration = {
  title: "Find the steady jump",
  introduction: "A missing number in the middle can be found by comparing the numbers on either side.",
  steps: [
    { label: "Compare two neighbors", explanation: "Look at 8 and 12. The pattern increases by four.", visual: { kind: "sequence", content: "8 → 12  (+4)", ariaLabel: "The jump from eight to twelve is four" } },
    { label: "Keep the same step", explanation: "The jump before the gap and the jump after the gap must both be four.", visual: { kind: "number-line", content: "8 → 12 → 16", ariaLabel: "Two equal jumps of four reach sixteen" } },
    { label: "Fill the gap", explanation: "Add four to 12 to find 16. Check that 16 plus four reaches 20.", visual: { kind: "equation", content: "12 + 4 = 16; 16 + 4 = 20", ariaLabel: "Twelve plus four equals sixteen, then twenty" } }
  ],
  summary: "A steady skip-counting pattern uses the same jump all the way through."
};

export const sideQuestOneHintDefinitions = Object.freeze([
  {
    activityId: "quest-01.firefly-gap-maze",
    title: "Professor Hoot's firefly-gap clues",
    skillIds: ["math.skip-counting"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Choose two numbers next to the gap. How much does the pattern change?" },
      { attempt: 2, kind: "strategy", message: "Find the step size, then add that same amount to the number just before the blank." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will trace the repeated jump and fill the missing number.", demonstration: fireflyGapDemonstration }
    ]
  }
]);

export const sideQuestOneReward = createRewardDefinition({
  id: "reward.quest-01-firefly-pattern-pin",
  sourceId: "quest-01",
  title: "Firefly Pattern Pin",
  starGems: 35,
  starlightSparkles: 2,
  replayPolicy: { type: "once" }
});

export const sideQuestOneDefinition = createSideQuestDefinition({
  id: "quest-01",
  questType: "mastery",
  sourceChapterId: "chapter-01",
  title: "The Firefly Gap Maze",
  description: "Return to the Lantern Tree for a mastery puzzle: the fireflies have left gaps in longer number trails, and the steady jump is the key.",
  objectives: [
    "Identify the equal step in a longer skip-counting sequence.",
    "Find and verify a missing number in the middle of a pattern."
  ],
  activities: [{
    id: "quest-01.firefly-gap-challenge",
    title: "The Firefly Gap Maze",
    type: "challenge",
    description: "Trace the repeated jump, then choose the missing number in each firefly trail.",
    activityId: "quest-01.firefly-gap-maze",
    skillIds: ["math.skip-counting"],
    metadata: {
      questionCount: 5,
      challengeLabel: "Firefly trails solved",
      successText: "Every gap is filled! You followed the fireflies' steady rhythm."
    }
  }],
  majorRewardIds: [sideQuestOneReward.id]
});

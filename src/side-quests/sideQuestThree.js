import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

export const sideQuestThreeActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-03.fraction-outlier",
    title: "The Fraction Family Outlier",
    skillIds: ["math.equivalent-fractions"],
    objectives: ["Compare several fraction tiles with one starting amount.", "Identify and explain the fraction that does not name an equivalent amount."],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.fraction-outlier",
    generatorConstraints: {
      foundation: { denominatorMin: 2, denominatorMax: 3 },
      core: { denominatorMin: 2, denominatorMax: 4 },
      stretch: { denominatorMin: 3, denominatorMax: 4 }
    }
  })
]);

const outlierDemonstration = {
  title: "Listen for the fraction that changes the amount",
  introduction: "Equivalent fractions can look different while covering the same part of a whole.",
  steps: [
    { label: "Keep the starting amount in mind", explanation: "One half is the amount we want each matching tile to show.", visual: { kind: "diagram", content: "1/2", ariaLabel: "One half is the starting fraction" } },
    { label: "Compare the matching tiles", explanation: "Two fourths, three sixths, and four eighths all cover one half.", visual: { kind: "equation", content: "1/2 = 2/4 = 3/6 = 4/8", ariaLabel: "One half, two fourths, three sixths, and four eighths are equal" } },
    { label: "Find the outlier", explanation: "Three fourths covers more than one half, so it is not part of the family.", visual: { kind: "diagram", content: "3/4 ≠ 1/2", ariaLabel: "Three fourths is not equal to one half" } }
  ],
  summary: "Compare the amounts, not just the numerators or denominators, to find the outlier."
};

export const sideQuestThreeHintDefinitions = Object.freeze([
  {
    activityId: "quest-03.fraction-outlier",
    title: "Professor Hoot's fraction-family clues",
    skillIds: ["math.equivalent-fractions"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Compare each tile with the starting fraction. Does it cover the same part of its whole?" },
      { attempt: 2, kind: "strategy", message: "Multiply the top and bottom by the same number for a match. A changed amount is the outlier." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will compare a matching fraction family with one different tile.", demonstration: outlierDemonstration }
    ]
  }
]);

export const sideQuestThreeReward = createRewardDefinition({
  id: "reward.quest-03-fraction-family-prism",
  sourceId: "quest-03",
  title: "Fraction Family Prism",
  starGems: 45,
  starlightSparkles: 3,
  replayPolicy: { type: "once" }
});

export const sideQuestThreeDefinition = createSideQuestDefinition({
  id: "quest-03",
  questType: "mastery",
  sourceChapterId: "chapter-02",
  title: "The Fraction Family Outlier",
  description: "Help Apollo tune a set of moonstone fraction tiles. Three tiles preserve the starting amount, but one changes the harmony.",
  objectives: [
    "Compare multiple fractions with a given starting amount.",
    "Find the one fraction that is not equivalent and explain the difference."
  ],
  activities: [{
    id: "quest-03.fraction-family-challenge",
    title: "The Fraction Family Outlier",
    type: "challenge",
    description: "Study the fraction bars and choose the one tile that does not cover the same amount as the starting fraction.",
    activityId: "quest-03.fraction-outlier",
    skillIds: ["math.equivalent-fractions"],
    metadata: {
      questionCount: 5,
      challengeLabel: "Fraction families checked",
      successText: "The outlier is found! You kept the fraction family in tune."
    }
  }],
  majorRewardIds: [sideQuestThreeReward.id]
});

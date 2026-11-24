import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

export const sideQuestFourActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-04.fraction-story",
    title: "Fractions in the Celestial Amphitheater",
    skillIds: ["math.fractions"],
    objectives: ["Translate a real-world-style story about equal parts into a fraction.", "Use the numerator for the selected parts and the denominator for all equal parts."],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.fraction-story",
    generatorConstraints: {
      foundation: { denominatorMin: 4, denominatorMax: 6, choiceCount: 4 },
      core: { denominatorMin: 5, denominatorMax: 8, choiceCount: 4 },
      stretch: { denominatorMin: 7, denominatorMax: 12, choiceCount: 4 }
    }
  })
]);

const fractionStoryDemonstration = {
  title: "Turn the story into a fraction",
  introduction: "A fraction story tells you about selected equal parts and all the equal parts in one whole.",
  steps: [
    { label: "Find the selected parts", explanation: "Four beats are played by the silver flute. Four is the numerator.", visual: { kind: "diagram", content: "4 beats selected", ariaLabel: "Four selected beats" } },
    { label: "Find all equal parts", explanation: "The music measure has eight equal beats in total. Eight is the denominator.", visual: { kind: "diagram", content: "8 equal beats in the whole measure", ariaLabel: "Eight equal beats make the whole measure" } },
    { label: "Write the fraction", explanation: "Put the selected count over the total equal-part count.", visual: { kind: "equation", content: "4/8", ariaLabel: "Four eighths of the measure" } }
  ],
  summary: "The numerator counts the selected parts; the denominator counts all equal parts in the whole."
};

export const sideQuestFourHintDefinitions = Object.freeze([
  {
    activityId: "quest-04.fraction-story",
    title: "Professor Hoot's story-fraction clues",
    skillIds: ["math.fractions"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look for how many parts are selected and how many equal parts make the whole." },
      { attempt: 2, kind: "strategy", message: "Selected parts go on top. All equal parts in the whole go on the bottom." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will turn a music measure into a fraction.", demonstration: fractionStoryDemonstration }
    ]
  }
]);

export const sideQuestFourReward = createRewardDefinition({
  id: "reward.quest-04-celestial-measure-book",
  sourceId: "quest-04",
  title: "Celestial Measure Book",
  starGems: 50,
  starlightSparkles: 3,
  replayPolicy: { type: "once" }
});

export const sideQuestFourDefinition = createSideQuestDefinition({
  id: "quest-04",
  questType: "application",
  sourceChapterId: "chapter-02",
  title: "Fractions in the Celestial Amphitheater",
  description: "Help Apollo describe the parts of a music measure, ribbon, moonberry tart, and star chart with clear fractions.",
  objectives: [
    "Identify the selected equal parts and the total equal parts in a story.",
    "Write a fraction that describes the selected share of one whole."
  ],
  activities: [{
    id: "quest-04.amphitheater-stories",
    title: "Fractions in the Celestial Amphitheater",
    type: "challenge",
    description: "Read each little story, decide which parts are selected, and write the fraction for that share of the whole.",
    activityId: "quest-04.fraction-story",
    skillIds: ["math.fractions"],
    metadata: {
      questionCount: 5,
      challengeLabel: "Story fractions solved",
      successText: "The amphitheater is in harmony! You described every selected part with a fraction."
    }
  }],
  majorRewardIds: [sideQuestFourReward.id]
});

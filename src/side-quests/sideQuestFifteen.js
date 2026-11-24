import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const conversionSkills = ["math.unit-conversion"];

export const sideQuestFifteenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-15.metric-mislabel-mystery",
    title: "The Metric Mislabel Mystery",
    skillIds: conversionSkills,
    objectives: [
      "Audit several metric conversion records and identify the one incorrect result.",
      "Use metric unit relationships to verify a reported measurement rather than only calculating a single conversion."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.metric-mislabel-audit",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const metricAuditDemonstration = {
  title: "Check each conversion before approving a log",
  introduction: "A measurement log can contain one incorrect conversion. Check the relationship and the direction for each card.",
  steps: [
    { label: "Check the unit relationship", explanation: "There are 100 centimeters in one meter. Converting meters to centimeters makes the number larger.", visual: { kind: "diagram", content: "1 m = 100 cm", ariaLabel: "One meter equals one hundred centimeters" } },
    { label: "Compare the reported result", explanation: "A card that says 2 meters equals 20 centimeters is incorrect. Two meters equals 200 centimeters.", visual: { kind: "diagram", content: "2 m ≠ 20 cm · 2 m = 200 cm", ariaLabel: "The reported twenty centimeters is incorrect; two hundred centimeters is correct" } },
    { label: "Find the card that breaks the rule", explanation: "Check every card against the correct metric relationship. Select the card whose reported result does not match.", visual: { kind: "equation", content: "Source measurement → correct equivalent → audit result", ariaLabel: "Verify each source measurement against its correct equivalent" } }
  ],
  summary: "Use the metric relationship to identify the card with the one incorrect reported result."
};

export const sideQuestFifteenHintDefinitions = Object.freeze([
  {
    activityId: "quest-15.metric-mislabel-mystery",
    title: "Professor Hoot's metric-audit clues",
    skillIds: conversionSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Check whether the number should grow or shrink when changing from the source unit to the target unit." },
      { attempt: 2, kind: "strategy", message: "Remember 100 cm = 1 m and 1,000 mL = 1 L and 1,000 g = 1 kg. Verify each card using the matching relationship." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will check a meter-to-centimeter conversion and find a mislabeled card.", demonstration: metricAuditDemonstration }
    ]
  }
]);

export const sideQuestFifteenReward = createRewardDefinition({
  id: "reward.quest-15-metric-audit-loupe",
  sourceId: "quest-15",
  title: "Metric Audit Loupe",
  starGems: 75,
  starlightSparkles: 5,
  replayPolicy: { type: "once" }
});

export const sideQuestFifteenDefinition = createSideQuestDefinition({
  id: "quest-15",
  questType: "mastery",
  sourceChapterId: "chapter-08",
  title: "The Metric Mislabel Mystery",
  description: "Help Poseidon's laboratory team audit its measurement log by finding the one conversion card that does not follow the metric rules.",
  objectives: [
    "Apply metric relationships to check multiple reported conversions.",
    "Identify the single incorrect result among otherwise accurate measurement records."
  ],
  activities: [{
    id: "quest-15.audit-the-metric-log",
    title: "The Metric Mislabel Mystery",
    type: "challenge",
    description: "Compare four measurement cards and select the one whose reported conversion is incorrect.",
    activityId: "quest-15.metric-mislabel-mystery",
    skillIds: conversionSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Metric cards verified",
      successText: "You caught every mislabeled result and restored the laboratory's conversion log!"
    }
  }],
  majorRewardIds: [sideQuestFifteenReward.id]
});

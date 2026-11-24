import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const reasoningSkills = ["math.multi-step-reasoning"];

export const sideQuestEighteenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-18.workshop-supply-plan",
    title: "The Workshop Supply Planner",
    skillIds: reasoningSkills,
    objectives: [
      "Apply a sequence of arithmetic operations to a practical workshop-supply problem.",
      "Carry each intermediate quantity forward to find the final amount or equal share."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.chimera-supply-workshop",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const workshopSupplyDemonstration = {
  title: "Prepare the workshop supply shelf",
  introduction: "A supply plan may involve more than one event. Work through each event in order and carry the amount forward.",
  steps: [
    { label: "Combine the starting stock and delivery", explanation: "The workshop has 28 bundles and receives 12 more: 28 + 12 = 40 bundles.", visual: { kind: "equation", content: "28 + 12 = 40", ariaLabel: "Twenty-eight plus twelve equals forty" } },
    { label: "Set aside the reserved bundles", explanation: "Seven bundles are reserved for the demonstration table: 40 − 7 = 33.", visual: { kind: "equation", content: "40 − 7 = 33", ariaLabel: "Forty minus seven equals thirty-three" } },
    { label: "Check what the question asks", explanation: "The 33 bundles left are available for the other workshop stations. Keep the unit bundles with the answer.", visual: { kind: "diagram", content: "33 bundles remain", ariaLabel: "Thirty-three supply bundles remain" } }
  ],
  summary: "Complete the first operation, use its result in the next operation, and answer with the requested unit."
};

export const sideQuestEighteenHintDefinitions = Object.freeze([
  {
    activityId: "quest-18.workshop-supply-plan",
    title: "Professor Hoot's workshop-planning clues",
    skillIds: reasoningSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Mark the starting amount, each change to the supplies, and what the question asks you to find." },
      { attempt: 2, kind: "strategy", message: "Find the total first, subtract anything reserved, and share equally only when the story says to divide among teams." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will combine a delivery and remove reserved workshop bundles one step at a time.", demonstration: workshopSupplyDemonstration }
    ]
  }
]);

export const sideQuestEighteenReward = createRewardDefinition({
  id: "reward.quest-18-chimera-supply-satchel",
  sourceId: "quest-18",
  title: "Chimera's Supply Satchel",
  starGems: 90,
  starlightSparkles: 6,
  replayPolicy: { type: "once" }
});

export const sideQuestEighteenDefinition = createSideQuestDefinition({
  id: "quest-18",
  questType: "application",
  sourceChapterId: "chapter-09",
  title: "The Workshop Supply Planner",
  description: "Help the Chimera prepare equal workshop supplies by combining deliveries, removing reserved bundles, and sharing the remainder when needed.",
  objectives: [
    "Interpret a practical supply story and select the operations it requires.",
    "Calculate the final stock or equal team share using the intermediate results in order."
  ],
  activities: [{
    id: "quest-18.plan-the-workshop-supplies",
    title: "The Workshop Supply Planner",
    type: "challenge",
    description: "Solve a tiered workshop-supply problem and find the number of bundles available or received by each team.",
    activityId: "quest-18.workshop-supply-plan",
    skillIds: reasoningSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Workshop supply plans completed",
      successText: "The workshop supplies are counted, reserved, and shared correctly!"
    }
  }],
  majorRewardIds: [sideQuestEighteenReward.id]
});

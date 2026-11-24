import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const reasoningSkills = ["math.multi-step-reasoning"];

export const sideQuestSeventeenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-17.operation-blueprint",
    title: "The Chimera's Operation Blueprint",
    skillIds: reasoningSkills,
    objectives: [
      "Translate the order of events in a word problem into an accurate operation plan.",
      "Distinguish a correct sequence of operations from plausible plans that rearrange or change a step."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.chimera-operation-blueprint",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const operationBlueprintDemonstration = {
  title: "Turn the story into an operation blueprint",
  introduction: "The order of events tells you which operation comes first and which result must be carried into the next step.",
  steps: [
    { label: "Find the starting amount", explanation: "The library begins with 248 scrolls. Keep that starting amount in view.", visual: { kind: "diagram", content: "Starting amount: 248 scrolls", ariaLabel: "The library starts with two hundred forty-eight scrolls" } },
    { label: "Follow the delivery", explanation: "Athena brings 86 more scrolls, so the first operation is addition: 248 + 86.", visual: { kind: "equation", content: "248 + 86", ariaLabel: "Add eighty-six to two hundred forty-eight" } },
    { label: "Follow what happens next", explanation: "Students then borrow 57 scrolls, so subtract after adding: (248 + 86) − 57.", visual: { kind: "equation", content: "248 + 86 → subtract 57", ariaLabel: "Add eighty-six first, then subtract fifty-seven" } }
  ],
  summary: "Keep the operations in the same order as the events in the story. The result of one step becomes the starting amount for the next."
};

export const sideQuestSeventeenHintDefinitions = Object.freeze([
  {
    activityId: "quest-17.operation-blueprint",
    title: "Professor Hoot's operation-blueprint clues",
    skillIds: reasoningSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Read the story in order. Which event happens first, and does it add to or take away from the starting amount?" },
      { attempt: 2, kind: "strategy", message: "Write one operation for each event, in the same order the events happen. Check that every quantity is used in the step it describes." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will turn a delivery and a later borrowing event into an operation plan.", demonstration: operationBlueprintDemonstration }
    ]
  }
]);

export const sideQuestSeventeenReward = createRewardDefinition({
  id: "reward.quest-17-chimera-blueprint-compass",
  sourceId: "quest-17",
  title: "Chimera's Blueprint Compass",
  starGems: 85,
  starlightSparkles: 6,
  replayPolicy: { type: "once" }
});

export const sideQuestSeventeenDefinition = createSideQuestDefinition({
  id: "quest-17",
  questType: "mastery",
  sourceChapterId: "chapter-09",
  title: "The Chimera's Operation Blueprint",
  description: "Help the Chimera arrange each word problem's operations in the correct order before anyone begins calculating.",
  objectives: [
    "Read the order of events and identify the operation each event requires.",
    "Select the operation plan that matches the story from beginning to end."
  ],
  activities: [{
    id: "quest-17.blueprint-review",
    title: "The Chimera's Operation Blueprint",
    type: "challenge",
    description: "Compare four possible operation plans and choose the one that follows the story in the correct order.",
    activityId: "quest-17.operation-blueprint",
    skillIds: reasoningSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Operation plans checked",
      successText: "You followed every story clue and chose the correct operation blueprint!"
    }
  }],
  majorRewardIds: [sideQuestSeventeenReward.id]
});

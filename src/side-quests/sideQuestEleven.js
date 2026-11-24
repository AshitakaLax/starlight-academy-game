import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const lifecycleSkills = ["science.plant-life-cycles"];

export const sideQuestElevenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-11.lifecycle-backtrack",
    title: "The Life-Cycle Time Traveler",
    skillIds: lifecycleSkills,
    objectives: [
      "Identify the plant life-cycle stage that immediately precedes a shown stage.",
      "Reason backward through the same flowering-plant cycle used in the greenhouse lesson."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.plant-lifecycle-backtrack",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const lifecycleBacktrackDemonstration = {
  title: "Travel one stage backward through the plant life cycle",
  introduction: "The flowering-plant cycle repeats. A later stage can help you work out which stage came immediately before it.",
  steps: [
    { label: "Start with the stage you can see", explanation: "A seedling is a young plant with roots, a stem, and its first leaves.", visual: { kind: "diagram", content: "Shown stage: seedling", ariaLabel: "A young seedling with its first leaves" } },
    { label: "Move one step earlier", explanation: "Before a seedling develops, its seed begins to sprout during germination.", visual: { kind: "diagram", content: "Germination → seedling", ariaLabel: "Germination comes immediately before the seedling stage" } },
    { label: "Check the cycle order", explanation: "The sequence is seed, germination, seedling, mature flowering plant, then fruit with new seeds.", visual: { kind: "equation", content: "Seed → germination → seedling → flowering plant → fruit with seeds", ariaLabel: "The complete flowering-plant life cycle in order" } }
  ],
  summary: "Find the shown stage in the cycle, then move back exactly one stage."
};

export const sideQuestElevenHintDefinitions = Object.freeze([
  {
    activityId: "quest-11.lifecycle-backtrack",
    title: "Professor Hoot's time-traveling plant clues",
    skillIds: lifecycleSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Find the shown stage in the plant cycle. The answer is the stage immediately before it, not the stage after it." },
      { attempt: 2, kind: "strategy", message: "Say the cycle in order from seed to new seeds. Locate the shown stage, then move one place to the left." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will trace one step backward from a seedling.", demonstration: lifecycleBacktrackDemonstration }
    ]
  }
]);

export const sideQuestElevenReward = createRewardDefinition({
  id: "reward.quest-11-life-cycle-timeglass",
  sourceId: "quest-11",
  title: "Life-Cycle Timeglass",
  starGems: 65,
  starlightSparkles: 4,
  replayPolicy: { type: "once" }
});

export const sideQuestElevenDefinition = createSideQuestDefinition({
  id: "quest-11",
  questType: "mastery",
  sourceChapterId: "chapter-06",
  title: "The Life-Cycle Time Traveler",
  description: "Join Demeter's greenhouse helpers and travel backward through a flowering plant's life cycle, one stage at a time.",
  objectives: [
    "Identify the stage that immediately precedes a flowering-plant life-cycle clue.",
    "Use the complete cycle order to reason backward without confusing earlier and later stages."
  ],
  activities: [{
    id: "quest-11.travel-back-one-stage",
    title: "The Life-Cycle Time Traveler",
    type: "challenge",
    description: "Study a flowering-plant stage and choose the stage that came immediately before it.",
    activityId: "quest-11.lifecycle-backtrack",
    skillIds: lifecycleSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Life-cycle steps retraced",
      successText: "You traveled backward through every clue and restored the greenhouse's life-cycle timeline!"
    }
  }],
  majorRewardIds: [sideQuestElevenReward.id]
});

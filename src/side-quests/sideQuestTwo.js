import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

export const sideQuestTwoActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-02.moonberry-picnic",
    title: "The Moonberry Picnic Planner",
    skillIds: ["math.multiplication"],
    objectives: ["Apply multiplication to a playful equal-groups situation and calculate the total in context."],
    supportedTiers,
    answerRules: { type: "numeric", tolerance: 0 },
    generatorId: "quests.equal-groups-picnic",
    generatorConstraints: {
      foundation: { groupMin: 2, groupMax: 4, countMin: 2, countMax: 5, choiceCount: 4 },
      core: { groupMin: 3, groupMax: 7, countMin: 3, countMax: 8, choiceCount: 4 },
      stretch: { groupMin: 6, groupMax: 12, countMin: 5, countMax: 12, choiceCount: 4 }
    }
  })
]);

const picnicDemonstration = {
  title: "Count every picnic group",
  introduction: "A multiplication story has equal groups: the group count and the amount in each group.",
  steps: [
    { label: "Count the groups", explanation: "There are four picnic baskets. That tells you how many equal groups you have.", visual: { kind: "array", content: "4 baskets", ariaLabel: "Four equal baskets" } },
    { label: "Count each group", explanation: "Each basket holds five moonberry muffins.", visual: { kind: "diagram", content: "5 muffins in each basket", ariaLabel: "Five muffins in each of the four baskets" } },
    { label: "Multiply to find the total", explanation: "Four groups of five make twenty muffins altogether.", visual: { kind: "equation", content: "4 × 5 = 20", ariaLabel: "Four times five equals twenty" } }
  ],
  summary: "Multiply the number of groups by the amount in each group to find the total."
};

export const sideQuestTwoHintDefinitions = Object.freeze([
  {
    activityId: "quest-02.moonberry-picnic",
    title: "Professor Hoot's picnic-planning clues",
    skillIds: ["math.multiplication"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Find the number of baskets or plates, then find how many treats go in each one." },
      { attempt: 2, kind: "strategy", message: "The groups are equal. Multiply the number of groups by the number in each group." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will organize the picnic treats into equal groups.", demonstration: picnicDemonstration }
    ]
  }
]);

export const sideQuestTwoReward = createRewardDefinition({
  id: "reward.quest-02-moonberry-basket",
  sourceId: "quest-02",
  title: "Moonberry Picnic Basket",
  starGems: 40,
  starlightSparkles: 3,
  replayPolicy: { type: "once" }
});

export const sideQuestTwoDefinition = createSideQuestDefinition({
  id: "quest-02",
  questType: "application",
  sourceChapterId: "chapter-01",
  title: "The Moonberry Picnic Planner",
  description: "Help the academy's little friends prepare a moonberry picnic by counting equal groups of muffins, cookies, and glowing seeds.",
  objectives: [
    "Translate a playful equal-groups story into a multiplication calculation.",
    "Use multiplication to find and check a total in a real-world-style situation."
  ],
  activities: [{
    id: "quest-02.picnic-planning-challenge",
    title: "The Moonberry Picnic Planner",
    type: "challenge",
    description: "Read each picnic scene, identify the equal groups, and work out how many treats or seeds are needed.",
    activityId: "quest-02.moonberry-picnic",
    skillIds: ["math.multiplication"],
    metadata: {
      questionCount: 4,
      challengeLabel: "Picnic plans completed",
      successText: "The picnic is ready! You used equal groups to count everything."
    }
  }],
  majorRewardIds: [sideQuestTwoReward.id]
});

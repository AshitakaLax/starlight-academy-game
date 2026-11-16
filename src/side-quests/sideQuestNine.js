import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const habitatSkills = ["science.habitats", "science.adaptations"];

export const sideQuestNineActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-09.adaptation-pair-detective",
    title: "The Adaptation Pair Detective",
    skillIds: habitatSkills,
    objectives: [
      "Identify an animal by matching two different adaptations to the same creature.",
      "Combine structural and behavioral clues to narrow down an animal identity."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.habitat-adaptation-pair",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const pairDetectiveDemonstration = {
  title: "Use two field observations together",
  introduction: "One feature can fit more than one animal. Two clues can make the match much clearer.",
  steps: [
    { label: "Read the first observation", explanation: "A dense coat of thick fur is a body feature that helps an Arctic fox keep warm.", visual: { kind: "diagram", content: "Thick fur → insulation", ariaLabel: "Thick fur helps an Arctic fox stay warm" } },
    { label: "Read the second observation", explanation: "The fox also wraps its fluffy tail around its body while resting.", visual: { kind: "diagram", content: "Tail wrapped around body → extra warmth", ariaLabel: "An Arctic fox wraps its tail around itself while resting" } },
    { label: "Check both clues", explanation: "The animal must match both the body feature and the behavior, not just one observation.", visual: { kind: "equation", content: "Clue 1 + clue 2 → one animal", ariaLabel: "Use both adaptation clues to identify one animal" } }
  ],
  summary: "Compare every observation with the same animal before choosing."
};

export const sideQuestNineHintDefinitions = Object.freeze([
  {
    activityId: "quest-09.adaptation-pair-detective",
    title: "Professor Hoot's paired adaptation clues",
    skillIds: habitatSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Read both observations. Do they describe a body feature, an action, or one of each?" },
      { attempt: 2, kind: "strategy", message: "Test each possible animal against the first clue, then check the same animal against the second clue. A correct match must explain both." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will connect two Arctic fox adaptations to the same animal.", demonstration: pairDetectiveDemonstration }
    ]
  }
]);

export const sideQuestNineReward = createRewardDefinition({
  id: "reward.quest-09-adaptation-detective-lens",
  sourceId: "quest-09",
  title: "Adaptation Detective Lens",
  starGems: 60,
  starlightSparkles: 4,
  replayPolicy: { type: "once" }
});

export const sideQuestNineDefinition = createSideQuestDefinition({
  id: "quest-09",
  questType: "mastery",
  sourceChapterId: "chapter-05",
  title: "The Adaptation Pair Detective",
  description: "Join Artemis's ranger team and identify a mystery creature by connecting two of its field observations.",
  objectives: [
    "Use more than one adaptation clue to identify a creature.",
    "Distinguish a correct two-clue match from an animal that fits only one observation."
  ],
  activities: [{
    id: "quest-09.paired-field-observations",
    title: "The Adaptation Pair Detective",
    type: "challenge",
    description: "Study two adaptation notes from one mystery creature and choose the animal that matches both clues.",
    activityId: "quest-09.adaptation-pair-detective",
    skillIds: habitatSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Creature identities confirmed",
      successText: "Every paired clue points to the right creature. The field guide is more precise than ever!"
    }
  }],
  majorRewardIds: [sideQuestNineReward.id]
});

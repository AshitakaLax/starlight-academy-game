import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const massSkills = ["math.mass"];

export const sideQuestSixteenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-16.harbor-cargo-total",
    title: "The Harbor Cargo Calculator",
    skillIds: massSkills,
    objectives: [
      "Combine the measured masses of two separate cargo items to find their total mass.",
      "Apply addition to a practical packing and transport situation using grams."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.harbor-cargo-total",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const cargoTotalDemonstration = {
  title: "Find the total mass of a cargo pair",
  introduction: "Each item has already been measured. To find the mass of the packed pair, add the two measurements.",
  steps: [
    { label: "Read the first cargo label", explanation: "The shell collection has a measured mass of 400 grams.", visual: { kind: "diagram", content: "Shell collection = 400 g", ariaLabel: "The shell collection has a mass of four hundred grams" } },
    { label: "Read the second cargo label", explanation: "The model anchor has a measured mass of 400 grams.", visual: { kind: "diagram", content: "Model anchor = 400 g", ariaLabel: "The model anchor has a mass of four hundred grams" } },
    { label: "Add the two masses", explanation: "The total mass is 400 grams plus 400 grams, which equals 800 grams.", visual: { kind: "equation", content: "400 g + 400 g = 800 g", ariaLabel: "Four hundred grams plus four hundred grams equals eight hundred grams" } }
  ],
  summary: "Add the measured masses of both objects and keep the unit grams."
};

export const sideQuestSixteenHintDefinitions = Object.freeze([
  {
    activityId: "quest-16.harbor-cargo-total",
    title: "Professor Hoot's cargo-calculator clues",
    skillIds: massSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Both cargo items already have a mass label. What operation combines two amounts into one total?" },
      { attempt: 2, kind: "strategy", message: "Write the two gram measurements together with a plus sign, add them, and keep the unit g." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will combine two measured cargo items into one total.", demonstration: cargoTotalDemonstration }
    ]
  }
]);

export const sideQuestSixteenReward = createRewardDefinition({
  id: "reward.quest-16-harbor-cargo-seal",
  sourceId: "quest-16",
  title: "Harbor Cargo Seal",
  starGems: 80,
  starlightSparkles: 6,
  replayPolicy: { type: "once" }
});

export const sideQuestSixteenDefinition = createSideQuestDefinition({
  id: "quest-16",
  questType: "application",
  sourceChapterId: "chapter-08",
  title: "The Harbor Cargo Calculator",
  description: "Help Poseidon's harbor crew prepare a shipment by combining the measured masses of two objects into one cargo total.",
  objectives: [
    "Read the measured mass labels on two separate objects.",
    "Add the two masses to find the total amount of cargo being transported."
  ],
  activities: [{
    id: "quest-16.combine-the-cargo",
    title: "The Harbor Cargo Calculator",
    type: "challenge",
    description: "Read both cargo mass labels and select their combined mass in grams.",
    activityId: "quest-16.harbor-cargo-total",
    skillIds: massSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Cargo totals calculated",
      successText: "Every cargo pair is packed with its correct total mass!"
    }
  }],
  majorRewardIds: [sideQuestSixteenReward.id]
});

import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const plantResourceSkills = ["science.plant-resources"];

export const sideQuestTwelveActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-12.photosynthesis-recipe-restorer",
    title: "The Greenhouse Recipe Restorer",
    skillIds: plantResourceSkills,
    objectives: [
      "Complete a partially filled photosynthesis recipe by identifying its missing input.",
      "Distinguish photosynthesis inputs from oxygen and mineral nutrients."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.plant-recipe-restorer",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const recipeRestorerDemonstration = {
  title: "Restore the missing photosynthesis input",
  introduction: "Photosynthesis uses three inputs: sunlight, water, and carbon dioxide. Compare the two ingredients already listed to find the one that is missing.",
  steps: [
    { label: "Read the recipe card", explanation: "This greenhouse card already lists sunlight and carbon dioxide.", visual: { kind: "diagram", content: "Sunlight + carbon dioxide + ?", ariaLabel: "A photosynthesis recipe with water missing" } },
    { label: "Recall the three inputs", explanation: "A plant also takes in water through its roots. Oxygen is released as a byproduct rather than used as an input.", visual: { kind: "diagram", content: "Sunlight + water + carbon dioxide", ariaLabel: "The three inputs used in photosynthesis" } },
    { label: "Complete the recipe", explanation: "Water is the missing input. The plant uses light energy and the three inputs to make sugars and releases oxygen.", visual: { kind: "equation", content: "Sunlight + water + carbon dioxide → sugars + oxygen", ariaLabel: "Photosynthesis inputs and outputs" } }
  ],
  summary: "Check which of sunlight, water, and carbon dioxide is not yet on the recipe card."
};

export const sideQuestTwelveHintDefinitions = Object.freeze([
  {
    activityId: "quest-12.photosynthesis-recipe-restorer",
    title: "Professor Hoot's recipe-restoring clues",
    skillIds: plantResourceSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Look at the two inputs already listed. Which one of the three photosynthesis inputs is not there yet?" },
      { attempt: 2, kind: "strategy", message: "Remember the full recipe: sunlight, water, and carbon dioxide. Compare each of those three with the recipe card and choose the missing one." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will complete a recipe card that is missing water.", demonstration: recipeRestorerDemonstration }
    ]
  }
]);

export const sideQuestTwelveReward = createRewardDefinition({
  id: "reward.quest-12-greenhouse-recipe-crystal",
  sourceId: "quest-12",
  title: "Greenhouse Recipe Crystal",
  starGems: 70,
  starlightSparkles: 5,
  replayPolicy: { type: "once" }
});

export const sideQuestTwelveDefinition = createSideQuestDefinition({
  id: "quest-12",
  questType: "application",
  sourceChapterId: "chapter-06",
  title: "The Greenhouse Recipe Restorer",
  description: "Help Demeter repair partly completed photosynthesis recipe cards by reading greenhouse clues and finding the missing ingredient.",
  objectives: [
    "Apply the photosynthesis input model to a partially completed recipe.",
    "Use greenhouse conditions to distinguish missing inputs from photosynthesis outputs and other growth resources."
  ],
  activities: [{
    id: "quest-12.restore-the-recipe",
    title: "The Greenhouse Recipe Restorer",
    type: "challenge",
    description: "Read the greenhouse observation and two inputs already on the recipe card, then choose the missing photosynthesis input.",
    activityId: "quest-12.photosynthesis-recipe-restorer",
    skillIds: plantResourceSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Photosynthesis recipes restored",
      successText: "Every recipe card has its missing input. The greenhouse's science notes are complete!"
    }
  }],
  majorRewardIds: [sideQuestTwelveReward.id]
});

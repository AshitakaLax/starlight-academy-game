import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const measurementSkills = ["math.perimeter", "math.area"];

export const sideQuestEightActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-08.measurement-stories",
    title: "The Balance Beam Builders",
    skillIds: measurementSkills,
    objectives: [
      "Recognize when a real-world task asks for perimeter or area.",
      "Calculate the correct measurement from the side lengths of a rectangle."
    ],
    supportedTiers,
    answerRules: { type: "numeric", tolerance: 0 },
    generatorId: "quests.geometry-measurement-stories",
    generatorConstraints: {
      foundation: { widthMin: 2, widthMax: 5, heightMin: 2, heightMax: 4, choiceCount: 4 },
      core: { widthMin: 3, widthMax: 9, heightMin: 2, heightMax: 7, choiceCount: 4 },
      stretch: { widthMin: 5, widthMax: 14, heightMin: 3, heightMax: 10, choiceCount: 4 }
    }
  })
]);

const measurementStoryDemonstration = {
  title: "Choose around or inside",
  introduction: "Perimeter measures the distance around a shape. Area measures the space covered inside it.",
  steps: [
    { label: "Look at the task", explanation: "A ribbon border follows the outside edge of a rectangular platform.", visual: { kind: "diagram", content: "Ribbon follows the outside edge", ariaLabel: "A ribbon border follows the outside of a rectangle" } },
    { label: "Choose the measurement", explanation: "A border goes around the rectangle, so find its perimeter by adding all four sides.", visual: { kind: "equation", content: "6 + 3 + 6 + 3 = 18 cm", ariaLabel: "Six plus three plus six plus three equals eighteen centimeters around" } },
    { label: "Compare with covering", explanation: "If the task were to cover the platform with unit squares, you would find area instead: six times three equals eighteen square centimeters.", visual: { kind: "equation", content: "6 × 3 = 18 cm²", ariaLabel: "Six times three equals eighteen square centimeters inside" } }
  ],
  summary: "Ask whether the task measures the outside boundary or the surface covered before choosing a calculation."
};

export const sideQuestEightHintDefinitions = Object.freeze([
  {
    activityId: "quest-08.measurement-stories",
    title: "Professor Hoot's builder clues",
    skillIds: measurementSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Does the story ask you to go around the edge, or cover the inside?" },
      { attempt: 2, kind: "strategy", message: "Around the outside means perimeter: length + width + length + width. Covering the inside means area: length × width." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will compare a ribbon border with a tiled floor.", demonstration: measurementStoryDemonstration }
    ]
  }
]);

export const sideQuestEightReward = createRewardDefinition({
  id: "reward.quest-08-builders-toolkit",
  sourceId: "quest-08",
  title: "Builder's Star Toolkit",
  starGems: 60,
  starlightSparkles: 4,
  replayPolicy: { type: "once" }
});

export const sideQuestEightDefinition = createSideQuestDefinition({
  id: "quest-08",
  questType: "application",
  sourceChapterId: "chapter-04",
  title: "The Balance Beam Builders",
  description: "Help the Sky Gallery crew finish its platforms by deciding when a job needs ribbon around the edge or tiles across the surface.",
  objectives: [
    "Interpret practical stories to decide between perimeter and area.",
    "Calculate a rectangle's boundary length or covered square units using its dimensions."
  ],
  activities: [{
    id: "quest-08.platform-plans",
    title: "The Balance Beam Builders",
    type: "challenge",
    description: "Read each platform job, study the rectangle, decide whether it needs an around-the-edge or cover-the-inside measurement, and solve it.",
    activityId: "quest-08.measurement-stories",
    skillIds: measurementSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Platform plans completed",
      successText: "The gallery platforms are ready! You chose perimeter and area for the right jobs."
    }
  }],
  majorRewardIds: [sideQuestEightReward.id]
});

import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const planningSkills = ["math.multi-step-reasoning"];

export const sideQuestTwentyActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-20.constellation-completion-plan",
    title: "The Grand Constellation Planner",
    skillIds: planningSkills,
    objectives: [
      "Apply balanced subject targets to a practical championship-planning task.",
      "Calculate how many star spaces remain or how many selections must be replaced to balance the constellation."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.championship-constellation-plan",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const constellationPlanDemonstration = {
  title: "Balance the three-part constellation",
  introduction: "The championship has room for four mathematics stars, four science stars, and four language-arts stars.",
  steps: [
    { label: "Check the target for each subject", explanation: "Each of the three subjects needs exactly four stars, for twelve stars altogether.", visual: { kind: "diagram", content: "4 mathematics · 4 science · 4 language arts", ariaLabel: "The target is four stars in each of three subjects" } },
    { label: "Compare the current counts", explanation: "Count how many stars are already selected in each subject. An underfilled subject needs more stars; an overfilled subject has selections to replace.", visual: { kind: "diagram", content: "Current count ↔ target of 4", ariaLabel: "Compare each current subject count with the target of four" } },
    { label: "Plan the remaining spaces or replacements", explanation: "Add the missing spaces for an unfinished board. If twelve stars are already selected, replace the number of stars above four in the overfilled subjects.", visual: { kind: "equation", content: "Missing spaces = target − current · Replacements = current − target", ariaLabel: "Use the difference from four to count spaces or replacements" } }
  ],
  summary: "Use four as the target for each subject. Count the missing stars, or replace any extra selections when the board already has twelve."
};

export const sideQuestTwentyHintDefinitions = Object.freeze([
  {
    activityId: "quest-20.constellation-completion-plan",
    title: "Professor Hoot's constellation-planning clues",
    skillIds: planningSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Each subject needs four stars. Compare the current count with four." },
      { attempt: 2, kind: "strategy", message: "For an unfinished board, find the missing stars in each subject and add those amounts. For a full board, count how many selections are above four and need replacing." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will compare a sample subject count with the target of four and plan the changes.", demonstration: constellationPlanDemonstration }
    ]
  }
]);

export const sideQuestTwentyReward = createRewardDefinition({
  id: "reward.quest-20-grand-constellation-keepsake",
  sourceId: "quest-20",
  title: "Grand Constellation Keepsake",
  starGems: 100,
  starlightSparkles: 7,
  replayPolicy: { type: "once" }
});

export const sideQuestTwentyDefinition = createSideQuestDefinition({
  id: "quest-20",
  questType: "application",
  sourceChapterId: "chapter-10",
  title: "The Grand Constellation Planner",
  description: "Help the championship team prepare a balanced constellation with four stars from each of the three subjects.",
  objectives: [
    "Read the current mathematics, science, and language-arts star counts.",
    "Calculate the missing spaces or the number of selections that must be replaced to reach the balanced target."
  ],
  activities: [{
    id: "quest-20.balance-the-constellation",
    title: "The Grand Constellation Planner",
    type: "challenge",
    description: "Use the current subject counts to plan the remaining star spaces or correct an unbalanced full board.",
    activityId: "quest-20.constellation-completion-plan",
    skillIds: planningSkills,
    metadata: {
      questionCount: 6,
      challengeLabel: "Constellation plans balanced",
      successText: "The mathematics, science, and language-arts stars now form a balanced constellation!"
    }
  }],
  majorRewardIds: [sideQuestTwentyReward.id]
});

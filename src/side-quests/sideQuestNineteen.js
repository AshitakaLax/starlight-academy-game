import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const championshipSkills = ["math.multi-step-reasoning"];

export const sideQuestNineteenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-19.starlight-skill-match",
    title: "The Starlight Skill Matchmaker",
    skillIds: championshipSkills,
    objectives: [
      "Connect a championship challenge clue with the previously learned skill it uses.",
      "Distinguish between related skills across mathematics, science, and language arts."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.championship-skill-match",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const skillMatchDemonstration = {
  title: "Find the skill behind the star",
  introduction: "A championship star names a challenge. Its clue describes the skill you practiced in an earlier academy adventure.",
  steps: [
    { label: "Read the clue for its action", explanation: "A clue about finding a fraction with the same value points to equivalent fractions, not to a reading or habitat skill.", visual: { kind: "diagram", content: "Same amount → equivalent fractions", ariaLabel: "A clue about the same amount points to equivalent fractions" } },
    { label: "Compare the subject and skill", explanation: "Use the subject and the important action in the clue. Look for the star that represents that exact skill.", visual: { kind: "diagram", content: "Subject + skill clue → matching star", ariaLabel: "Match the subject and skill clue to a championship star" } },
    { label: "Rule out nearby topics", explanation: "Some skills sound related, but the correct star must match the action described in the clue.", visual: { kind: "equation", content: "Read → identify the skill → choose the star", ariaLabel: "Read the clue, identify the skill, and choose the matching star" } }
  ],
  summary: "Use the subject and the action in the clue to match the challenge with its championship star."
};

export const sideQuestNineteenHintDefinitions = Object.freeze([
  {
    activityId: "quest-19.starlight-skill-match",
    title: "Professor Hoot's skill-match clues",
    skillIds: championshipSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Notice the subject and the action in the clue. What kind of thinking does the challenge ask you to use?" },
      { attempt: 2, kind: "strategy", message: "Match the clue's main action to the skill you practiced. Set aside stars from a different subject or a different kind of task." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will use a clue about equivalent fractions to find its championship star.", demonstration: skillMatchDemonstration }
    ]
  }
]);

export const sideQuestNineteenReward = createRewardDefinition({
  id: "reward.quest-19-starlight-skill-lens",
  sourceId: "quest-19",
  title: "Starlight Skill Lens",
  starGems: 95,
  starlightSparkles: 6,
  replayPolicy: { type: "once" }
});

export const sideQuestNineteenDefinition = createSideQuestDefinition({
  id: "quest-19",
  questType: "mastery",
  sourceChapterId: "chapter-10",
  title: "The Starlight Skill Matchmaker",
  description: "Help Professor Hoot connect each championship clue to the academy skill that prepares a learner to solve it.",
  objectives: [
    "Interpret concise challenge clues across mathematics, science, and language arts.",
    "Choose the championship star associated with the described skill."
  ],
  activities: [{
    id: "quest-19.match-the-skill-stars",
    title: "The Starlight Skill Matchmaker",
    type: "challenge",
    description: "Read a cross-subject championship clue and select the star that represents its skill.",
    activityId: "quest-19.starlight-skill-match",
    skillIds: championshipSkills,
    metadata: {
      questionCount: 6,
      challengeLabel: "Championship skills matched",
      successText: "You recognized the skills behind the stars across all three subjects!"
    }
  }],
  majorRewardIds: [sideQuestNineteenReward.id]
});

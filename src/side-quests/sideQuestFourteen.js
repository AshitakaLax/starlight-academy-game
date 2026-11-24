import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const readingSkills = ["language.reading-inference"];

export const sideQuestFourteenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-14.evidence-matchmaker",
    title: "The Evidence Matchmaker",
    skillIds: readingSkills,
    objectives: [
      "Select the passage detail that best supports a stated inference.",
      "Distinguish direct textual evidence from details that are true but less relevant to the conclusion."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.reading-evidence-match",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const evidenceMatchDemonstration = {
  title: "Match a conclusion to its strongest clue",
  introduction: "A good inference should connect to a detail the passage actually gives.",
  steps: [
    { label: "Read the conclusion", explanation: "Noah expects rain and wants to keep the young seedlings sheltered.", visual: { kind: "diagram", content: "Conclusion: Noah expects rain and protects the seedlings", ariaLabel: "The conclusion says Noah expects rain and protects seedlings" } },
    { label: "Find the most useful detail", explanation: "The passage says Noah carried the smallest seedling trays beneath the porch roof. That action directly shows him sheltering the young plants.", visual: { kind: "diagram", content: "Seedling trays → beneath porch roof", ariaLabel: "Noah moved seedling trays beneath the porch roof" } },
    { label: "Check the text", explanation: "A strong evidence choice is a detail from the passage that directly supports the conclusion. It is not merely an unrelated fact.", visual: { kind: "equation", content: "Text detail + conclusion → supported inference", ariaLabel: "A passage detail supports a conclusion" } }
  ],
  summary: "Choose the passage detail that most directly supports the stated conclusion."
};

export const sideQuestFourteenHintDefinitions = Object.freeze([
  {
    activityId: "quest-14.evidence-matchmaker",
    title: "Professor Hoot's evidence-matching clues",
    skillIds: readingSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Read the conclusion first. Which detail from the passage gives the clearest support for it?" },
      { attempt: 2, kind: "strategy", message: "Cross out details that are true but do not connect to the conclusion. Choose the detail that shows the reason or action behind the inference." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will match Noah's decision to shelter seedlings with the detail that supports it.", demonstration: evidenceMatchDemonstration }
    ]
  }
]);

export const sideQuestFourteenReward = createRewardDefinition({
  id: "reward.quest-14-evidence-compass-bookmark",
  sourceId: "quest-14",
  title: "Evidence Compass Bookmark",
  starGems: 75,
  starlightSparkles: 5,
  replayPolicy: { type: "once" }
});

export const sideQuestFourteenDefinition = createSideQuestDefinition({
  id: "quest-14",
  questType: "application",
  sourceChapterId: "chapter-07",
  title: "The Evidence Matchmaker",
  description: "Help Athena's librarians match careful conclusions to the strongest supporting details hidden in the reading passages.",
  objectives: [
    "Use a stated inference to guide a search for relevant text evidence.",
    "Choose the strongest supporting detail rather than any detail that happens to appear in the passage."
  ],
  activities: [{
    id: "quest-14.find-the-supporting-detail",
    title: "The Evidence Matchmaker",
    type: "challenge",
    description: "Read a passage and a stated conclusion, then choose the detail that best supports that conclusion.",
    activityId: "quest-14.evidence-matchmaker",
    skillIds: readingSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Evidence matched to conclusions",
      successText: "Every conclusion now has a clear trail of evidence behind it!"
    }
  }],
  majorRewardIds: [sideQuestFourteenReward.id]
});

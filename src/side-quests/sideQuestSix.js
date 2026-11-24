import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const morphologySkills = ["language.prefixes", "language.roots", "language.suffixes"];

export const sideQuestSixActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-06.context-word-rescue",
    title: "The Missing Word Library",
    skillIds: morphologySkills,
    objectives: [
      "Use a word's meaning and a sentence's context to restore a missing word.",
      "Apply knowledge of prefixes, roots, and suffixes to choose a word that fits."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.context-word-rescue",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const contextRescueDemonstration = {
  title: "Let meaning and context work together",
  introduction: "A missing word must fit both the meaning clue and the sentence around it.",
  steps: [
    { label: "Read the sentence", explanation: "The sentence says, “The ______ note showed me which door to use.”", visual: { kind: "diagram", content: "The ______ note showed me which door to use.", ariaLabel: "A sentence has a missing describing word" } },
    { label: "Use the meaning clue", explanation: "The missing word means giving help or making a task easier.", visual: { kind: "diagram", content: "giving help", ariaLabel: "The word meaning clue is giving help" } },
    { label: "Check the word parts", explanation: "Help is the root and -ful means full of. Helpful fits the sentence and the clue.", visual: { kind: "equation", content: "help + -ful = helpful", ariaLabel: "Help plus ful makes helpful" } }
  ],
  summary: "Choose a word only when its meaning and its place in the sentence both make sense."
};

export const sideQuestSixHintDefinitions = Object.freeze([
  {
    activityId: "quest-06.context-word-rescue",
    title: "Professor Hoot's missing-word clues",
    skillIds: morphologySkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Read the words around the blank. What kind of word would make the sentence sound right?" },
      { attempt: 2, kind: "strategy", message: "Use the definition clue first, then check that the word fits the sentence. Break a possible answer into its root and affixes if you need another clue." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will use a definition and a sentence to rescue a missing word.", demonstration: contextRescueDemonstration }
    ]
  }
]);

export const sideQuestSixReward = createRewardDefinition({
  id: "reward.quest-06-storykeepers-quill",
  sourceId: "quest-06",
  title: "Storykeeper's Quill",
  starGems: 50,
  starlightSparkles: 3,
  replayPolicy: { type: "once" }
});

export const sideQuestSixDefinition = createSideQuestDefinition({
  id: "quest-06",
  questType: "application",
  sourceChapterId: "chapter-03",
  title: "The Missing Word Library",
  description: "Help Mira repair the academy's story scrolls by finding the word that fits each meaning clue and missing space.",
  objectives: [
    "Use sentence context to determine what a missing word should express.",
    "Choose a correctly spelled word whose meaning matches the clue and sentence."
  ],
  activities: [{
    id: "quest-06.restore-the-scrolls",
    title: "The Missing Word Library",
    type: "challenge",
    description: "Read the meaning clue and the sentence with a missing word, then choose the word that restores the story.",
    activityId: "quest-06.context-word-rescue",
    skillIds: morphologySkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Story scrolls restored",
      successText: "Every scroll makes sense again! The library's stories are ready to be read aloud."
    }
  }],
  majorRewardIds: [sideQuestSixReward.id]
});

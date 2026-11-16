import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const morphologySkills = ["language.prefixes", "language.roots", "language.suffixes"];

export const sideQuestFiveActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-05.morphology-analysis",
    title: "The Morphology Looking Glass",
    skillIds: morphologySkills,
    objectives: [
      "Analyze a complete word and identify its prefix, root, and suffix sequence.",
      "Explain how the meanings of word parts contribute to the whole word."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.word-morphology",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const morphologyDemonstration = {
  title: "Look inside a built word",
  introduction: "A prefix comes before a root, and a suffix comes after it. Each part adds meaning.",
  steps: [
    { label: "Find the root", explanation: "The root help means to give assistance.", visual: { kind: "diagram", content: "help = give assistance", ariaLabel: "The root help means to give assistance" } },
    { label: "Find the suffix", explanation: "The suffix -ful means full of.", visual: { kind: "diagram", content: "-ful = full of", ariaLabel: "The suffix ful means full of" } },
    { label: "Connect the parts", explanation: "The root and suffix make helpful, meaning giving help or making a task easier.", visual: { kind: "equation", content: "help + -ful = helpful", ariaLabel: "Help plus ful makes helpful" } }
  ],
  summary: "Read the parts in order and combine their meanings to explain the whole word."
};

export const sideQuestFiveHintDefinitions = Object.freeze([
  {
    activityId: "quest-05.morphology-analysis",
    title: "Professor Hoot's word-structure clues",
    skillIds: morphologySkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "A prefix comes before the root. A suffix comes after the root. Check the order of every part." },
      { attempt: 2, kind: "strategy", message: "Start with the root's meaning, then add the prefix and suffix meanings. Some words have more than one suffix, and a spelling change may happen when parts join." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will take apart a word and explain how its meaning is built.", demonstration: morphologyDemonstration }
    ]
  }
]);

export const sideQuestFiveReward = createRewardDefinition({
  id: "reward.quest-05-wordsmith-prism",
  sourceId: "quest-05",
  title: "Wordsmith's Prism",
  starGems: 45,
  starlightSparkles: 3,
  replayPolicy: { type: "once" }
});

export const sideQuestFiveDefinition = createSideQuestDefinition({
  id: "quest-05",
  questType: "mastery",
  sourceChapterId: "chapter-03",
  title: "The Morphology Looking Glass",
  description: "Peer into the silver looking glass to uncover how prefixes, roots, and suffixes work together to build the academy's words.",
  objectives: [
    "Identify the ordered word parts inside a complete word.",
    "Connect each part's meaning to the meaning of the whole word."
  ],
  activities: [{
    id: "quest-05.word-structure-vault",
    title: "The Morphology Looking Glass",
    type: "challenge",
    description: "Study a word from the curated spellbook and choose the word-part sequence that builds it.",
    activityId: "quest-05.morphology-analysis",
    skillIds: morphologySkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Word structures decoded",
      successText: "The looking glass clears! You can see how each word part contributes to the whole."
    }
  }],
  majorRewardIds: [sideQuestFiveReward.id]
});

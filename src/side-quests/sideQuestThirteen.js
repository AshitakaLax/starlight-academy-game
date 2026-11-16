import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createSideQuestDefinition } from "./sideQuestCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const grammarSkills = ["language.parts-of-speech"];

export const sideQuestThirteenActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "quest-13.grammar-pair-detective",
    title: "The Grammar Twin Detective",
    skillIds: grammarSkills,
    objectives: [
      "Compare two highlighted words from different sentences and identify their shared part of speech.",
      "Use the job each word performs in its sentence instead of relying on how the word looks."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "quests.grammar-pair-detective",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const grammarPairDemonstration = {
  title: "Compare two word jobs",
  introduction: "Two words can appear in different sentences but perform the same job.",
  steps: [
    { label: "Read the first sentence", explanation: "In “The sleepy kitten curled beside the window,” kitten names an animal, so it is a noun.", visual: { kind: "diagram", content: "kitten → noun", ariaLabel: "Kitten names an animal and is a noun" } },
    { label: "Read the second sentence", explanation: "In “Three silver stars shimmered above the tower,” stars names things in the sky, so it is also a noun.", visual: { kind: "diagram", content: "stars → noun", ariaLabel: "Stars names things in the sky and is a noun" } },
    { label: "Compare the jobs", explanation: "The sentences are different, but both highlighted words name something. Their shared part of speech is noun.", visual: { kind: "equation", content: "kitten: noun · stars: noun", ariaLabel: "Both highlighted words are nouns" } }
  ],
  summary: "Compare what each highlighted word does in its own sentence. The same word job means the same part of speech."
};

export const sideQuestThirteenHintDefinitions = Object.freeze([
  {
    activityId: "quest-13.grammar-pair-detective",
    title: "Professor Hoot's grammar-twin clues",
    skillIds: grammarSkills,
    stages: [
      { attempt: 1, kind: "nudge", message: "Read both sentences and look at each highlighted word. What job does each word do in its own sentence?" },
      { attempt: 2, kind: "strategy", message: "A noun names, a verb shows an action or state, an adjective describes a noun, and an adverb tells how, when, or where. Compare the two jobs." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will compare two naming words from different sentences.", demonstration: grammarPairDemonstration }
    ]
  }
]);

export const sideQuestThirteenReward = createRewardDefinition({
  id: "reward.quest-13-grammar-twin-monocle",
  sourceId: "quest-13",
  title: "Grammar Twin Monocle",
  starGems: 70,
  starlightSparkles: 5,
  replayPolicy: { type: "once" }
});

export const sideQuestThirteenDefinition = createSideQuestDefinition({
  id: "quest-13",
  questType: "mastery",
  sourceChapterId: "chapter-07",
  title: "The Grammar Twin Detective",
  description: "Join Athena's word detectives and compare highlighted words from different sentences to discover when they share the same grammar job.",
  objectives: [
    "Compare two sentence clues and identify their shared part of speech.",
    "Explain word roles from context rather than word appearance alone."
  ],
  activities: [{
    id: "quest-13.compare-the-word-jobs",
    title: "The Grammar Twin Detective",
    type: "challenge",
    description: "Study two highlighted words in their own sentences and choose the part of speech they share.",
    activityId: "quest-13.grammar-pair-detective",
    skillIds: grammarSkills,
    metadata: {
      questionCount: 5,
      challengeLabel: "Grammar twins identified",
      successText: "You compared the word clues carefully and found every shared grammar job!"
    }
  }],
  majorRewardIds: [sideQuestThirteenReward.id]
});

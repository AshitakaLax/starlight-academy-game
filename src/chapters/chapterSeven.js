import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const fourChoices = Object.freeze({
  foundation: { choiceCount: 4 }, core: { choiceCount: 4 }, stretch: { choiceCount: 4 }
});

function createAthenaActivity({ id, title, skillId, objective, generatorId }) {
  return createActivityDefinition({
    id, title, skillIds: [skillId], objectives: [objective], supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId, generatorConstraints: fourChoices
  });
}

export const chapterSevenActivityDefinitions = Object.freeze([
  createAthenaActivity({
    id: "chapter-07.parts-of-speech",
    title: "The Grammar Observatory",
    skillId: "language.parts-of-speech",
    objective: "Identify nouns, verbs, adjectives, and adverbs by the job each word performs in a sentence.",
    generatorId: "language.parts-of-speech"
  }),
  createAthenaActivity({
    id: "chapter-07.main-idea",
    title: "The Main-Idea Reading Room",
    skillId: "language.reading-main-idea",
    objective: "Identify the central idea that connects the important details in a short passage.",
    generatorId: "language.reading-main-idea"
  }),
  createAthenaActivity({
    id: "chapter-07.inference",
    title: "The Inference Archive",
    skillId: "language.reading-inference",
    objective: "Combine details from a passage to make a conclusion supported by evidence.",
    generatorId: "language.reading-inference"
  })
]);

const grammarDemonstration = {
  title: "Find the job of a word",
  introduction: "A word's job in its sentence helps identify its part of speech.",
  steps: [
    { label: "Find a naming word", explanation: "In “The tiny bird sang sweetly,” bird names an animal, so it is a noun.", visual: { kind: "diagram", content: "bird → noun", ariaLabel: "Bird names an animal and is a noun" } },
    { label: "Find the action", explanation: "Sang tells what the bird did, so it is a verb.", visual: { kind: "diagram", content: "sang → verb", ariaLabel: "Sang tells an action and is a verb" } },
    { label: "Look for describing words", explanation: "Tiny describes the bird and sweetly tells how it sang. Tiny is an adjective; sweetly is an adverb.", visual: { kind: "equation", content: "tiny → adjective · sweetly → adverb", ariaLabel: "Tiny is an adjective and sweetly is an adverb" } }
  ],
  summary: "Nouns name; verbs show actions or states; adjectives describe nouns; adverbs tell how, when, or where."
};

const mainIdeaDemonstration = {
  title: "Find the main idea",
  introduction: "The main idea is the broad point that the important details work together to support.",
  steps: [
    { label: "Notice repeated focus", explanation: "Ask what person, topic, or event appears across the passage.", visual: { kind: "diagram", content: "Details → shared topic", ariaLabel: "Details point toward a shared topic" } },
    { label: "Connect the details", explanation: "Choose an answer that covers the whole passage, not just one interesting fact.", visual: { kind: "diagram", content: "Whole passage ≠ one small detail", ariaLabel: "The main idea covers the whole passage rather than one small detail" } },
    { label: "Check the best summary", explanation: "A good main idea makes sense of the important details without adding information the passage never gives.", visual: { kind: "equation", content: "Main idea = central point + supporting details", ariaLabel: "The main idea is the central point supported by the details" } }
  ],
  summary: "Look for the answer that connects the important details and explains what the passage is mostly about."
};

const inferenceDemonstration = {
  title: "Build an inference from clues",
  introduction: "An inference is a reasonable conclusion made by combining text evidence with what you already know.",
  steps: [
    { label: "Collect a text clue", explanation: "Suppose a character puts on boots and carries an umbrella before leaving.", visual: { kind: "diagram", content: "boots + umbrella", ariaLabel: "Boots and an umbrella are clues" } },
    { label: "Connect the clues", explanation: "Those choices suggest the character expects wet weather.", visual: { kind: "diagram", content: "Clues → likely wet weather", ariaLabel: "The clues suggest wet weather" } },
    { label: "Stay with the evidence", explanation: "The passage supports expecting wet weather. It does not prove exactly when or how much rain will fall.", visual: { kind: "equation", content: "Text clues + careful thinking → supported inference", ariaLabel: "Combine text clues and careful thinking to make an inference" } }
  ],
  summary: "An inference must fit the clues. It should not add details that the passage does not support."
};

export const chapterSevenHintDefinitions = Object.freeze([
  {
    activityId: "chapter-07.parts-of-speech",
    title: "Professor Hoot's grammar clues",
    skillIds: ["language.parts-of-speech"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Ask what job the highlighted word is doing. Is it naming something, showing an action, describing a noun, or telling how an action happens?" },
      { attempt: 2, kind: "strategy", message: "A noun names; a verb shows an action or state; an adjective describes a noun; an adverb tells how, when, or where." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will identify each word's job in a short sentence.", demonstration: grammarDemonstration }
    ]
  },
  {
    activityId: "chapter-07.main-idea",
    title: "Professor Hoot's main-idea clues",
    skillIds: ["language.reading-main-idea"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look for the idea that connects several details, not an answer about only one small detail." },
      { attempt: 2, kind: "strategy", message: "Ask what the whole passage is mostly about. Check that the important details support the answer." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will connect details to a central idea.", demonstration: mainIdeaDemonstration }
    ]
  },
  {
    activityId: "chapter-07.inference",
    title: "Professor Hoot's inference clues",
    skillIds: ["language.reading-inference"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Find a sentence or detail that gives you a clue. What can you reasonably work out from it?" },
      { attempt: 2, kind: "strategy", message: "Combine two or more clues when possible. Choose only a conclusion the passage supports." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will turn text clues into a careful inference.", demonstration: inferenceDemonstration }
    ]
  }
]);

export const chapterSevenReward = createRewardDefinition({
  id: "reward.chapter-07-athenas-quill",
  sourceId: "chapter-07",
  title: "Athena's Quill of Clarity",
  starGems: 100,
  starlightSparkles: 8,
  replayPolicy: { type: "once" }
});

export const chapterSevenDefinition = createChapterDefinition({
  id: "chapter-07",
  title: "Athena's Logic & Word Wizardry",
  description: "Enter Athena's library of language to uncover how words work, discover the main idea in a passage, and make thoughtful inferences from clues.",
  prerequisiteChapterIds: ["chapter-06"],
  objectives: [
    "Identify nouns, verbs, adjectives, and adverbs by their roles in sentences.",
    "Recognize the main idea supported by details in a short reading passage.",
    "Make an inference that is supported by evidence in the text."
  ],
  activities: [
    {
      id: "chapter-07.library-arrival",
      title: "Athena's Library of Clues",
      type: "story",
      description: "Athena invites the student into a library where word labels and reading notes have become mixed together.",
      metadata: { paragraphs: [
        "Beyond Demeter's greenhouse, a quiet library glows with lamplight. Scrolls, storybooks, and notebooks fill the shelves, but several study labels have slipped from their places.",
        "Athena welcomes the student. “Words each have a job in a sentence, and good readers look for the ideas that connect a passage. When we combine clues carefully, we can make an inference without guessing.”",
        "Professor Hoot opens a grammar notebook and a reading journal. “Let's sort the word clues, find each passage's main idea, and see what the details allow us to infer.”"
      ] }
    },
    {
      id: "chapter-07.grammar-observatory",
      title: "The Grammar Observatory",
      type: "learning",
      description: "Read each sentence and identify the part of speech of its highlighted word.",
      activityId: "chapter-07.parts-of-speech",
      skillIds: ["language.parts-of-speech"],
      metadata: { questionCount: 5, lessonLabel: "Nouns, verbs, adjectives, and adverbs" }
    },
    {
      id: "chapter-07.main-idea-room",
      title: "The Main-Idea Reading Room",
      type: "learning",
      description: "Read a short passage and choose the central idea that its details support.",
      activityId: "chapter-07.main-idea",
      skillIds: ["language.reading-main-idea"],
      metadata: { questionCount: 4, lessonLabel: "Finding the main idea" }
    },
    {
      id: "chapter-07.inference-archive",
      title: "The Inference Archive",
      type: "challenge",
      description: "Combine details in each passage to select an inference that the text supports.",
      activityId: "chapter-07.inference",
      skillIds: ["language.reading-inference"],
      metadata: { questionCount: 4, challengeLabel: "Evidence and inference", successText: "You used the clues to build careful, well-supported inferences!" }
    },
    {
      id: "chapter-07.library-restored",
      title: "The Library of Clear Ideas",
      type: "story",
      description: "The grammar labels return to their shelves and the reading journals are restored.",
      metadata: { paragraphs: [
        "The last word label settles into place. The library's grammar notebook now separates naming words, action words, describing words, and words that tell how an action happens.",
        "Athena smiles as the reading journal fills with thoughtful notes. “You found the ideas that connect the details, and you made inferences that stayed true to the evidence.”",
        "Professor Hoot presents Athena's Quill of Clarity. A new laboratory waits beyond the library, where careful measuring will help the academy discover the secrets of volume, mass, and time."
      ] }
    }
  ],
  majorRewardIds: [chapterSevenReward.id]
});

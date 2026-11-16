import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

const wordBuilderActivity = (id, title, skillId, focus, objective) => createActivityDefinition({
  id,
  title,
  skillIds: [skillId],
  objectives: [objective],
  supportedTiers,
  answerRules: { type: "exact", caseSensitive: false },
  generatorId: "language.word-building",
  generatorConstraints: {
    foundation: { focus, choiceCount: 4 },
    core: { focus, choiceCount: 4 },
    stretch: { focus, choiceCount: 4 }
  }
});

export const chapterThreeActivityDefinitions = Object.freeze([
  wordBuilderActivity(
    "chapter-03.prefix-workshop",
    "The Prefix Workbench",
    "language.prefixes",
    "prefix",
    "Build a correctly spelled word by adding a prefix to a root word."
  ),
  wordBuilderActivity(
    "chapter-03.suffix-workshop",
    "The Suffix Still",
    "language.suffixes",
    "suffix",
    "Build a correctly spelled word by adding a suffix to a root word."
  ),
  createActivityDefinition({
    id: "chapter-03.potion-inference",
    title: "The Context Clue Cauldron",
    skillIds: ["language.roots"],
    objectives: [
      "Use a sentence and a word's meaningful parts to infer what the whole word means."
    ],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "language.context-potion",
    generatorConstraints: {
      foundation: { choiceCount: 4 },
      core: { choiceCount: 4 },
      stretch: { choiceCount: 4 }
    }
  })
]);

const prefixDemonstration = {
  title: "A beginning changes the word",
  introduction: "A prefix is a word part added to the beginning of a root word.",
  steps: [
    {
      label: "Read the prefix",
      explanation: "The prefix re- means again.",
      visual: { kind: "diagram", content: "re- = again", ariaLabel: "The prefix re means again" }
    },
    {
      label: "Read the root",
      explanation: "The root play means to take part in a game or activity.",
      visual: { kind: "diagram", content: "play = take part in an activity", ariaLabel: "The root play" }
    },
    {
      label: "Blend the parts",
      explanation: "Put the beginning and root together to make replay.",
      visual: { kind: "equation", content: "re- + play = replay", ariaLabel: "Re plus play makes replay" }
    }
  ],
  summary: "A prefix comes before the root and changes the word's meaning."
};

const suffixDemonstration = {
  title: "An ending changes the word",
  introduction: "A suffix is a word part added to the end of a root word.",
  steps: [
    {
      label: "Read the root",
      explanation: "The root help means to give assistance.",
      visual: { kind: "diagram", content: "help = give assistance", ariaLabel: "The root help" }
    },
    {
      label: "Read the suffix",
      explanation: "The suffix -ful means full of.",
      visual: { kind: "diagram", content: "-ful = full of", ariaLabel: "The suffix ful means full of" }
    },
    {
      label: "Blend the parts",
      explanation: "Put the root and ending together to make helpful.",
      visual: { kind: "equation", content: "help + -ful = helpful", ariaLabel: "Help plus ful makes helpful" }
    }
  ],
  summary: "A suffix comes after the root and can change the word's meaning or job."
};

const contextDemonstration = {
  title: "Let the sentence be a clue",
  introduction: "A sentence often gives clues that help you work out a word's meaning.",
  steps: [
    {
      label: "Find the word",
      explanation: "Look for the word the potion recipe is asking you to understand.",
      visual: { kind: "diagram", content: "The artist gave us a preview.", ariaLabel: "Find the word preview" }
    },
    {
      label: "Notice the nearby clue",
      explanation: "The sentence says the preview came before the gallery opened.",
      visual: { kind: "diagram", content: "before the gallery opened", ariaLabel: "The words before the gallery opened are context clues" }
    },
    {
      label: "Use the word parts",
      explanation: "Pre- means before and view means look at, so a preview is an early look.",
      visual: { kind: "equation", content: "pre- + view = an early look", ariaLabel: "Pre plus view means an early look" }
    }
  ],
  summary: "Combine the word parts with the sentence clues. Check that the meaning makes sense in the story."
};

export const chapterThreeHintDefinitions = Object.freeze([
  {
    activityId: "chapter-03.prefix-workshop",
    title: "Professor Hoot's beginning clues",
    skillIds: ["language.prefixes"],
    stages: [
      { attempt: 1, kind: "nudge", message: "A prefix is added before the root. Look at the first word part." },
      { attempt: 2, kind: "strategy", message: "Read the prefix meaning first, then combine it with the root. Re- means again; un- means not; pre- means before." },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will build a word one part at a time.",
        demonstration: prefixDemonstration
      }
    ]
  },
  {
    activityId: "chapter-03.suffix-workshop",
    title: "Professor Hoot's ending clues",
    skillIds: ["language.suffixes"],
    stages: [
      { attempt: 1, kind: "nudge", message: "A suffix is added after the root. Look at the ending of the word." },
      { attempt: 2, kind: "strategy", message: "Read the root, then the suffix. -ful means full of, -less means without, and -er can mean a person who does something." },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will attach an ending to a familiar root.",
        demonstration: suffixDemonstration
      }
    ]
  },
  {
    activityId: "chapter-03.potion-inference",
    title: "Professor Hoot's potion clues",
    skillIds: ["language.roots"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Read the whole sentence. Which nearby words give you a clue about the mystery word?" },
      { attempt: 2, kind: "strategy", message: "Look at the root for the central idea, then use the prefix or suffix and the sentence to check the whole meaning." },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will use a sentence and its word parts to solve a potion clue.",
        demonstration: contextDemonstration
      }
    ]
  }
]);

export const chapterThreeReward = createRewardDefinition({
  id: "reward.chapter-03-lexicon-lantern",
  sourceId: "chapter-03",
  title: "Lexicon Lantern",
  starGems: 60,
  starlightSparkles: 4,
  replayPolicy: { type: "once" }
});

export const chapterThreeDefinition = createChapterDefinition({
  id: "chapter-03",
  title: "Spellbook of Spelling & Root Words",
  description: "Enter the potion classroom, build words from their parts, and use sentence clues to brew a clear-thinking potion.",
  objectives: [
    "Build correctly spelled words by combining prefixes, roots, and suffixes.",
    "Use word parts and sentence context to infer the meaning of an unfamiliar word."
  ],
  prerequisiteChapterIds: ["chapter-02"],
  activities: [
    {
      id: "chapter-03.spellbook-opens",
      title: "The spellbook's scattered words",
      type: "story",
      description: "A spellbook has lost its word parts, and the potion classroom needs your help.",
      metadata: {
        paragraphs: [
          "A narrow staircase leads from Apollo's amphitheater to the academy's potion classroom. Inside, a silver spellbook rests open beside a quiet cauldron.",
          "Mira, the classroom apprentice, points to words scattered across the page. “The beginnings and endings have drifted away from their roots. Without them, the instructions for our clarity potion do not make sense.”",
          "Professor Hoot lands beside the book. “A prefix goes before a root. A suffix goes after it. Put the parts together carefully, and the words will tell us what to do.”"
        ]
      }
    },
    {
      id: "chapter-03.prefix-workbench",
      title: "The Prefix Workbench",
      type: "learning",
      description: "Join a beginning word part to its root to make a correctly spelled word.",
      activityId: "chapter-03.prefix-workshop",
      skillIds: ["language.prefixes"],
      metadata: {
        questionCount: 1,
        lessonLabel: "Prefixes go before roots",
        successText: "The prefix snaps into place. The new word is ready for the spellbook!"
      }
    },
    {
      id: "chapter-03.suffix-still",
      title: "The Suffix Still",
      type: "learning",
      description: "Add an ending to a root. Notice how the suffix changes the word's meaning or job.",
      activityId: "chapter-03.suffix-workshop",
      skillIds: ["language.suffixes"],
      metadata: {
        questionCount: 1,
        lessonLabel: "Suffixes go after roots",
        successText: "The ending settles into place. The word now carries a new meaning!"
      }
    },
    {
      id: "chapter-03.context-clue-cauldron",
      title: "The Context Clue Cauldron",
      type: "challenge",
      description: "Read three potion notes and use their sentence clues and word parts to choose the meaning that fits.",
      activityId: "chapter-03.potion-inference",
      skillIds: ["language.roots"],
      metadata: {
        questionCount: 3,
        challengeLabel: "Potion clues",
        successText: "The cauldron settles into a bright blue glow. Your word clues made the potion clear!"
      }
    },
    {
      id: "chapter-03.potion-complete",
      title: "The clarity potion is ready",
      type: "story",
      description: "The words are restored, and the potion classroom is ready for its next lesson.",
      metadata: {
        paragraphs: [
          "The final potion note makes sense. The cauldron bubbles once, then releases a soft blue shimmer that fills the classroom.",
          "Mira carefully labels the bottle. “Now we can read every instruction. The word parts gave us clues, and the sentences helped us check our thinking.”",
          "The spellbook glows and awards you a Lexicon Lantern. Its light reveals another staircase leading deeper into the academy."
        ]
      }
    }
  ],
  majorRewardIds: [chapterThreeReward.id]
});

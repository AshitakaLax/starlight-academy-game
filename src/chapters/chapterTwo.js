import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

export const chapterTwoActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "chapter-02.fraction-models",
    title: "The Moonstone Mosaic",
    skillIds: ["math.fractions"],
    objectives: ["Recognize a fraction as shaded equal parts of one whole."],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "fractions.identify",
    generatorConstraints: {
      foundation: { denominatorMin: 4, denominatorMax: 5, choiceCount: 4 },
      core: { denominatorMin: 5, denominatorMax: 8, choiceCount: 4 },
      stretch: { denominatorMin: 6, denominatorMax: 10, choiceCount: 4 }
    }
  }),
  createActivityDefinition({
    id: "chapter-02.equivalent-fractions",
    title: "The Harmony Lens",
    skillIds: ["math.equivalent-fractions"],
    objectives: ["Recognize equivalent fractions by keeping the same amount of the whole."],
    supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId: "fractions.equivalent",
    generatorConstraints: {
      foundation: { denominatorMin: 2, denominatorMax: 3, multiplierMin: 3, multiplierMax: 4, choiceCount: 4 },
      core: { denominatorMin: 3, denominatorMax: 5, multiplierMin: 2, multiplierMax: 3, choiceCount: 4 },
      stretch: { denominatorMin: 4, denominatorMax: 8, multiplierMin: 2, multiplierMax: 4, choiceCount: 4 }
    }
  })
]);

const fractionDemonstration = {
  title: "Name the shaded parts",
  introduction: "A fraction names equal parts of one whole.",
  steps: [
    {
      label: "Count all equal parts",
      explanation: "The bottom number tells how many equal parts make the whole.",
      visual: { kind: "diagram", content: "The whole is split into 4 equal parts.", ariaLabel: "Four equal parts make one whole" }
    },
    {
      label: "Count the shaded parts",
      explanation: "The top number tells how many of those parts are shaded.",
      visual: { kind: "diagram", content: "Three of the four parts are shaded.", ariaLabel: "Three shaded parts out of four equal parts" }
    },
    {
      label: "Write the fraction",
      explanation: "Put the shaded count on top and the total equal-part count on the bottom.",
      visual: { kind: "equation", content: "3 shaded parts / 4 equal parts = 3/4", ariaLabel: "Three fourths" }
    }
  ],
  summary: "The numerator counts the shaded parts; the denominator counts all equal parts."
};

const equivalenceDemonstration = {
  title: "Keep the amount the same",
  introduction: "Equivalent fractions may use different numbers, but they name the same amount.",
  steps: [
    {
      label: "Start with one half",
      explanation: "One of two equal parts is shaded.",
      visual: { kind: "diagram", content: "1/2", ariaLabel: "One half" }
    },
    {
      label: "Split every part in two",
      explanation: "The whole now has four equal parts, and the shaded amount is split into two smaller pieces.",
      visual: { kind: "diagram", content: "2 shaded parts out of 4 equal parts", ariaLabel: "Two fourths" }
    },
    {
      label: "Compare the amount",
      explanation: "Both fractions cover the same amount of the whole.",
      visual: { kind: "equation", content: "1/2 = 2/4", ariaLabel: "One half equals two fourths" }
    }
  ],
  summary: "Multiply the numerator and denominator by the same number to make an equivalent fraction."
};

export const chapterTwoHintDefinitions = Object.freeze([
  {
    activityId: "chapter-02.fraction-models",
    title: "Professor Hoot's fraction clues",
    skillIds: ["math.fractions"],
    stages: [
      { attempt: 1, kind: "nudge", message: "First count how many equal parts make the whole. Then count the shaded parts." },
      { attempt: 2, kind: "strategy", message: "The total number of equal parts goes on the bottom; the shaded-part count goes on top." },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will count the parts with you.",
        demonstration: fractionDemonstration
      }
    ]
  },
  {
    activityId: "chapter-02.equivalent-fractions",
    title: "Professor Hoot's harmony clues",
    skillIds: ["math.equivalent-fractions"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look for a fraction that covers the same amount of the whole, even if it uses different numbers." },
      { attempt: 2, kind: "strategy", message: "Multiply or divide the top and bottom by the same number. The amount stays the same." },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will split each part into smaller equal pieces.",
        demonstration: equivalenceDemonstration
      }
    ]
  }
]);

export const chapterTwoReward = createRewardDefinition({
  id: "reward.chapter-02-harmony-medallion",
  sourceId: "chapter-02",
  title: "Apollo's Harmony Medallion",
  starGems: 50,
  starlightSparkles: 3,
  replayPolicy: { type: "once" }
});

export const chapterTwoDefinition = createChapterDefinition({
  id: "chapter-02",
  title: "Apollo's Musical Fractions",
  description: "Help Apollo restore the harmony of the Celestial Amphitheater by reading fraction mosaics and finding equal amounts.",
  objectives: [
    "Identify fractions using equal parts of a whole.",
    "Recognize equivalent fractions that name the same amount."
  ],
  prerequisiteChapterIds: ["chapter-01"],
  activities: [
    {
      id: "chapter-02.apollo-arrives",
      title: "A quiet song in the amphitheater",
      type: "story",
      description: "Apollo needs help bringing the moonstone music back into tune.",
      metadata: {
        paragraphs: [
          "Beyond the Lantern Tree, a silver path winds to the Celestial Amphitheater. Apollo is waiting beside a moonstone lyre whose strings have gone quiet.",
          "“The notes are hidden in the mosaics,” Apollo explains. “Each tile shows a part of one whole. When we understand how the parts fit together, the melody will return.”",
          "A row of glowing tiles appears across the floor. Professor Hoot flutters down to help you look closely."
        ]
      }
    },
    {
      id: "chapter-02.moonstone-mosaic",
      title: "The Moonstone Mosaic",
      type: "learning",
      description: "Look at a whole divided into equal parts. Find the fraction that names the shaded pieces.",
      activityId: "chapter-02.fraction-models",
      skillIds: ["math.fractions"],
      metadata: {
        questionCount: 1,
        lessonLabel: "Fractions of a whole",
        successText: "The mosaic glows! You named the shaded part of the whole."
      }
    },
    {
      id: "chapter-02.harmony-lens",
      title: "The Harmony Lens",
      type: "challenge",
      description: "Use the lens to find fractions that name the same amount. Three notes will bring the lyre back into harmony.",
      activityId: "chapter-02.equivalent-fractions",
      skillIds: ["math.equivalent-fractions"],
      metadata: {
        questionCount: 3,
        challengeLabel: "Harmony notes",
        successText: "The three notes ring together. You found fractions that name the same amount!"
      }
    },
    {
      id: "chapter-02.return-of-the-melody",
      title: "Apollo's melody returns",
      type: "story",
      description: "The mosaic and the Harmony Lens have restored the music.",
      metadata: {
        paragraphs: [
          "The final fraction settles into the moonstone floor. A clear note rises from the lyre, followed by a gentle harmony that fills the amphitheater.",
          "“Different fractions can name the very same amount,” Apollo says. “You listened for the pattern hidden in the numbers and brought our song back.”",
          "Apollo gives you a Harmony Medallion. The next path is waiting whenever you are ready for another adventure."
        ]
      }
    }
  ],
  majorRewardIds: [chapterTwoReward.id]
});

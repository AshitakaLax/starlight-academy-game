import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];

export const chapterOneActivityDefinitions = Object.freeze([
  createActivityDefinition({
    id: "chapter-01.skip-counting",
    title: "Firefly stepping stones",
    skillIds: ["math.skip-counting"],
    objectives: ["Continue a number pattern by adding the same amount each time."],
    supportedTiers,
    answerRules: { type: "numeric", tolerance: 0 },
    generatorId: "number.skip-counting",
    generatorConstraints: {
      foundation: { startMin: 0, startMax: 8, stepMin: 2, stepMax: 3, sequenceLength: 3, choiceCount: 4 },
      core: { startMin: 5, startMax: 40, stepMin: 3, stepMax: 8, sequenceLength: 4, choiceCount: 4 },
      stretch: { startMin: 10, startMax: 60, stepMin: 5, stepMax: 12, sequenceLength: 5, choiceCount: 4 }
    }
  }),
  createActivityDefinition({
    id: "chapter-01.multiplication-challenge",
    title: "The three lantern relay",
    skillIds: ["math.multiplication"],
    objectives: ["Solve multiplication facts by thinking in equal groups."],
    supportedTiers,
    answerRules: { type: "numeric", tolerance: 0 },
    generatorId: "arithmetic.multiplication",
    generatorConstraints: {
      foundation: { factorMin: 1, factorMax: 5, multiplierMin: 1, multiplierMax: 5, choiceCount: 4 },
      core: { factorMin: 2, factorMax: 10, multiplierMin: 2, multiplierMax: 10, choiceCount: 4 },
      stretch: { factorMin: 6, factorMax: 12, multiplierMin: 6, multiplierMax: 12, choiceCount: 4 }
    }
  })
]);

const multiplicationDemonstration = {
  title: "Build equal groups",
  introduction: "A multiplication fact is a quick way to count equal groups.",
  steps: [
    {
      label: "Count the groups",
      explanation: "The first number tells how many equal groups there are.",
      visual: { kind: "array", content: "3 rows of dots", ariaLabel: "Three equal rows of dots" }
    },
    {
      label: "Count each group",
      explanation: "The second number tells how many are in each group.",
      visual: { kind: "equation", content: "4 + 4 + 4 = 12", ariaLabel: "Four plus four plus four equals twelve" }
    },
    {
      label: "Find the total",
      explanation: "Three groups of four make twelve altogether.",
      visual: { kind: "array", content: "3 × 4 = 12", ariaLabel: "Three groups of four equal twelve" }
    }
  ],
  summary: "Equal groups make multiplication easier to picture."
};

const skipCountingDemonstration = {
  title: "Find the firefly pattern",
  introduction: "Skip counting means adding the same number each time.",
  steps: [
    {
      label: "Notice the first jump",
      explanation: "Compare two neighboring numbers to see how much the pattern grows.",
      visual: { kind: "number-line", content: "4 → 8  (+4)", ariaLabel: "A jump of four from four to eight" }
    },
    {
      label: "Keep the jump the same",
      explanation: "Add four again, then repeat the same jump for the next number.",
      visual: { kind: "sequence", content: "4, 8, 12, 16", ariaLabel: "Count by fours to sixteen" }
    }
  ],
  summary: "A skip-counting pattern keeps the same-sized step."
};

export const chapterOneHintDefinitions = Object.freeze([
  {
    activityId: "chapter-01.skip-counting",
    title: "Professor Hoot's pattern clues",
    skillIds: ["math.skip-counting"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look at the difference between two neighboring numbers. How big is one jump?" },
      { attempt: 2, kind: "strategy", message: "Say the jump out loud, then add that same amount to the last number." },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will trace the repeated jump with you.",
        demonstration: skipCountingDemonstration
      }
    ]
  },
  {
    activityId: "chapter-01.multiplication-challenge",
    title: "Professor Hoot's equal-group clues",
    skillIds: ["math.multiplication"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Picture the first number as groups and the second number as how many are in each group." },
      { attempt: 2, kind: "strategy", message: "Add the same group size again and again to find the total." },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will build an array one row at a time.",
        demonstration: multiplicationDemonstration
      }
    ]
  }
]);

export const chapterOneReward = createRewardDefinition({
  id: "reward.chapter-01-starfall-circlet",
  sourceId: "chapter-01",
  title: "Starfall Circlet",
  starGems: 40,
  starlightSparkles: 2,
  replayPolicy: { type: "once" }
});

export const chapterOneDefinition = createChapterDefinition({
  id: "chapter-01",
  title: "The Lantern Tree's First Light",
  description: "A letter from the old Lantern Tree leads to glowing stepping stones, a three-lantern puzzle, and a ribbon dance beneath the stars.",
  objectives: [
    "Continue equal-step patterns by skip counting.",
    "Use equal groups to solve multiplication facts.",
    "Trace a ribbon path and follow a gentle rhythm."
  ],
  activities: [
    {
      id: "chapter-01.opening-letter",
      title: "A letter in the Lantern Tree",
      type: "story",
      description: "A tiny lantern has gone dark. Read the tree's letter and discover how to help.",
      metadata: {
        paragraphs: [
          "At the edge of Starlight Academy stood an ancient tree with a thousand little lanterns in its branches. Each one glowed with a different color.",
          "One evening, a folded letter fluttered down from the highest branch. “Dear new friend,” it read, “the path to our first light is hidden in the fireflies. Follow their pattern, solve the lantern puzzle, and bring a little rhythm back to the tree.”",
          "A warm golden glow appeared between the roots. The adventure had begun."
        ]
      }
    },
    {
      id: "chapter-01.firefly-path",
      title: "Follow the firefly stepping stones",
      type: "learning",
      description: "The fireflies light one stone at a time. Find the next number by keeping the same-sized jump.",
      activityId: "chapter-01.skip-counting",
      skillIds: ["math.skip-counting"],
      metadata: { questionCount: 1, lessonLabel: "Skip counting", successText: "The next stone glows! You found the fireflies' steady pattern." }
    },
    {
      id: "chapter-01.lantern-relay",
      title: "The three-lantern relay",
      type: "challenge",
      description: "Three lanterns need a spark. Solve one equal-groups puzzle for each lantern; hints and retries are always welcome.",
      activityId: "chapter-01.multiplication-challenge",
      skillIds: ["math.multiplication"],
      metadata: { questionCount: 3, challengeLabel: "Lanterns lit", successText: "All three lanterns shine together. Your equal-groups thinking did it!" }
    },
    {
      id: "chapter-01.ribbon-dance",
      title: "The ribbon dance beneath the stars",
      type: "gymnastics",
      description: "Trace the glowing ribbon and tap along with the stars. The routine reaches its finish even when a beat is missed.",
      metadata: {
        routineId: "routine.starlight-ribbon",
        successText: "The ribbon's light has returned to the Lantern Tree."
      }
    },
    {
      id: "chapter-01.tree-awakens",
      title: "The Lantern Tree awakens",
      type: "story",
      description: "Watch the Lantern Tree shine again and collect your first academy keepsake.",
      metadata: {
        paragraphs: [
          "The ribbon's final star drifted into the tree's oldest lantern. Light traveled from branch to branch until the whole tree shimmered like a little galaxy.",
          "“You noticed the patterns, brought the groups together, and kept moving to the beat,” whispered the tree. “That is how small sparks become something wonderful.”",
          "Your adventure is only beginning. Your companion can visit from the Pet Studio, and your own creative look is waiting in the Wardrobe Studio whenever you feel like exploring."
        ]
      }
    }
  ],
  majorRewardIds: [chapterOneReward.id]
});

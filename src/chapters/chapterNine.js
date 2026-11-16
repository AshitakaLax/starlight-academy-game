import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const fourChoices = Object.freeze({
  foundation: { choiceCount: 4 }, core: { choiceCount: 4 }, stretch: { choiceCount: 4 }
});

function createChimeraActivity({ id, title, skillId, objective, generatorId }) {
  return createActivityDefinition({
    id, title, skillIds: [skillId], objectives: [objective], supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId, generatorConstraints: fourChoices
  });
}

export const chapterNineActivityDefinitions = Object.freeze([
  createChimeraActivity({
    id: "chapter-09.division-quests",
    title: "The Equal-Groups Gauntlet",
    skillId: "math.division",
    objective: "Interpret division as equal sharing and solve exact-quotient problems.",
    generatorId: "reasoning.division"
  }),
  createChimeraActivity({
    id: "chapter-09.arithmetic-forge",
    title: "The Multi-Digit Forge",
    skillId: "math.multi-digit-arithmetic",
    objective: "Solve multi-digit addition, subtraction, and multiplication problems with accurate place-value reasoning.",
    generatorId: "reasoning.multi-digit-arithmetic"
  }),
  createChimeraActivity({
    id: "chapter-09.multi-step-labyrinth",
    title: "The Three-Step Labyrinth",
    skillId: "math.multi-step-reasoning",
    objective: "Choose and carry out a sequence of operations to solve a multi-step word problem.",
    generatorId: "reasoning.multi-step"
  })
]);

const divisionDemonstration = {
  title: "Share equally",
  introduction: "Division can describe sharing a total into equal groups.",
  steps: [
    { label: "Name the total", explanation: "Start with the full number of objects you need to share.", visual: { kind: "diagram", content: "24 shells to share", ariaLabel: "Begin with 24 shells" } },
    { label: "Count the groups", explanation: "The number of equal groups tells you the divisor. Each group receives the same amount.", visual: { kind: "diagram", content: "24 shells ÷ 4 baskets", ariaLabel: "Share 24 shells among 4 baskets" } },
    { label: "Check with multiplication", explanation: "Multiply the amount in one group by the number of groups. The product should equal the original total.", visual: { kind: "equation", content: "6 × 4 = 24", ariaLabel: "Six in each of four groups makes 24" } }
  ],
  summary: "For equal sharing, divide the total by the number of groups. Check the quotient by multiplying."
};

const arithmeticDemonstration = {
  title: "Work with place value",
  introduction: "The operation sign tells you what to do. Place values help keep each step organized.",
  steps: [
    { label: "Read the operation", explanation: "For addition, combine amounts. For subtraction, find what remains or the difference. For multiplication, count equal groups.", visual: { kind: "diagram", content: "+  add  ·  −  subtract  ·  ×  multiply", ariaLabel: "Addition, subtraction, and multiplication signs" } },
    { label: "Line up the place values", explanation: "Keep ones under ones, tens under tens, and hundreds under hundreds. Regroup carefully when a column reaches ten or more.", visual: { kind: "diagram", content: "Hundreds · Tens · Ones", ariaLabel: "Line up hundreds, tens, and ones" } },
    { label: "Estimate and check", explanation: "Estimate the size of the answer. Then use the inverse operation or a quick regrouping check to see whether the exact answer makes sense.", visual: { kind: "equation", content: "Estimate → calculate → check", ariaLabel: "Estimate, calculate, and check the result" } }
  ],
  summary: "Follow the operation sign, organize by place value, and check that the answer is reasonable."
};

const multiStepDemonstration = {
  title: "Plan each step before you calculate",
  introduction: "Long word problems become easier when you solve one part at a time and carry the result forward.",
  steps: [
    { label: "Read and mark the clues", explanation: "Example: 5 bags hold 12 marbles each, 8 marbles are given away, and the rest are shared among 4 cups. Identify the quantities and what the question asks.", visual: { kind: "diagram", content: "5 bags · 12 in each · 8 given away · 4 cups", ariaLabel: "Quantities in a three-step word problem" } },
    { label: "Solve the first part", explanation: "Find the starting total: 5 × 12 = 60 marbles.", visual: { kind: "equation", content: "5 × 12 = 60", ariaLabel: "Five groups of twelve equal sixty" } },
    { label: "Carry the result forward", explanation: "Subtract the 8 given away: 60 − 8 = 52. Then share the 52 that remain: 52 ÷ 4 = 13 marbles in each cup.", visual: { kind: "equation", content: "60 − 8 = 52; 52 ÷ 4 = 13", ariaLabel: "Subtract eight then divide fifty-two by four to get thirteen" } }
  ],
  summary: "Write each intermediate result down. Use it in the next step, then check that the final answer matches the question."
};

export const chapterNineHintDefinitions = Object.freeze([
  {
    activityId: "chapter-09.division-quests",
    title: "Professor Hoot's equal-groups clues",
    skillIds: ["math.division"],
    stages: [
      { attempt: 1, kind: "nudge", message: "The total is being shared equally. How many groups are there?" },
      { attempt: 2, kind: "strategy", message: "Divide the total by the number of groups. Check by multiplying your answer by the group count." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will share a total into equal groups and check the result.", demonstration: divisionDemonstration }
    ]
  },
  {
    activityId: "chapter-09.arithmetic-forge",
    title: "Professor Hoot's place-value clues",
    skillIds: ["math.multi-digit-arithmetic"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look closely at the operation sign. Which operation does the problem ask you to use?" },
      { attempt: 2, kind: "strategy", message: "Line up the place values, work through the columns, regroup when needed, and estimate to check." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will organize a multi-digit calculation by place value.", demonstration: arithmeticDemonstration }
    ]
  },
  {
    activityId: "chapter-09.multi-step-labyrinth",
    title: "Professor Hoot's step-by-step clues",
    skillIds: ["math.multi-step-reasoning"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Underline the quantities and the order of events. What needs to be found first?" },
      { attempt: 2, kind: "strategy", message: "Choose the first operation, write its result, and use that result in the next step. Do not try to do the whole story in one calculation." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will solve a three-step story problem one calculation at a time.", demonstration: multiStepDemonstration }
    ]
  }
]);

export const chapterNineReward = createRewardDefinition({
  id: "reward.chapter-09-chimeras-strategy-stone",
  sourceId: "chapter-09",
  title: "Chimera's Strategy Stone",
  starGems: 120,
  starlightSparkles: 10,
  replayPolicy: { type: "once" }
});

export const chapterNineDefinition = createChapterDefinition({
  id: "chapter-09",
  title: "The Chimera's Multi-Step Challenge",
  description: "Enter the Chimera's friendly puzzle workshop to share equal groups, forge accurate multi-digit calculations, and plan a path through challenging word problems.",
  prerequisiteChapterIds: ["chapter-08"],
  objectives: [
    "Interpret division as equal sharing and solve exact-quotient problems.",
    "Use place-value strategies to solve multi-digit addition, subtraction, and multiplication.",
    "Choose and connect operations to solve multi-step word problems."
  ],
  activities: [
    {
      id: "chapter-09.workshop-arrival",
      title: "The Chimera's Puzzle Workshop",
      type: "story",
      description: "A friendly guardian invites the student into a workshop filled with number tiles, equal-group puzzles, and a winding path of clues.",
      metadata: { paragraphs: [
        "Beyond Poseidon's laboratory, a stone arch opens into a quiet puzzle workshop. A friendly Chimera guardian waits beside shelves of number tiles and neatly stacked puzzle cards.",
        "The guardian speaks in a warm voice. “A tricky problem is not one giant mystery. Share a total into equal groups, use place value carefully, and follow each clue in order.”",
        "Professor Hoot unfurls a map of the workshop. “We will solve division puzzles, forge accurate multi-digit calculations, and carry each result forward through a multi-step challenge. You can pause, ask for a hint, and return whenever you are ready.”"
      ] }
    },
    {
      id: "chapter-09.equal-groups",
      title: "The Equal-Groups Gauntlet",
      type: "learning",
      description: "Share each collection equally and find the number of objects in one group.",
      activityId: "chapter-09.division-quests",
      skillIds: ["math.division"],
      metadata: { questionCount: 5, lessonLabel: "Division as equal sharing" }
    },
    {
      id: "chapter-09.multi-digit-forge",
      title: "The Multi-Digit Forge",
      type: "learning",
      description: "Use the operation sign and place-value reasoning to calculate accurately.",
      activityId: "chapter-09.arithmetic-forge",
      skillIds: ["math.multi-digit-arithmetic"],
      metadata: { questionCount: 5, lessonLabel: "Multi-digit addition, subtraction, and multiplication" }
    },
    {
      id: "chapter-09.step-labyrinth",
      title: "The Three-Step Labyrinth",
      type: "challenge",
      description: "Read each story, plan the operations in order, and carry each intermediate answer into the next step.",
      activityId: "chapter-09.multi-step-labyrinth",
      skillIds: ["math.multi-step-reasoning"],
      metadata: { questionCount: 4, challengeLabel: "Multi-step progress", successText: "You followed every clue and reached the correct result!" }
    },
    {
      id: "chapter-09.workshop-restored",
      title: "A Clear Path Through the Puzzle",
      type: "story",
      description: "The number tiles are organized, the group puzzles are solved, and the final clue is clear.",
      metadata: { paragraphs: [
        "The last number tile clicks into place. The equal groups are balanced, the place-value calculations are checked, and every step of the word problems leads to the next.",
        "The Chimera guardian smiles. “You did not rush through the maze. You made a plan, checked each result, and kept going when a problem looked long.”",
        "Professor Hoot presents the Chimera's Strategy Stone. Only one academy adventure remains: the Grand Starlight Championship, where all your discoveries will come together."
      ] }
    }
  ],
  majorRewardIds: [chapterNineReward.id]
});

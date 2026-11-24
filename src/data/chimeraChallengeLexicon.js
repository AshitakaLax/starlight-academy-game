function deepFreeze(value) {
  if (!value || typeof value !== "object") return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

const DIVISION_SETTINGS = Object.freeze({
  foundation: Object.freeze({ divisorMin: 2, divisorMax: 5, quotientMin: 2, quotientMax: 9 }),
  core: Object.freeze({ divisorMin: 3, divisorMax: 9, quotientMin: 6, quotientMax: 18 }),
  stretch: Object.freeze({ divisorMin: 4, divisorMax: 12, quotientMin: 12, quotientMax: 36 })
});

export function getDivisionSettings(tier = "core") {
  const settings = DIVISION_SETTINGS[tier];
  if (!settings) throw new RangeError("Unknown division difficulty tier: " + tier);
  return { ...settings };
}

const MULTI_STEP_PROBLEMS = [
  {
    id: "fair-tokens", tier: "foundation", title: "Tokens for the Fair",
    story: "The academy fair collects 24 blue tokens and 18 gold tokens. Then 7 tokens are used to award prizes.",
    question: "How many tokens remain?",
    startValue: 24,
    steps: [
      { operation: "add", operand: 18, label: "Combine the tokens", explanation: "Add the blue and gold tokens: 24 + 18 = 42." },
      { operation: "subtract", operand: 7, label: "Remove the prize tokens", explanation: "Take away the 7 tokens used for prizes: 42 − 7 = 35." }
    ],
    answer: 35,
    stepPrompts: ["First find how many tokens were collected altogether.", "Then subtract the tokens used for prizes."],
    explanation: "First, 24 + 18 = 42 tokens. Then 42 − 7 = 35 tokens remain."
  },
  {
    id: "shell-trays", tier: "foundation", title: "Shells for the Display",
    story: "A collector places 8 shells in each of 3 display trays. Later, 5 more shells are added to the display.",
    question: "How many shells are in the display now?",
    startValue: 8,
    steps: [
      { operation: "multiply", operand: 3, label: "Count the shells in all trays", explanation: "There are 3 equal trays with 8 shells each: 8 × 3 = 24." },
      { operation: "add", operand: 5, label: "Add the extra shells", explanation: "Add the 5 new shells: 24 + 5 = 29." }
    ],
    answer: 29,
    stepPrompts: ["First find the total in the equal groups.", "Then add the extra shells."],
    explanation: "First, 8 × 3 = 24 shells. Then 24 + 5 = 29 shells."
  },
  {
    id: "pearl-baskets", tier: "foundation", title: "Pearls in Baskets",
    story: "Poseidon shares 36 pearls equally among 4 baskets. He then places 2 more pearls in each basket.",
    question: "How many pearls are in each basket?",
    startValue: 36,
    steps: [
      { operation: "divide", operand: 4, label: "Share the pearls equally", explanation: "Share 36 pearls among 4 baskets: 36 ÷ 4 = 9 pearls per basket." },
      { operation: "add", operand: 2, label: "Add pearls to each basket", explanation: "Add 2 pearls to each basket: 9 + 2 = 11." }
    ],
    answer: 11,
    stepPrompts: ["First share the pearls equally among the baskets.", "Then add the extra pearls in each basket."],
    explanation: "First, 36 ÷ 4 = 9 pearls per basket. Then 9 + 2 = 11 pearls per basket."
  },

  {
    id: "library-scrolls", tier: "core", title: "Scrolls in the Library",
    story: "The library has 248 scrolls. Athena brings 86 more, and students borrow 57 scrolls.",
    question: "How many scrolls are in the library now?",
    startValue: 248,
    steps: [
      { operation: "add", operand: 86, label: "Add the new scrolls", explanation: "Combine the original scrolls and the new ones: 248 + 86 = 334." },
      { operation: "subtract", operand: 57, label: "Subtract the borrowed scrolls", explanation: "Take away the borrowed scrolls: 334 − 57 = 277." }
    ],
    answer: 277,
    stepPrompts: ["Find the number of scrolls after the delivery.", "Then subtract the scrolls that were borrowed."],
    explanation: "First, 248 + 86 = 334 scrolls. Then 334 − 57 = 277 scrolls remain."
  },
  {
    id: "lantern-crates", tier: "core", title: "Lanterns for the Harbor",
    story: "Six crates hold 24 lanterns each. The harbor crew uses 35 lanterns to light the dock.",
    question: "How many lanterns are left?",
    startValue: 24,
    steps: [
      { operation: "multiply", operand: 6, label: "Find the lanterns in all crates", explanation: "Six groups of 24 lanterns make 24 × 6 = 144." },
      { operation: "subtract", operand: 35, label: "Remove the lanterns used", explanation: "Subtract the 35 lanterns used at the dock: 144 − 35 = 109." }
    ],
    answer: 109,
    stepPrompts: ["First find the total number of lanterns in all six crates.", "Then take away the lanterns used at the dock."],
    explanation: "First, 24 × 6 = 144 lanterns. Then 144 − 35 = 109 lanterns remain."
  },
  {
    id: "stone-boxes", tier: "core", title: "Stones for the Boxes",
    story: "A team shares 84 smooth stones equally among 7 boxes. They add 4 more stones to each box.",
    question: "How many stones are in each box now?",
    startValue: 84,
    steps: [
      { operation: "divide", operand: 7, label: "Share the stones equally", explanation: "Share 84 stones among 7 boxes: 84 ÷ 7 = 12 stones in each box." },
      { operation: "add", operand: 4, label: "Add stones to each box", explanation: "Add 4 stones to each box: 12 + 4 = 16." }
    ],
    answer: 16,
    stepPrompts: ["Find how many stones go into each box first.", "Then add the 4 extra stones in each box."],
    explanation: "First, 84 ÷ 7 = 12 stones. Then 12 + 4 = 16 stones in each box."
  },

  {
    id: "harbor-flags", tier: "stretch", title: "Flags for Five Harbors",
    story: "Eight ships carry 125 flags each. The crew delivers 240 flags to the academy. The remaining flags are shared equally among 5 harbors.",
    question: "How many flags does each harbor receive?",
    startValue: 125,
    steps: [
      { operation: "multiply", operand: 8, label: "Find the total number of flags", explanation: "Eight ships carry 125 flags each: 125 × 8 = 1,000." },
      { operation: "subtract", operand: 240, label: "Subtract the delivered flags", explanation: "Subtract the 240 flags delivered: 1,000 − 240 = 760." },
      { operation: "divide", operand: 5, label: "Share the remaining flags", explanation: "Share the 760 remaining flags among 5 harbors: 760 ÷ 5 = 152." }
    ],
    answer: 152,
    stepPrompts: ["Find the total on all eight ships.", "Subtract the flags delivered to the academy.", "Share what remains equally among the five harbors."],
    explanation: "First, 125 × 8 = 1,000. Then 1,000 − 240 = 760. Finally, 760 ÷ 5 = 152 flags per harbor."
  },
  {
    id: "exhibition-cases", tier: "stretch", title: "Cards for the Exhibition",
    story: "Students collect 248 blue cards and 176 silver cards. They share the cards equally among 8 display cases, then set aside 7 cards from each case.",
    question: "How many cards remain in each display case?",
    startValue: 248,
    steps: [
      { operation: "add", operand: 176, label: "Combine both collections", explanation: "Add the blue and silver cards: 248 + 176 = 424." },
      { operation: "divide", operand: 8, label: "Share the cards among the cases", explanation: "Share 424 cards among 8 cases: 424 ÷ 8 = 53 cards per case." },
      { operation: "subtract", operand: 7, label: "Set aside cards from each case", explanation: "Set aside 7 from each case: 53 − 7 = 46." }
    ],
    answer: 46,
    stepPrompts: ["Find the total number of cards first.", "Share that total equally among the eight cases.", "Then subtract the 7 cards set aside from each case."],
    explanation: "First, 248 + 176 = 424. Then 424 ÷ 8 = 53. Finally, 53 − 7 = 46 cards per case."
  },
  {
    id: "team-puzzle-cards", tier: "stretch", title: "Puzzle Cards for the Teams",
    story: "Nine teams sort 48 puzzle cards each. The academy reserves 72 cards for an exhibition. The remaining cards are shared equally among the 9 teams.",
    question: "How many cards does each team receive?",
    startValue: 48,
    steps: [
      { operation: "multiply", operand: 9, label: "Count all the team cards", explanation: "Nine teams with 48 cards each have 48 × 9 = 432 cards." },
      { operation: "subtract", operand: 72, label: "Remove the exhibition cards", explanation: "Subtract the 72 reserved cards: 432 − 72 = 360." },
      { operation: "divide", operand: 9, label: "Share the remaining cards", explanation: "Share 360 cards among 9 teams: 360 ÷ 9 = 40." }
    ],
    answer: 40,
    stepPrompts: ["Find the total number of cards across all teams.", "Subtract the cards reserved for the exhibition.", "Divide the remaining cards equally among the teams."],
    explanation: "First, 48 × 9 = 432. Then 432 − 72 = 360. Finally, 360 ÷ 9 = 40 cards per team."
  }
];

export const multiStepProblemBank = deepFreeze(MULTI_STEP_PROBLEMS);

const TIER_ORDER = Object.freeze({ foundation: 0, core: 1, stretch: 2 });

export function getMultiStepProblems(tier = "core") {
  if (!Object.hasOwn(TIER_ORDER, tier)) throw new RangeError("Unknown multi-step difficulty tier: " + tier);
  return multiStepProblemBank.filter((problem) => TIER_ORDER[problem.tier] <= TIER_ORDER[tier]);
}

import { DIFFICULTY_TIER_IDS } from "./difficultyTiers.js";

function defineSkill(id, subject, title, objective) {
  return Object.freeze({
    id,
    subject,
    title,
    objective,
    supportedTiers: DIFFICULTY_TIER_IDS
  });
}

/**
 * Stable IDs are save-data contracts. Add new skills here rather than
 * inventing identifiers inside individual activity implementations.
 */
export const skillDefinitions = Object.freeze([
  defineSkill("math.skip-counting", "mathematics", "Skip counting", "Recognize and continue equal-step number patterns."),
  defineSkill("math.multiplication", "mathematics", "Multiplication", "Understand equal groups and solve multiplication facts."),
  defineSkill("math.fractions", "mathematics", "Fractions", "Represent fractions as equal parts of a whole."),
  defineSkill("math.equivalent-fractions", "mathematics", "Equivalent fractions", "Recognize fractions that name the same amount."),
  defineSkill("math.shape-recognition", "mathematics", "Shape recognition", "Identify and describe two-dimensional and three-dimensional shapes."),
  defineSkill("math.angles", "mathematics", "Angles", "Identify and compare angles using their size."),
  defineSkill("math.symmetry", "mathematics", "Symmetry", "Recognize lines of symmetry and matching reflected parts."),
  defineSkill("math.perimeter", "mathematics", "Perimeter", "Find the distance around a two-dimensional shape."),
  defineSkill("math.area", "mathematics", "Area", "Measure the surface covered by a two-dimensional shape."),
  defineSkill("science.habitats", "science", "Habitats", "Match living things to environments that meet their needs."),
  defineSkill("science.adaptations", "science", "Adaptations", "Explain how observable traits help organisms survive."),
  defineSkill("science.plant-life-cycles", "science", "Plant life cycles", "Sequence the stages in a plant life cycle."),
  defineSkill("science.plant-resources", "science", "Plant resources", "Explain how plants use water, sunlight, and air to grow."),
  defineSkill("language.prefixes", "language-arts", "Prefixes", "Use common prefixes to change a word's meaning."),
  defineSkill("language.roots", "language-arts", "Root words", "Identify common roots and use them to understand word meaning."),
  defineSkill("language.suffixes", "language-arts", "Suffixes", "Use common suffixes to change a word's form or meaning."),
  defineSkill("language.parts-of-speech", "language-arts", "Parts of speech", "Identify nouns, verbs, adjectives, and other sentence roles."),
  defineSkill("language.reading-main-idea", "language-arts", "Reading: main idea", "Identify the central idea and supporting details in a passage."),
  defineSkill("language.reading-inference", "language-arts", "Reading: inference", "Use clues in a passage to make a supported inference."),
  defineSkill("math.volume", "mathematics", "Volume", "Measure the amount of space inside a three-dimensional figure."),
  defineSkill("math.mass", "mathematics", "Mass", "Compare and measure mass using appropriate units."),
  defineSkill("math.unit-conversion", "mathematics", "Unit conversion", "Convert measurements within a consistent unit system."),
  defineSkill("math.elapsed-time", "mathematics", "Elapsed time", "Find the time that passes between two clock times."),
  defineSkill("math.division", "mathematics", "Division", "Interpret division as sharing and grouping."),
  defineSkill("math.multi-digit-arithmetic", "mathematics", "Multi-digit arithmetic", "Solve multi-digit addition, subtraction, and related calculations."),
  defineSkill("math.multi-step-reasoning", "mathematics", "Multi-step reasoning", "Choose and connect operations to solve a multi-step problem.")
]);

export const skillRegistry = Object.freeze(
  Object.fromEntries(skillDefinitions.map((skill) => [skill.id, skill]))
);

export function getSkillDefinition(id) {
  return typeof id === "string" && Object.hasOwn(skillRegistry, id) ? skillRegistry[id] : null;
}

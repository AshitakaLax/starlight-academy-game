/**
 * A deliberately balanced Chapter 10 sampler.
 * Each curriculum subject appears four times, and every sampled skill is unique.
 * Activities reuse the original chapter generators and Professor Hoot hint sets.
 */
function defineChampionshipEvent(id, title, subject, skillId, activityId, lessonLabel, description) {
  return Object.freeze({ id, title, subject, skillId, activityId, lessonLabel, description });
}

export const grandStarlightSampler = Object.freeze([
  defineChampionshipEvent(
    "chapter-10.math-equal-groups", "The Equal-Groups Star", "mathematics",
    "math.multiplication", "chapter-01.multiplication-challenge",
    "Mathematics · equal groups",
    "Use equal groups to solve a multiplication puzzle."
  ),
  defineChampionshipEvent(
    "chapter-10.math-fraction-harmony", "The Fraction Harmony Star", "mathematics",
    "math.equivalent-fractions", "chapter-02.equivalent-fractions",
    "Mathematics · equivalent fractions",
    "Find a fraction that names the same amount as the one shown."
  ),
  defineChampionshipEvent(
    "chapter-10.math-angle-compass", "The Angle Compass Star", "mathematics",
    "math.angles", "chapter-04.angle-turn",
    "Mathematics · angles",
    "Classify an angle by comparing its measurement with a right angle."
  ),
  defineChampionshipEvent(
    "chapter-10.math-stepwise-path", "The Stepwise Path Star", "mathematics",
    "math.multi-step-reasoning", "chapter-09.multi-step-labyrinth",
    "Mathematics · multi-step reasoning",
    "Plan a sequence of operations and carry each result into the next step."
  ),
  defineChampionshipEvent(
    "chapter-10.science-habitat-map", "The Habitat Map Star", "science",
    "science.habitats", "chapter-05.biome-clues",
    "Science · habitats",
    "Use climate, food, and shelter clues to match a creature with its habitat."
  ),
  defineChampionshipEvent(
    "chapter-10.science-survival-clue", "The Survival Clue Star", "science",
    "science.adaptations", "chapter-05.survival-strategies",
    "Science · adaptations",
    "Explain how an observable adaptation helps an animal survive."
  ),
  defineChampionshipEvent(
    "chapter-10.science-life-cycle", "The Life-Cycle Star", "science",
    "science.plant-life-cycles", "chapter-06.lifecycle-sequence",
    "Science · plant life cycles",
    "Follow the stages of a flowering plant and choose what comes next."
  ),
  defineChampionshipEvent(
    "chapter-10.science-greenhouse", "The Greenhouse Star", "science",
    "science.plant-resources", "chapter-06.greenhouse-resources",
    "Science · plant resources",
    "Choose the resource that would most directly help a plant in its situation."
  ),
  defineChampionshipEvent(
    "chapter-10.language-prefix", "The Prefix Star", "language-arts",
    "language.prefixes", "chapter-03.prefix-workshop",
    "Language arts · prefixes",
    "Use a word beginning to build a correctly spelled word with a new meaning."
  ),
  defineChampionshipEvent(
    "chapter-10.language-root", "The Root-Word Star", "language-arts",
    "language.roots", "chapter-03.potion-inference",
    "Language arts · root words",
    "Use word parts and sentence clues to understand an unfamiliar word."
  ),
  defineChampionshipEvent(
    "chapter-10.language-main-idea", "The Main-Idea Star", "language-arts",
    "language.reading-main-idea", "chapter-07.main-idea",
    "Language arts · main idea",
    "Choose the statement that best expresses the central idea of a passage."
  ),
  defineChampionshipEvent(
    "chapter-10.language-inference", "The Inference Star", "language-arts",
    "language.reading-inference", "chapter-07.inference",
    "Language arts · inference",
    "Use details in a passage to make an inference supported by the text."
  )
]);

export const grandStarlightSubjectOrder = Object.freeze([
  "mathematics", "science", "language-arts"
]);

export function getGrandStarlightSampler() {
  return grandStarlightSampler;
}

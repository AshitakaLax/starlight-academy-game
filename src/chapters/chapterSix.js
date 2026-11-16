import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const fourChoices = Object.freeze({
  foundation: { choiceCount: 4 }, core: { choiceCount: 4 }, stretch: { choiceCount: 4 }
});

function createGreenhouseActivity({ id, title, skillId, objective, generatorId }) {
  return createActivityDefinition({
    id, title, skillIds: [skillId], objectives: [objective], supportedTiers,
    answerRules: { type: "exact", caseSensitive: false },
    generatorId, generatorConstraints: fourChoices
  });
}

export const chapterSixActivityDefinitions = Object.freeze([
  createGreenhouseActivity({
    id: "chapter-06.lifecycle-sequence",
    title: "The Seed-to-Flower Path",
    skillId: "science.plant-life-cycles",
    objective: "Sequence the stages of a flowering plant's life cycle from seed to new seeds.",
    generatorId: "botany.lifecycle-next"
  }),
  createGreenhouseActivity({
    id: "chapter-06.greenhouse-resources",
    title: "The Greenhouse Care Station",
    skillId: "science.plant-resources",
    objective: "Choose the resource that best addresses a plant's growing condition.",
    generatorId: "botany.resource-choice"
  }),
  createGreenhouseActivity({
    id: "chapter-06.photosynthesis-recipe",
    title: "The Photosynthesis Recipe",
    skillId: "science.plant-resources",
    objective: "Identify sunlight, water, and carbon dioxide as the inputs used in photosynthesis.",
    generatorId: "botany.photosynthesis-inputs"
  })
]);

const lifecycleDemonstration = {
  title: "Follow the flowering-plant life cycle",
  introduction: "A flowering plant grows, reproduces, and produces seeds that can begin the cycle again.",
  steps: [
    {
      label: "Begin with a seed",
      explanation: "A seed protects a tiny plant and contains stored food for its early growth.",
      visual: { kind: "diagram", content: "Seed", ariaLabel: "The life cycle begins with a seed" }
    },
    {
      label: "Germination begins",
      explanation: "With suitable water and warmth, the seed begins to grow and a root emerges.",
      visual: { kind: "diagram", content: "Seed → germination", ariaLabel: "A seed begins to germinate and a root emerges" }
    },
    {
      label: "A seedling grows",
      explanation: "The young plant develops roots, a stem, and leaves.",
      visual: { kind: "diagram", content: "Germination → seedling", ariaLabel: "The germinating seed grows into a seedling" }
    },
    {
      label: "The plant flowers",
      explanation: "As the plant matures, it can produce flowers.",
      visual: { kind: "diagram", content: "Seedling → flowering plant", ariaLabel: "The seedling grows into a mature flowering plant" }
    },
    {
      label: "New seeds form",
      explanation: "After pollination and fertilization, fruit develops and contains new seeds.",
      visual: { kind: "equation", content: "Flowering plant → fruit with seeds → new cycle", ariaLabel: "A flowering plant can produce fruit with seeds that begin another cycle" }
    }
  ],
  summary: "Seed → germination → seedling → mature flowering plant → fruit with new seeds."
};

const resourceDemonstration = {
  title: "Choose the resource a plant needs",
  introduction: "Different resources help plants in different ways. Read the growing condition before choosing.",
  steps: [
    {
      label: "Check the soil",
      explanation: "Roots absorb water from the growing mix. A plant in dry soil may need water.",
      visual: { kind: "diagram", content: "Roots take in water", ariaLabel: "Plant roots absorb water" }
    },
    {
      label: "Check the light",
      explanation: "Sunlight provides the energy for photosynthesis, the process plants use to make sugars.",
      visual: { kind: "diagram", content: "Sunlight provides energy", ariaLabel: "Sunlight supplies energy for photosynthesis" }
    },
    {
      label: "Check the air",
      explanation: "Leaves take in carbon dioxide from the air for photosynthesis.",
      visual: { kind: "diagram", content: "Leaves take in carbon dioxide", ariaLabel: "Carbon dioxide from air enters leaves" }
    },
    {
      label: "Check growing nutrients",
      explanation: "Mineral nutrients help plants grow, but they are not one of the three inputs in photosynthesis.",
      visual: { kind: "equation", content: "Growth nutrients ≠ photosynthesis inputs", ariaLabel: "Mineral nutrients support growth but are not photosynthesis inputs" }
    }
  ],
  summary: "Water, sunlight, and carbon dioxide are the three inputs used in photosynthesis; mineral nutrients also support healthy growth."
};

const photosynthesisDemonstration = {
  title: "Build the photosynthesis recipe",
  introduction: "Photosynthesis captures light energy and uses water and carbon dioxide to make sugars.",
  steps: [
    {
      label: "Gather light energy",
      explanation: "Sunlight provides the energy that powers the process.",
      visual: { kind: "diagram", content: "Sunlight → energy", ariaLabel: "Sunlight provides energy for photosynthesis" }
    },
    {
      label: "Take in water and carbon dioxide",
      explanation: "Roots absorb water. Carbon dioxide enters the leaves from the air.",
      visual: { kind: "diagram", content: "Water from roots + carbon dioxide from air", ariaLabel: "Water enters through roots and carbon dioxide enters leaves" }
    },
    {
      label: "Make and release",
      explanation: "The plant makes sugar and releases oxygen as a byproduct.",
      visual: { kind: "equation", content: "Sunlight + water + carbon dioxide → sugars + oxygen", ariaLabel: "Photosynthesis uses sunlight water and carbon dioxide to make sugars and release oxygen" }
    }
  ],
  summary: "Photosynthesis uses sunlight, water, and carbon dioxide to make sugars; oxygen is released."
};

export const chapterSixHintDefinitions = Object.freeze([
  {
    activityId: "chapter-06.lifecycle-sequence",
    title: "Professor Hoot's life-cycle clues",
    skillIds: ["science.plant-life-cycles"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look at the last stage shown. Is the plant still a seed, beginning to sprout, growing leaves, flowering, or making new seeds?" },
      { attempt: 2, kind: "strategy", message: "Keep the growth order in mind: seed, germination, seedling, mature flowering plant, then fruit with new seeds." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will walk through the flowering-plant life cycle one stage at a time.", demonstration: lifecycleDemonstration }
    ]
  },
  {
    activityId: "chapter-06.greenhouse-resources",
    title: "Professor Hoot's greenhouse clues",
    skillIds: ["science.plant-resources"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Notice what the plant already has. Which resource is missing from the situation?" },
      { attempt: 2, kind: "strategy", message: "Roots absorb water, sunlight supplies energy, leaves take in carbon dioxide, and minerals support growth." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will check the soil, light, air, and growing nutrients.", demonstration: resourceDemonstration }
    ]
  },
  {
    activityId: "chapter-06.photosynthesis-recipe",
    title: "Professor Hoot's photosynthesis clues",
    skillIds: ["science.plant-resources"],
    stages: [
      { attempt: 1, kind: "nudge", message: "The recipe needs energy from light and two materials from the plant's surroundings." },
      { attempt: 2, kind: "strategy", message: "Remember the paths: water comes in through roots and carbon dioxide comes in from air; sunlight supplies energy." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot will build the photosynthesis recipe and identify its outputs.", demonstration: photosynthesisDemonstration }
    ]
  }
]);

export const chapterSixReward = createRewardDefinition({
  id: "reward.chapter-06-sunrise-seed-satchel",
  sourceId: "chapter-06",
  title: "Sunrise Seed Satchel",
  starGems: 90,
  starlightSparkles: 7,
  replayPolicy: { type: "once" }
});

export const chapterSixDefinition = createChapterDefinition({
  id: "chapter-06",
  title: "Demeter's Enchanted Greenhouse",
  description: "Join Demeter among the seedlings to restore the greenhouse, sequence a flowering plant's life cycle, and choose the resources plants need to grow.",
  objectives: [
    "Sequence a flowering plant's life cycle from seed through fruit with new seeds.",
    "Choose water, sunlight, carbon dioxide, or mineral nutrients to address a greenhouse growing condition.",
    "Identify sunlight, water, and carbon dioxide as the inputs plants use in photosynthesis."
  ],
  prerequisiteChapterIds: ["chapter-05"],
  activities: [
    {
      id: "chapter-06.greenhouse-arrival",
      title: "The Enchanted Greenhouse",
      type: "story",
      description: "Demeter welcomes the student to a greenhouse where the seed trays and growing stations need attention.",
      metadata: { paragraphs: [
        "Warm golden light glows through the glass roof of Demeter's Enchanted Greenhouse. Trays of seeds line the benches, and young leaves reach toward the windows.",
        "Demeter opens a garden journal. “Some of our plant labels have fallen out of order, and the greenhouse care notes are mixed together. Let's follow the plant life cycle and work out what each growing plant needs.”",
        "Professor Hoot points to a fresh page titled The Photosynthesis Recipe. “A plant uses light energy, water, and carbon dioxide to make sugars. We will keep those inputs clear as we care for the greenhouse.”"
      ] }
    },
    {
      id: "chapter-06.lifecycle-path",
      title: "The Seed-to-Flower Path",
      type: "learning",
      description: "Read the stages already shown and choose which flowering-plant life-cycle stage follows.",
      activityId: "chapter-06.lifecycle-sequence",
      skillIds: ["science.plant-life-cycles"],
      metadata: {
        questionCount: 4,
        lessonLabel: "Flowering-plant life cycle",
        successText: "The seed-to-flower path is back in the right order!"
      }
    },
    {
      id: "chapter-06.greenhouse-care",
      title: "The Greenhouse Care Station",
      type: "learning",
      description: "Investigate each plant's condition and select the resource that would most directly help.",
      activityId: "chapter-06.greenhouse-resources",
      skillIds: ["science.plant-resources"],
      metadata: {
        questionCount: 4,
        lessonLabel: "Plant resource choices",
        successText: "The greenhouse care stations now have the right resources!"
      }
    },
    {
      id: "chapter-06.photosynthesis-challenge",
      title: "The Photosynthesis Recipe",
      type: "challenge",
      description: "Choose the three inputs a plant uses to make sugars during photosynthesis.",
      activityId: "chapter-06.photosynthesis-recipe",
      skillIds: ["science.plant-resources"],
      metadata: {
        questionCount: 3,
        challengeLabel: "Photosynthesis recipe",
        successText: "The photosynthesis recipe is complete!"
      }
    },
    {
      id: "chapter-06.greenhouse-restored",
      title: "A Greenhouse in Bloom",
      type: "story",
      description: "The plant journals are restored and the greenhouse begins to flourish.",
      metadata: { paragraphs: [
        "The last journal page settles into place. Seeds, sprouts, seedlings, flowers, and new seeds are connected in a repeating circle.",
        "Demeter surveys the healthy greenhouse. “You followed the life cycle, chose the resources each plant needed, and completed the photosynthesis recipe.”",
        "Professor Hoot presents a Sunrise Seed Satchel. Beyond the greenhouse, the academy library doors open to a room full of books and word puzzles."
      ] }
    }
  ],
  majorRewardIds: [chapterSixReward.id]
});

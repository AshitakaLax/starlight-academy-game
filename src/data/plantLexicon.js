function deepFreeze(value) {
  if (!value || typeof value !== "object") return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

/** A simple flowering-plant cycle for elementary and middle-grade investigations. */
export const plantLifecycleStages = deepFreeze([
  {
    id: "seed",
    label: "Seed",
    description: "A seed contains a tiny plant and stored food for its early growth.",
    clue: "A protected seed is ready to begin growing when conditions are suitable."
  },
  {
    id: "germination",
    label: "Germination",
    description: "With suitable water and warmth, the seed begins to grow; a root emerges first.",
    clue: "The seed coat opens and a tiny root begins to grow."
  },
  {
    id: "seedling",
    label: "Seedling",
    description: "A young plant grows roots, a stem, and its first leaves.",
    clue: "A small green plant appears above the soil and begins growing leaves."
  },
  {
    id: "flowering",
    label: "Mature flowering plant",
    description: "The plant grows larger and produces flowers.",
    clue: "The established plant is mature enough to produce flowers."
  },
  {
    id: "fruit-seeds",
    label: "Fruit with new seeds",
    description: "After pollination and fertilization, fruit develops and contains new seeds.",
    clue: "New seeds form as the flowering plant reproduces, starting another cycle."
  }
]);

const MAX_LIFECYCLE_TRANSITION = Object.freeze({
  foundation: 1,
  core: 2,
  stretch: 3
});

export function getPlantLifecycleStages() {
  return plantLifecycleStages;
}

export function getPlantLifecycleTransitions(tier = "core") {
  const maxIndex = MAX_LIFECYCLE_TRANSITION[tier];
  if (!Number.isInteger(maxIndex)) {
    throw new RangeError("Unknown plant-life-cycle difficulty tier: " + tier);
  }
  return plantLifecycleStages.slice(0, maxIndex + 1).map((stage, index) => ({
    currentStages: plantLifecycleStages.slice(0, index + 1),
    nextStage: plantLifecycleStages[index + 1]
  }));
}

/**
 * Resource situations distinguish the three photosynthesis inputs from
 * mineral nutrients that support growth but are not photosynthesis inputs.
 */
export const plantResourceScenarios = deepFreeze([
  {
    id: "dry-soil",
    resource: "Water",
    tier: "foundation",
    title: "The dry seedling",
    scenario: "The soil around a young tomato plant is dry, and its leaves are beginning to droop.",
    explanation: "Water is absorbed by roots and helps move materials through the plant."
  },
  {
    id: "dark-corner",
    resource: "Sunlight",
    tier: "foundation",
    title: "The dark corner",
    scenario: "The plant has moist soil and fresh air, but it is growing in a dark cupboard.",
    explanation: "Light provides the energy that powers photosynthesis."
  },
  {
    id: "stale-greenhouse-air",
    resource: "Carbon dioxide",
    tier: "core",
    title: "The closed greenhouse",
    scenario: "The plant has water and light, but the greenhouse has little fresh air moving around its leaves.",
    explanation: "Carbon dioxide enters leaves from the air and is used during photosynthesis."
  },
  {
    id: "empty-growing-mix",
    resource: "Mineral nutrients",
    tier: "stretch",
    title: "The tired growing mix",
    scenario: "The plant has water, sunlight, and fresh air, but its growing mix has very few minerals left.",
    explanation: "Mineral nutrients from the growing mix support healthy plant growth; they are not the three inputs in the photosynthesis recipe."
  }
]);

const RESOURCE_TIER_ORDER = Object.freeze({
  foundation: 0,
  core: 1,
  stretch: 2
});

export function getPlantResourceScenarios(tier = "core") {
  const level = RESOURCE_TIER_ORDER[tier];
  if (!Number.isInteger(level)) {
    throw new RangeError("Unknown plant-resource difficulty tier: " + tier);
  }
  return plantResourceScenarios.filter((scenario) =>
    RESOURCE_TIER_ORDER[scenario.tier] <= level
  );
}

export const PHOTOSYNTHESIS_INPUTS_ANSWER = "Sunlight, water, and carbon dioxide";

export const photosynthesisChoiceBank = deepFreeze([
  PHOTOSYNTHESIS_INPUTS_ANSWER,
  "Sunlight, water, and oxygen",
  "Carbon dioxide, oxygen, and mineral nutrients",
  "Water, soil, and oxygen"
]);

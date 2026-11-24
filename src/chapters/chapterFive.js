import { createActivityDefinition } from "../systems/curriculum/activityDefinitions.js";
import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { createRewardDefinition } from "../systems/economy/economyCatalogs.js";

const supportedTiers = ["foundation", "core", "stretch"];
const fourChoices = Object.freeze({
  foundation: { choiceCount: 4 }, core: { choiceCount: 4 }, stretch: { choiceCount: 4 }
});
const twoChoices = Object.freeze({
  foundation: { choiceCount: 2 }, core: { choiceCount: 2 }, stretch: { choiceCount: 2 }
});

function createHabitatActivity({ id, title, skillId, objective, generatorId, generatorConstraints = fourChoices }) {
  return createActivityDefinition({
    id, title, skillIds: [skillId], objectives: [objective], supportedTiers,
    answerRules: { type: "exact", caseSensitive: false }, generatorId, generatorConstraints
  });
}

export const chapterFiveActivityDefinitions = Object.freeze([
  createHabitatActivity({
    id: "chapter-05.biome-clues", title: "The Biome Field Guide",
    skillId: "science.habitats",
    objective: "Match an animal's climate, food, and shelter needs to a suitable habitat.",
    generatorId: "habitats.biome-match"
  }),
  createHabitatActivity({
    id: "chapter-05.adaptation-lab", title: "The Adaptation Lab",
    skillId: "science.adaptations",
    objective: "Distinguish structural adaptations from behavioral adaptations.",
    generatorId: "habitats.adaptation-type", generatorConstraints: twoChoices
  }),
  createHabitatActivity({
    id: "chapter-05.survival-strategies", title: "The Survival Strategy Station",
    skillId: "science.adaptations",
    objective: "Explain how an observable body feature or behavior helps an animal survive.",
    generatorId: "habitats.adaptation-purpose"
  }),
  createHabitatActivity({
    id: "chapter-05.ecosystem-web", title: "The Ecosystem Web",
    skillId: "science.habitats",
    objective: "Describe how organisms and their actions can affect other parts of an ecosystem.",
    generatorId: "habitats.ecosystem-connection"
  })
]);

const habitatDemonstration = {
  title: "Match an animal to its habitat",
  introduction: "A habitat provides conditions and resources an organism needs.",
  steps: [
    { label: "Read the climate clue", explanation: "Notice whether the place is cold, hot and dry, warm and humid, or high and rocky.", visual: { kind: "diagram", content: "Climate · land · water", ariaLabel: "Look for climate, land, and water clues" } },
    { label: "Check food and shelter", explanation: "Think about food, safe places to rest, and the kind of ground or water the animal uses.", visual: { kind: "diagram", content: "Food + shelter + conditions", ariaLabel: "A habitat provides food, shelter, and suitable conditions" } },
    { label: "Choose the best match", explanation: "Use all the clues to select the environment that best meets the animal's needs.", visual: { kind: "equation", content: "Animal needs → suitable habitat", ariaLabel: "Match an animal's needs to a suitable habitat" } }
  ],
  summary: "A suitable habitat provides the food, shelter, and environmental conditions an organism needs."
};
const adaptationTypeDemonstration = {
  title: "Body feature or action?",
  introduction: "Adaptations can be physical structures or behaviors an animal performs.",
  steps: [
    { label: "Look for a body feature", explanation: "A body part such as webbed feet or thick fur is structural.", visual: { kind: "diagram", content: "Webbed feet → structural", ariaLabel: "Webbed feet are a structural adaptation" } },
    { label: "Look for an action", explanation: "An action such as building a dam or giving a warning call is behavioral.", visual: { kind: "diagram", content: "Building a dam → behavioral", ariaLabel: "Building a dam is a behavioral adaptation" } },
    { label: "Name the adaptation", explanation: "Ask whether the clue describes what the animal has or what it does.", visual: { kind: "equation", content: "Body feature = structural · Action = behavioral", ariaLabel: "A body feature is structural and an action is behavioral" } }
  ],
  summary: "Structural describes a body feature; behavioral describes an action."
};
const survivalDemonstration = {
  title: "Connect a feature to its purpose",
  introduction: "An adaptation helps an animal meet a need in its environment.",
  steps: [
    { label: "Name the feature", explanation: "A mountain goat has split hooves with flexible inner pads.", visual: { kind: "diagram", content: "Split hooves + soft pads", ariaLabel: "Mountain goat hooves have split toes and flexible inner pads" } },
    { label: "Think about the challenge", explanation: "Mountain goats move across steep, rocky ledges where slipping is a danger.", visual: { kind: "diagram", content: "Steep, rocky ledges", ariaLabel: "Steep rocky ledges are a challenging mountain environment" } },
    { label: "Explain the advantage", explanation: "The hoof shape and pads provide grip and stability on rocks.", visual: { kind: "equation", content: "Hoof structure → grip on rock", ariaLabel: "Mountain goat hooves help grip rocky surfaces" } }
  ],
  summary: "Connect a feature or action to a specific survival need."
};
const ecosystemDemonstration = {
  title: "Follow an ecosystem connection",
  introduction: "An ecosystem includes living things and how they interact with their surroundings.",
  steps: [
    { label: "Notice an organism's action", explanation: "A beaver gathers branches and builds a dam across a stream.", visual: { kind: "diagram", content: "Beaver → dam", ariaLabel: "A beaver builds a dam" } },
    { label: "Trace the environmental change", explanation: "The dam slows the water and can form a pond.", visual: { kind: "diagram", content: "Dam → slower water → pond", ariaLabel: "A beaver dam can slow water and form a pond" } },
    { label: "Look for other living things", explanation: "Ponds and wetlands can provide habitat for other wildlife.", visual: { kind: "equation", content: "Action → habitat change → wildlife", ariaLabel: "An animal action can change habitat for other wildlife" } }
  ],
  summary: "Ecosystem connections show how organisms can affect their environment and other living things."
};

export const chapterFiveHintDefinitions = Object.freeze([
  {
    activityId: "chapter-05.biome-clues", title: "Professor Hoot's habitat clues", skillIds: ["science.habitats"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Look at the climate first: cold, dry heat, humid forest, freshwater, or high mountains?" },
      { attempt: 2, kind: "strategy", message: "Check food and shelter too. Choose the place that provides the best combination of conditions and resources." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot matches climate, food, and shelter clues to a habitat.", demonstration: habitatDemonstration }
    ]
  },
  {
    activityId: "chapter-05.adaptation-lab", title: "Professor Hoot's adaptation clues", skillIds: ["science.adaptations"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Does the clue describe a body part or something the animal does?" },
      { attempt: 2, kind: "strategy", message: "A physical body feature is structural. An action an animal performs is behavioral." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot compares a body feature with an animal action.", demonstration: adaptationTypeDemonstration }
    ]
  },
  {
    activityId: "chapter-05.survival-strategies", title: "Professor Hoot's survival clues", skillIds: ["science.adaptations"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Identify the feature or action, then ask what challenge it helps the animal handle." },
      { attempt: 2, kind: "strategy", message: "Connect the adaptation to a need such as warmth, grip, swimming, climbing, food, or warning others." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot connects a mountain goat's hoof structure to rocky terrain.", demonstration: survivalDemonstration }
    ]
  },
  {
    activityId: "chapter-05.ecosystem-web", title: "Professor Hoot's ecosystem clues", skillIds: ["science.habitats"],
    stages: [
      { attempt: 1, kind: "nudge", message: "Follow what the organism does. Does its action change water, shelter, food, or safety?" },
      { attempt: 2, kind: "strategy", message: "Trace the connection one step at a time: action, environmental change, then effect on other living things." },
      { attempt: 3, kind: "demonstration", message: "Professor Hoot traces how a beaver dam can create wetland habitat.", demonstration: ecosystemDemonstration }
    ]
  }
]);

export const chapterFiveReward = createRewardDefinition({
  id: "reward.chapter-05-wildlife-compass", sourceId: "chapter-05",
  title: "Wildlife Compass", starGems: 80, starlightSparkles: 6,
  replayPolicy: { type: "once" }
});

export const chapterFiveDefinition = createChapterDefinition({
  id: "chapter-05",
  title: "Artemis and the Magical Habitats",
  description: "Join Artemis in the wildlife sanctuary to match creatures to biomes, investigate adaptations, and discover how organisms connect in an ecosystem.",
  objectives: [
    "Match animals to habitats that meet their climate, food, and shelter needs.",
    "Distinguish structural adaptations from behavioral adaptations.",
    "Explain how animal features and behaviors support survival and affect ecosystems."
  ],
  prerequisiteChapterIds: ["chapter-04"],
  activities: [
    {
      id: "chapter-05.sanctuary-gate", title: "The Wildlife Sanctuary Map", type: "story",
      description: "Artemis needs help restoring the sanctuary's wildlife field guide.",
      metadata: { paragraphs: [
        "A soft golden light travels across the Wildlife Sanctuary. Artemis opens a field guide filled with animal tracks, leaves, feathers, pawprints, and notes about distant places.",
        "“The habitat labels have slipped away from the creature clues,” Artemis explains. “We need to match each animal to the environment that provides what it needs, then understand the features and behaviors that help it survive.”",
        "Professor Hoot turns to a page marked Ecosystem Connections. “A habitat is more than a backdrop. Living things interact with one another and with the places they share. Let's investigate carefully and rebuild the field guide.”"
      ] }
    },
    {
      id: "chapter-05.biome-field-guide", title: "The Biome Field Guide", type: "learning",
      description: "Read the climate, food, and shelter clues, then select the habitat that best meets the creature's needs.",
      activityId: "chapter-05.biome-clues", skillIds: ["science.habitats"],
      metadata: { questionCount: 2, lessonLabel: "Habitats and biome needs", successText: "The field guide has a suitable habitat for each creature!" }
    },
    {
      id: "chapter-05.adaptation-lab-scene", title: "The Adaptation Lab", type: "learning",
      description: "Decide whether each clue describes a body feature or an action the animal performs.",
      activityId: "chapter-05.adaptation-lab", skillIds: ["science.adaptations"],
      metadata: { questionCount: 2, lessonLabel: "Structural and behavioral adaptations", successText: "The adaptation notes are sorted into the right groups!" }
    },
    {
      id: "chapter-05.survival-station", title: "The Survival Strategy Station", type: "challenge",
      description: "Connect a creature's feature or behavior to the survival advantage it provides.",
      activityId: "chapter-05.survival-strategies", skillIds: ["science.adaptations"],
      metadata: { questionCount: 3, challengeLabel: "Survival strategy clues", successText: "Each adaptation is connected to a useful survival strategy!" }
    },
    {
      id: "chapter-05.ecosystem-web", title: "The Ecosystem Web", type: "challenge",
      description: "Follow an animal's actions and discover how they can change a habitat or connect living things.",
      activityId: "chapter-05.ecosystem-web", skillIds: ["science.habitats"],
      metadata: { questionCount: 3, challengeLabel: "Ecosystem connections", successText: "The field guide now shows how living things are connected!" }
    },
    {
      id: "chapter-05.sanctuary-restored", title: "A Living Sanctuary", type: "story",
      description: "The wildlife field guide is restored and the sanctuary map shines again.",
      metadata: { paragraphs: [
        "The final field note settles into place. The sanctuary map glows with six distinct environments, each described through the needs of the creatures that live there.",
        "Artemis smiles. “You matched habitats, explained adaptations, and followed the connections that make ecosystems work. Every creature depends on a place that can support its needs.”",
        "Professor Hoot presents a Wildlife Compass. Beyond the sanctuary, the greenhouse windows begin to glow."
      ] }
    }
  ],
  majorRewardIds: [chapterFiveReward.id]
});

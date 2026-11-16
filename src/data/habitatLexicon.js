function deepFreeze(value) {
  if (!value || typeof value !== "object") return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const habitatCreatureLexicon = deepFreeze([
  {
    id: "arctic-fox", animal: "Arctic fox", symbol: "🦊",
    habitatId: "arctic-tundra", habitatLabel: "Arctic tundra",
    climateClue: "A very cold, treeless landscape with frozen ground and seasonal snow.",
    needsClue: "It needs protection from cold and hunts small mammals such as lemmings.",
    adaptations: [
      { id: "arctic-fox-thick-fur", type: "structural", feature: "A dense coat of thick fur",
        description: "Its insulating coat helps it keep body heat in during the cold season.",
        purpose: "Insulates the fox and helps it stay warm in very cold weather." },
      { id: "arctic-fox-tail-wrap", type: "behavioral", feature: "Wraps its fluffy tail around its body while resting",
        description: "The fox curls its tail around itself like a blanket when it sleeps.",
        purpose: "Uses its fluffy tail as an extra layer of warmth while resting." }
    ]
  },
  {
    id: "dromedary-camel", animal: "Dromedary camel", symbol: "🐪",
    habitatId: "hot-desert", habitatLabel: "Hot desert",
    climateClue: "A hot, dry landscape with very little rain, sandy ground, and scattered plants.",
    needsClue: "It travels over shifting sand and finds food where plants are spread far apart.",
    adaptations: [
      { id: "camel-eyelashes", type: "structural", feature: "Two rows of long eyelashes",
        description: "The long lashes help shield the camel's eyes from blowing sand.",
        purpose: "Helps keep blowing sand out of the camel's eyes." },
      { id: "camel-footpads", type: "structural", feature: "Large, thick footpads",
        description: "The broad pads help the camel move over rough ground and shifting sand.",
        purpose: "Spreads its weight and helps it walk across rough, shifting desert ground." },
      { id: "camel-nostrils", type: "structural", feature: "Nostrils that can close",
        description: "The camel can close its nostrils when sand is blowing.",
        purpose: "Helps keep blowing sand from entering the camel's nose." }
    ]
  },
  {
    id: "red-eyed-tree-frog", animal: "Red-eyed tree frog", symbol: "🐸",
    habitatId: "tropical-rainforest", habitatLabel: "Tropical rainforest",
    climateClue: "A warm, humid forest with tall trees, broad leaves, and nearby fresh water.",
    needsClue: "It spends time in the canopy and hunts insects; its skin also needs moisture.",
    adaptations: [
      { id: "tree-frog-toe-pads", type: "structural", feature: "Cup-like toe pads",
        description: "The pads help the frog cling to leaves, branches, and tree trunks.",
        purpose: "Helps the frog grip leaves and climb through the rainforest canopy." },
      { id: "tree-frog-night-hunting", type: "behavioral", feature: "Hunts insects at night",
        description: "The frog rests on leaves during the day and becomes active after dark.",
        purpose: "Lets the frog search for insect food during its active nighttime hours." }
    ]
  },
  {
    id: "north-american-beaver", animal: "North American beaver", symbol: "🦫",
    habitatId: "freshwater-wetland", habitatLabel: "Freshwater wetland",
    climateClue: "A freshwater stream or pond bordered by trees, shrubs, and plants.",
    needsClue: "It needs water for swimming and nearby woody plants for food and building material.",
    adaptations: [
      { id: "beaver-webbed-feet", type: "structural", feature: "Large webbed hind feet",
        description: "The webbing helps push water as the beaver swims.",
        purpose: "Provides a larger surface to push against water while swimming." },
      { id: "beaver-dam-building", type: "behavioral", feature: "Builds dams across streams",
        description: "The beaver gathers branches and other material to slow the flow of a stream.",
        purpose: "Slows stream water and can create a pond that becomes wetland habitat." }
    ]
  },
  {
    id: "mountain-goat", animal: "Mountain goat", symbol: "🐐",
    habitatId: "alpine-mountains", habitatLabel: "Alpine mountains",
    climateClue: "High, cool mountain slopes with steep rocky ledges and alpine plants.",
    needsClue: "It needs sure footing on cliffs and access to grasses, flowers, and mountain plants.",
    adaptations: [
      { id: "mountain-goat-hooves", type: "structural", feature: "Split hooves with flexible inner pads",
        description: "The two toes spread apart, while the soft pads help grip rocky ledges.",
        purpose: "Provides traction and stability on steep, rocky mountain surfaces." },
      { id: "mountain-goat-climbing", type: "behavioral", feature: "Climbs steep ledges to reach mountain plants",
        description: "The goat moves across rugged slopes to find food and places of safety.",
        purpose: "Helps it reach exposed plants and move through rugged mountain terrain." }
    ]
  },
  {
    id: "black-tailed-prairie-dog", animal: "Black-tailed prairie dog", symbol: "🐿️",
    habitatId: "temperate-grassland", habitatLabel: "Temperate grassland",
    climateClue: "An open region covered mostly by grasses, with deep soil suitable for burrows.",
    needsClue: "It needs open ground, grasses to eat, and underground places where its colony can shelter.",
    adaptations: [
      { id: "prairie-dog-claws", type: "structural", feature: "Strong front claws",
        description: "The claws help the prairie dog dig tunnels and underground chambers.",
        purpose: "Helps the prairie dog dig burrows for shelter underground." },
      { id: "prairie-dog-alarm-call", type: "behavioral", feature: "Gives an alarm call when danger approaches",
        description: "A warning call alerts other members of the colony.",
        purpose: "Warns nearby prairie dogs so they can move toward shelter." }
    ]
  }
]);

export const habitatEcosystemConnections = deepFreeze([
  { id: "beaver-wetlands", organism: "North American beaver", symbol: "🦫",
    action: "Builds dams that slow the flow of streams.",
    context: "A wooded stream in a freshwater habitat.",
    effect: "Can form ponds and wetlands that provide habitat for other wildlife." },
  { id: "prairie-dog-burrows", organism: "Black-tailed prairie dog", symbol: "🐿️",
    action: "Creates underground burrow systems in grasslands.",
    context: "An open prairie with a colony of burrowing animals.",
    effect: "Burrows can provide shelter and nesting places for other grassland animals." },
  { id: "arctic-fox-food-web", organism: "Arctic fox", symbol: "🦊",
    action: "Hunts small mammals such as lemmings.",
    context: "A cold Arctic food web.",
    effect: "Connects small-mammal prey to predators as part of the Arctic food web." },
  { id: "tree-frog-food-web", organism: "Red-eyed tree frog", symbol: "🐸",
    action: "Feeds on insects in the rainforest canopy.",
    context: "A humid rainforest with insects and other animals.",
    effect: "Moves energy from insect prey to animals that may eat the frog." }
]);

const FOUNDATION_CREATURE_IDS = new Set([
  "arctic-fox", "dromedary-camel", "red-eyed-tree-frog", "north-american-beaver"
]);

export function getHabitatCreatures(tier = "core") {
  if (!["foundation", "core", "stretch"].includes(tier)) {
    throw new RangeError("Unknown habitat difficulty tier: " + tier);
  }
  return habitatCreatureLexicon.filter((entry) =>
    tier !== "foundation" || FOUNDATION_CREATURE_IDS.has(entry.id)
  );
}

export function getHabitatAdaptations(tier = "core") {
  return getHabitatCreatures(tier).flatMap((creature) =>
    creature.adaptations.map((adaptation) => ({
      ...adaptation, animal: creature.animal, symbol: creature.symbol
    }))
  );
}

export function getHabitatEcosystemConnections(tier = "core") {
  if (!["foundation", "core", "stretch"].includes(tier)) {
    throw new RangeError("Unknown habitat difficulty tier: " + tier);
  }
  return habitatEcosystemConnections;
}

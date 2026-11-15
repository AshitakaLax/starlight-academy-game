/** Stable difficulty bands. Core is the recommended initial practice tier. */
export const DIFFICULTY_TIER_IDS = Object.freeze(["foundation", "core", "stretch"]);

export const difficultyTierDefinitions = Object.freeze([
  Object.freeze({
    id: "foundation",
    label: "Foundation",
    order: 1,
    description: "Supported practice that builds confidence with smaller steps."
  }),
  Object.freeze({
    id: "core",
    label: "Core",
    order: 2,
    description: "The academy's recommended starting level for everyday practice."
  }),
  Object.freeze({
    id: "stretch",
    label: "Stretch",
    order: 3,
    description: "An extra challenge for skills ready to go a little further."
  })
]);

export const difficultyTierRegistry = Object.freeze(
  Object.fromEntries(difficultyTierDefinitions.map((tier) => [tier.id, tier]))
);

export function getDifficultyTier(id) {
  return typeof id === "string" ? difficultyTierRegistry[id] ?? null : null;
}

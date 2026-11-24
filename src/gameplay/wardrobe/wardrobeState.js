import { WARDROBE_SLOTS } from "./wardrobeCatalog.js";

export function createInitialWardrobeState(wardrobeCatalog) {
  if (!wardrobeCatalog || typeof wardrobeCatalog.list !== "function") {
    throw new TypeError("createInitialWardrobeState requires a wardrobe catalog.");
  }
  const inventory = {};
  const equipped = Object.fromEntries(WARDROBE_SLOTS.map((slot) => [slot, null]));
  for (const item of wardrobeCatalog.list()) {
    if (item.acquisition.type !== "starter") continue;
    inventory[item.id] = {
      sourceType: "starter",
      sourceId: item.acquisition.sourceId ?? "academy"
    };
    if (equipped[item.slot] === null) equipped[item.slot] = item.id;
  }
  return { inventory, equipped };
}

export function selectWardrobe(state) {
  const wardrobe = state?.wardrobe;
  return Object.freeze({
    inventory: wardrobe?.inventory && typeof wardrobe.inventory === "object"
      ? wardrobe.inventory
      : Object.freeze({}),
    equipped: wardrobe?.equipped && typeof wardrobe.equipped === "object"
      ? wardrobe.equipped
      : Object.freeze(Object.fromEntries(WARDROBE_SLOTS.map((slot) => [slot, null])))
  });
}

export function selectEquippedItem(state, slot) {
  return selectWardrobe(state).equipped[slot] ?? null;
}

export function selectWardrobeOwnership(state, itemId) {
  return selectWardrobe(state).inventory[itemId] ?? null;
}

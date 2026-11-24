import { isPlainObject } from "../../core/state/stateUtils.js";
import { WARDROBE_SLOTS } from "./wardrobeCatalog.js";
import { createInitialWardrobeState } from "./wardrobeState.js";

function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.includes(key));
}

export function createWardrobeActionDefinitions({ wardrobeCatalog, economyActionDefinitions } = {}) {
  if (!wardrobeCatalog || typeof wardrobeCatalog.get !== "function" || typeof wardrobeCatalog.has !== "function") {
    throw new TypeError("createWardrobeActionDefinitions requires a wardrobe catalog.");
  }
  const purchaseAction = economyActionDefinitions?.["economy/item-purchased"];
  if (!purchaseAction || typeof purchaseAction.validate !== "function" || typeof purchaseAction.reduce !== "function") {
    throw new TypeError("createWardrobeActionDefinitions requires the catalog-backed economy purchase action.");
  }

  return Object.freeze({
    "wardrobe/item-unlocked": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 2
            || !hasOnlyKeys(payload, ["itemId", "sourceId"])
            || typeof payload.itemId !== "string" || typeof payload.sourceId !== "string") {
          return "wardrobe/item-unlocked expects { itemId, sourceId }.";
        }
        const item = wardrobeCatalog.get(payload.itemId);
        if (!item || !["chapter", "quest"].includes(item.acquisition.type)
            || item.acquisition.sourceId !== payload.sourceId) {
          return "The item is not unlocked by the supplied chapter or quest source.";
        }
        return true;
      },
      reduce(state, payload) {
        const item = wardrobeCatalog.get(payload.itemId);
        const current = isPlainObject(state.wardrobe)
          ? state.wardrobe
          : createInitialWardrobeState(wardrobeCatalog);
        const inventory = isPlainObject(current.inventory) ? current.inventory : {};
        if (Object.hasOwn(inventory, item.id)) return state;
        return {
          ...state,
          wardrobe: {
            ...current,
            inventory: {
              ...inventory,
              [item.id]: { sourceType: item.acquisition.type, sourceId: item.acquisition.sourceId }
            },
            equipped: isPlainObject(current.equipped) ? current.equipped : createInitialWardrobeState(wardrobeCatalog).equipped
          }
        };
      }
    }),

    "wardrobe/item-purchased": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 1
            || !hasOnlyKeys(payload, ["itemId"]) || typeof payload.itemId !== "string") {
          return "wardrobe/item-purchased expects { itemId }.";
        }
        const item = wardrobeCatalog.get(payload.itemId);
        if (!item || item.acquisition.type !== "purchase") {
          return "Only catalog cosmetics with a Star Gem purchase price can be purchased.";
        }
        return purchaseAction.validate({ itemId: payload.itemId });
      },
      reduce(state, payload) {
        const item = wardrobeCatalog.get(payload.itemId);
        const current = isPlainObject(state.wardrobe)
          ? state.wardrobe
          : createInitialWardrobeState(wardrobeCatalog);
        const inventory = isPlainObject(current.inventory) ? current.inventory : {};
        if (Object.hasOwn(inventory, item.id)) return state;

        // Reuse the STEP-13 catalog-priced reducer and extend the same transition
        // with wardrobe ownership, so neither half can succeed independently.
        const purchasedState = purchaseAction.reduce(state, { itemId: item.id });
        if (purchasedState === state) return state;
        const purchasedWardrobe = isPlainObject(purchasedState.wardrobe)
          ? purchasedState.wardrobe
          : current;
        return {
          ...purchasedState,
          wardrobe: {
            ...purchasedWardrobe,
            inventory: {
              ...(isPlainObject(purchasedWardrobe.inventory) ? purchasedWardrobe.inventory : inventory),
              [item.id]: { sourceType: "purchase", sourceId: "shop" }
            },
            equipped: isPlainObject(purchasedWardrobe.equipped)
              ? purchasedWardrobe.equipped
              : createInitialWardrobeState(wardrobeCatalog).equipped
          }
        };
      }
    }),

    "wardrobe/equipment-changed": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 2
            || !hasOnlyKeys(payload, ["slot", "itemId"])
            || !WARDROBE_SLOTS.includes(payload.slot)
            || !(payload.itemId === null || typeof payload.itemId === "string")) {
          return "wardrobe/equipment-changed expects { slot, itemId }, where itemId may be null to clear the slot.";
        }
        if (payload.itemId !== null) {
          const item = wardrobeCatalog.get(payload.itemId);
          if (!item || item.slot !== payload.slot) return "The selected item does not belong to the requested equipment slot.";
        }
        return true;
      },
      reduce(state, payload) {
        const current = isPlainObject(state.wardrobe)
          ? state.wardrobe
          : createInitialWardrobeState(wardrobeCatalog);
        const inventory = isPlainObject(current.inventory) ? current.inventory : {};
        if (payload.itemId !== null && !Object.hasOwn(inventory, payload.itemId)) return state;
        const equipped = {
          ...createInitialWardrobeState(wardrobeCatalog).equipped,
          ...(isPlainObject(current.equipped) ? current.equipped : {})
        };
        if (equipped[payload.slot] === payload.itemId) return state;
        return {
          ...state,
          wardrobe: {
            ...current,
            inventory,
            equipped: { ...equipped, [payload.slot]: payload.itemId }
          }
        };
      }
    })
  });
}

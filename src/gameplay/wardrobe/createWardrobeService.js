import { selectEconomy } from "../../systems/economy/economyState.js";
import { WARDROBE_SLOTS } from "./wardrobeCatalog.js";
import { selectWardrobe } from "./wardrobeState.js";

/** Runtime wardrobe facade; actions are validated by the central state store. */
export function createWardrobeService({ store, wardrobeCatalog } = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.dispatch !== "function") {
    throw new TypeError("createWardrobeService requires a compatible game store.");
  }
  if (!wardrobeCatalog || typeof wardrobeCatalog.get !== "function" || typeof wardrobeCatalog.list !== "function") {
    throw new TypeError("createWardrobeService requires a wardrobe catalog.");
  }

  function getInventory() {
    const state = store.getState();
    const wardrobe = selectWardrobe(state);
    const economy = selectEconomy(state);
    return Object.freeze(wardrobeCatalog.list().map((item) => {
      const ownership = wardrobe.inventory[item.id] ?? null;
      const equipped = wardrobe.equipped[item.slot] === item.id;
      const acquisition = item.acquisition;
      let status = ownership ? (equipped ? "equipped" : "owned") : "locked";
      let available = false;
      let reason = "not-yet-unlocked";
      if (!ownership && acquisition.type === "purchase") {
        available = economy.starGems >= acquisition.priceStarGems;
        reason = available ? "purchase-available" : "insufficient-star-gems";
      } else if (!ownership && acquisition.type === "chapter") {
        reason = "complete-" + acquisition.sourceId;
      } else if (!ownership && acquisition.type === "quest") {
        reason = "complete-" + acquisition.sourceId;
      }
      return Object.freeze({
        ...item,
        ownership,
        owned: ownership !== null,
        equipped,
        status,
        available,
        reason
      });
    }));
  }

  function getEquipped() {
    const wardrobe = selectWardrobe(store.getState());
    return Object.freeze(WARDROBE_SLOTS.map((slot) => {
      const itemId = wardrobe.equipped[slot] ?? null;
      return Object.freeze({
        slot,
        itemId,
        item: itemId ? wardrobeCatalog.get(itemId) : null
      });
    }));
  }

  function unlockItem(itemId, sourceId) {
    if (typeof itemId !== "string" || !itemId.trim()) throw new TypeError("unlockItem requires an item ID.");
    if (typeof sourceId !== "string" || !sourceId.trim()) throw new TypeError("unlockItem requires a source ID.");
    const receipt = store.dispatch({
      type: "wardrobe/item-unlocked",
      payload: { itemId, sourceId }
    });
    const ownership = selectWardrobe(store.getState()).inventory[itemId] ?? null;
    return Object.freeze({
      unlocked: receipt.changed === true && ownership !== null,
      reason: ownership ? "item-owned" : "item-not-unlocked",
      itemId,
      ownership
    });
  }

  /** Chapter/quest completion code calls this with its own authoritative source ID. */
  function unlockSource(sourceId) {
    if (typeof sourceId !== "string" || !sourceId.trim()) throw new TypeError("unlockSource requires a source ID.");
    const matching = wardrobeCatalog.list().filter((item) =>
      ["chapter", "quest"].includes(item.acquisition.type) && item.acquisition.sourceId === sourceId
    );
    const results = matching.map((item) => unlockItem(item.id, sourceId));
    return Object.freeze({
      sourceId,
      unlockedItemIds: Object.freeze(results.filter((result) => result.unlocked).map((result) => result.itemId)),
      alreadyOwnedItemIds: Object.freeze(results.filter((result) => !result.unlocked && result.ownership).map((result) => result.itemId)),
      count: results.filter((result) => result.unlocked).length
    });
  }

  function purchaseItem(itemId) {
    if (typeof itemId !== "string" || !itemId.trim()) throw new TypeError("purchaseItem requires an item ID.");
    const item = wardrobeCatalog.get(itemId);
    if (!item) throw new RangeError("Unknown wardrobe item ID: " + itemId);
    if (item.acquisition.type !== "purchase") {
      return Object.freeze({ purchased: false, reason: "not-a-shop-item", itemId });
    }
    const before = store.getState();
    const inventoryBefore = selectWardrobe(before).inventory;
    if (Object.hasOwn(inventoryBefore, itemId)) {
      return Object.freeze({ purchased: false, reason: "already-owned", itemId });
    }
    const gemsBefore = selectEconomy(before).starGems;
    if (gemsBefore < item.acquisition.priceStarGems) {
      return Object.freeze({
        purchased: false,
        reason: "insufficient-star-gems",
        itemId,
        priceStarGems: item.acquisition.priceStarGems,
        starGems: gemsBefore
      });
    }
    const receipt = store.dispatch({ type: "wardrobe/item-purchased", payload: { itemId } });
    const after = store.getState();
    const ownership = selectWardrobe(after).inventory[itemId] ?? null;
    const purchased = receipt.changed === true && ownership?.sourceType === "purchase";
    return Object.freeze({
      purchased,
      reason: purchased ? "purchase-complete" : "purchase-not-applied",
      itemId,
      ownership,
      priceStarGems: item.acquisition.priceStarGems,
      starGems: selectEconomy(after).starGems
    });
  }

  function equipItem(itemId) {
    if (typeof itemId !== "string" || !itemId.trim()) throw new TypeError("equipItem requires an item ID.");
    const item = wardrobeCatalog.get(itemId);
    if (!item) throw new RangeError("Unknown wardrobe item ID: " + itemId);
    const ownership = selectWardrobe(store.getState()).inventory[itemId];
    if (!ownership) return Object.freeze({ equipped: false, reason: "item-locked", itemId });
    const receipt = store.dispatch({
      type: "wardrobe/equipment-changed",
      payload: { slot: item.slot, itemId }
    });
    return Object.freeze({
      equipped: receipt.changed === true || selectWardrobe(store.getState()).equipped[item.slot] === itemId,
      reason: "equipment-updated",
      itemId,
      slot: item.slot
    });
  }

  function unequipSlot(slot) {
    if (!WARDROBE_SLOTS.includes(slot)) throw new TypeError("Unknown wardrobe equipment slot: " + slot);
    const receipt = store.dispatch({
      type: "wardrobe/equipment-changed",
      payload: { slot, itemId: null }
    });
    return Object.freeze({ changed: receipt.changed === true, slot, itemId: null });
  }

  function getPreview() {
    return Object.freeze({
      equipped: getEquipped(),
      inventory: getInventory()
    });
  }

  return Object.freeze({
    getInventory,
    getEquipped,
    getPreview,
    unlockItem,
    unlockSource,
    purchaseItem,
    equipItem,
    unequipSlot
  });
}

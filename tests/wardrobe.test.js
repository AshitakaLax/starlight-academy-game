import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import { createRewardRegistry, createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createInitialEconomyState } from "../src/systems/economy/economyState.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import {
  createWardrobeCatalog,
  createWardrobeShopCatalog,
  createWardrobeItem,
  defaultWardrobeItems,
  WARDROBE_SLOTS
} from "../src/gameplay/wardrobe/wardrobeCatalog.js";
import {
  createInitialWardrobeState,
  selectWardrobe,
  selectEquippedItem,
  selectWardrobeOwnership
} from "../src/gameplay/wardrobe/wardrobeState.js";
import { createWardrobeActionDefinitions } from "../src/gameplay/wardrobe/wardrobeActions.js";
import { createWardrobeService } from "../src/gameplay/wardrobe/createWardrobeService.js";

function createHarness({ starGems = 0 } = {}) {
  const wardrobeCatalog = createWardrobeCatalog(defaultWardrobeItems);
  const shopCatalog = createShopCatalog(createWardrobeShopCatalog(wardrobeCatalog));
  const rewardRegistry = createRewardRegistry();
  const economyActionDefinitions = createEconomyActionDefinitions({ rewardRegistry, shopCatalog });
  const wardrobeActionDefinitions = createWardrobeActionDefinitions({ wardrobeCatalog, economyActionDefinitions });
  const economy = { ...createInitialEconomyState(), starGems };
  const wardrobe = createInitialWardrobeState(wardrobeCatalog);
  const store = createGameStore({
    initialState: { ...createInitialGameState(), economy, wardrobe },
    actions: { ...economyActionDefinitions, ...wardrobeActionDefinitions }
  });
  const service = createWardrobeService({ store, wardrobeCatalog });
  return { store, wardrobeCatalog, shopCatalog, service };
}

test("wardrobe catalog defines stable item IDs, four equipment slots, and immutable cosmetics", () => {
  const catalog = createWardrobeCatalog(defaultWardrobeItems);
  assert.deepEqual(WARDROBE_SLOTS, ["head", "outfit", "footwear", "accessory"]);
  assert.equal(catalog.list().length, 9);
  assert.equal(catalog.get("wardrobe.starlight-tiara").slot, "head");
  assert.equal(catalog.listBySlot("outfit").length, 3);
  assert.ok(Object.isFrozen(catalog.get("wardrobe.starlight-tiara")));
  assert.ok(Object.isFrozen(catalog.get("wardrobe.starlight-tiara").acquisition));
  assert.throws(() => catalog.register(defaultWardrobeItems[0]), /already registered/);
});

test("wardrobe item definitions reject invalid slots, IDs, symbols, themes, and acquisition rules", () => {
  assert.throws(() => createWardrobeItem({ ...defaultWardrobeItems[0], slot: "hands" }), /slot/);
  assert.throws(() => createWardrobeItem({ ...defaultWardrobeItems[0], id: "not-namespaced" }), /namespaced/);
  assert.throws(() => createWardrobeItem({ ...defaultWardrobeItems[0], symbol: "ABCDE" }), /1 to 4/);
  assert.throws(() => createWardrobeItem({ ...defaultWardrobeItems[0], theme: "Lavender Glow" }), /lowercase token/);
  assert.throws(() => createWardrobeItem({ ...defaultWardrobeItems[0], acquisition: { type: "purchase", priceStarGems: 0 } }), /positive safe-integer/);
  assert.throws(() => createWardrobeItem({ ...defaultWardrobeItems[0], acquisition: { type: "chapter", sourceId: "Chapter 02" } }), /source ID/);
});

test("new wardrobe state grants and equips one starter item in every equipment slot", () => {
  const harness = createHarness();
  const wardrobe = selectWardrobe(harness.store.getState());
  assert.deepEqual(Object.keys(wardrobe.equipped).sort(), [...WARDROBE_SLOTS].sort());
  for (const slot of WARDROBE_SLOTS) {
    const itemId = wardrobe.equipped[slot];
    assert.ok(itemId);
    assert.equal(harness.wardrobeCatalog.get(itemId).slot, slot);
    assert.equal(wardrobe.inventory[itemId].sourceType, "starter");
  }
  assert.equal(Object.keys(wardrobe.inventory).length, 4);
});

test("starter items are immediately available to equip without spending currency", () => {
  const harness = createHarness();
  const inventory = harness.service.getInventory();
  const tiara = inventory.find((item) => item.id === "wardrobe.starlight-tiara");
  assert.equal(tiara.owned, true);
  assert.equal(tiara.equipped, true);
  assert.equal(tiara.status, "equipped");
  assert.equal(harness.service.equipItem("wardrobe.starlight-tiara").equipped, true);
  assert.equal(harness.store.getState().economy.starGems, 0);
  assert.equal(harness.store.getState().economy.transactions.length, 0);
});

test("chapter-exclusive cosmetics unlock only from their exact registered source", () => {
  const harness = createHarness();
  const itemId = "wardrobe.comet-dance-dress";
  assert.equal(harness.service.equipItem(itemId).reason, "item-locked");
  assert.throws(() => harness.store.dispatch({
    type: "wardrobe/item-unlocked",
    payload: { itemId, sourceId: "chapter-02" }
  }), /not unlocked by the supplied/);
  assert.throws(() => harness.store.dispatch({
    type: "wardrobe/item-unlocked",
    payload: { itemId, sourceId: "chapter-01", starGems: 100 }
  }), /expects/);

  const result = harness.service.unlockSource("chapter-01");
  assert.deepEqual(result.unlockedItemIds, [itemId]);
  assert.equal(selectWardrobeOwnership(harness.store.getState(), itemId).sourceType, "chapter");
  assert.equal(harness.service.equipItem(itemId).equipped, true);
  assert.equal(selectEquippedItem(harness.store.getState(), "outfit"), itemId);
  assert.equal(harness.store.getState().economy.starGems, 0);
});

test("chapter and quest unlocks are idempotent and cannot be purchased from the shop", () => {
  const harness = createHarness({ starGems: 500 });
  const first = harness.service.unlockSource("chapter-01");
  const afterUnlock = harness.store.getState();
  const repeated = harness.service.unlockSource("chapter-01");
  assert.deepEqual(first.unlockedItemIds, ["wardrobe.comet-dance-dress"]);
  assert.deepEqual(repeated.unlockedItemIds, []);
  assert.deepEqual(repeated.alreadyOwnedItemIds, ["wardrobe.comet-dance-dress"]);
  assert.equal(harness.store.getState(), afterUnlock);
  const notShop = harness.service.purchaseItem("wardrobe.comet-dance-dress");
  assert.deepEqual(notShop, {
    purchased: false,
    reason: "not-a-shop-item",
    itemId: "wardrobe.comet-dance-dress"
  });
});

test("purchasing a cosmetic atomically debits Star Gems and records wardrobe ownership", () => {
  const harness = createHarness({ starGems: 50 });
  const itemId = "wardrobe.moonbeam-bow";
  const result = harness.service.purchaseItem(itemId);
  assert.equal(result.purchased, true);
  assert.equal(result.reason, "purchase-complete");
  assert.equal(result.priceStarGems, 20);
  assert.equal(result.starGems, 30);
  assert.deepEqual(selectWardrobeOwnership(harness.store.getState(), itemId), {
    sourceType: "purchase",
    sourceId: "shop"
  });
  assert.equal(harness.store.getState().economy.ownedItems[itemId], 1);
  assert.equal(harness.store.getState().economy.transactions.length, 1);
  assert.equal(harness.store.getState().economy.transactions[0].starGemsDelta, -20);
  assert.equal(selectEquippedItem(harness.store.getState(), "accessory"), "wardrobe.star-pendant");
});

test("insufficient funds cannot partially grant wardrobe ownership or debit currency", () => {
  const harness = createHarness({ starGems: 10 });
  const itemId = "wardrobe.moonbeam-bow";
  const before = harness.store.getState();
  const result = harness.service.purchaseItem(itemId);
  assert.equal(result.purchased, false);
  assert.equal(result.reason, "insufficient-star-gems");
  assert.equal(harness.store.getState(), before);
  assert.equal(selectWardrobeOwnership(harness.store.getState(), itemId), null);
  assert.equal(harness.store.getState().economy.transactions.length, 0);
  assert.equal(harness.store.getState().economy.starGems, 10);
});

test("a purchased wardrobe item cannot be purchased twice", () => {
  const harness = createHarness({ starGems: 100 });
  const itemId = "wardrobe.lavender-crown";
  assert.equal(harness.service.purchaseItem(itemId).purchased, true);
  const before = harness.store.getState();
  const second = harness.service.purchaseItem(itemId);
  assert.equal(second.purchased, false);
  assert.equal(second.reason, "already-owned");
  assert.equal(harness.store.getState(), before);
  assert.equal(harness.store.getState().economy.starGems, 70);
  assert.equal(harness.store.getState().economy.transactions.length, 1);
});

test("only owned items can be equipped and each item can occupy only its declared slot", () => {
  const harness = createHarness();
  const locked = harness.service.equipItem("wardrobe.lavender-crown");
  assert.deepEqual(locked, {
    equipped: false,
    reason: "item-locked",
    itemId: "wardrobe.lavender-crown"
  });
  assert.throws(() => harness.store.dispatch({
    type: "wardrobe/equipment-changed",
    payload: { slot: "head", itemId: "wardrobe.academy-tunic" }
  }), /does not belong/);
  const before = harness.store.getState();
  const receipt = harness.store.dispatch({
    type: "wardrobe/equipment-changed",
    payload: { slot: "head", itemId: "wardrobe.lavender-crown" }
  });
  assert.equal(receipt.changed, false);
  assert.equal(harness.store.getState(), before);
  assert.equal(selectEquippedItem(harness.store.getState(), "head"), "wardrobe.starlight-tiara");
});

test("equipping and removing items updates only the target slot", () => {
  const harness = createHarness({ starGems: 100 });
  harness.service.purchaseItem("wardrobe.lavender-crown");
  harness.service.purchaseItem("wardrobe.cloud-dance-dress");
  harness.service.equipItem("wardrobe.lavender-crown");
  harness.service.equipItem("wardrobe.cloud-dance-dress");
  assert.equal(selectEquippedItem(harness.store.getState(), "head"), "wardrobe.lavender-crown");
  assert.equal(selectEquippedItem(harness.store.getState(), "outfit"), "wardrobe.cloud-dance-dress");
  assert.equal(selectEquippedItem(harness.store.getState(), "footwear"), "wardrobe.moonlit-slippers");
  assert.equal(harness.service.unequipSlot("head").changed, true);
  assert.equal(selectEquippedItem(harness.store.getState(), "head"), null);
  assert.equal(selectEquippedItem(harness.store.getState(), "outfit"), "wardrobe.cloud-dance-dress");
});

test("wardrobe preview exposes equipped slots and ownership/acquisition status for every item", () => {
  const harness = createHarness({ starGems: 25 });
  const preview = harness.service.getPreview();
  assert.equal(preview.equipped.length, 4);
  assert.equal(preview.inventory.length, defaultWardrobeItems.length);
  const shopItem = preview.inventory.find((item) => item.id === "wardrobe.sparkle-boots");
  assert.equal(shopItem.status, "locked");
  assert.equal(shopItem.available, true);
  const chapterItem = preview.inventory.find((item) => item.id === "wardrobe.comet-dance-dress");
  assert.equal(chapterItem.available, false);
  assert.equal(chapterItem.reason, "complete-chapter-01");
});

test("legacy saves receive starter wardrobe defaults while preserving other progress", () => {
  const catalog = createWardrobeCatalog(defaultWardrobeItems);
  const defaults = {
    ...createInitialGameState(),
    economy: createInitialEconomyState(),
    wardrobe: createInitialWardrobeState(catalog),
    profile: { nickname: "Star Student" }
  };
  const restored = mergeGameStateDefaults(defaults, {
    app: { screenId: "academy" },
    profile: { nickname: "Moonbeam" },
    curriculum: { skills: { "math.multiplication": { totalResponses: 6 } } }
  });
  assert.deepEqual(restored.wardrobe, defaults.wardrobe);
  assert.equal(restored.profile.nickname, "Moonbeam");
  assert.equal(restored.curriculum.skills["math.multiplication"].totalResponses, 6);
});

test("wardrobe catalog IDs and inventory lookup remain safe for unknown identifiers", () => {
  const harness = createHarness();
  assert.equal(harness.wardrobeCatalog.get("wardrobe.unknown"), null);
  assert.equal(selectWardrobeOwnership(harness.store.getState(), "wardrobe.unknown"), null);
  assert.equal(selectEquippedItem(harness.store.getState(), "unknown-slot"), null);
});

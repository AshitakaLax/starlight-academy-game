import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import { gameConfig } from "../src/config/gameConfig.js";
import { createRewardRegistry, createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createInitialEconomyState, selectEconomy, selectOwnedItemCount } from "../src/systems/economy/economyState.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import { createEconomyService } from "../src/systems/economy/createEconomyService.js";

function createHarness({ initialEconomy = createInitialEconomyState(), rewards = [], items = [] } = {}) {
  const rewardRegistry = createRewardRegistry(rewards);
  const shopCatalog = createShopCatalog(items);
  const actions = createEconomyActionDefinitions({ rewardRegistry, shopCatalog });
  const store = createGameStore({
    initialState: { ...createInitialGameState(), economy: initialEconomy },
    actions
  });
  const service = createEconomyService({ store, rewardRegistry, shopCatalog });
  return { store, rewardRegistry, shopCatalog, service };
}

const firstChapterReward = {
  id: "chapter-01.completion",
  sourceId: "chapter-01",
  title: "Chapter One Star Celebration",
  starGems: 30,
  starlightSparkles: 4,
  replayPolicy: { type: "once" }
};

const sideQuestReward = {
  id: "chapter-01.star-trail-reward",
  sourceId: "chapter-01.star-trail",
  title: "Star Trail Replay Reward",
  starGems: 5,
  starlightSparkles: 1,
  replayPolicy: { type: "capped", maxClaims: 3 }
};

const crown = {
  id: "wardrobe.star-crown",
  title: "Starlight Crown",
  priceStarGems: 20,
  maxOwned: 1
};

test("economy starts with zero balances and separate currency ledgers", () => {
  const initial = createInitialEconomyState();
  assert.deepEqual(initial, {
    starGems: 0,
    starlightSparkles: 0,
    rewardClaims: {},
    ownedItems: {},
    transactions: [],
    nextTransactionSequence: 1
  });
  const harness = createHarness();
  assert.deepEqual(harness.service.getBalance(), { starGems: 0, starlightSparkles: 0 });
  assert.equal(Object.hasOwn(harness.service.getBalance(), "spendableSparkles"), false);
});

test("reward definitions require positive value and an explicit one-time or capped replay policy", () => {
  const rewards = createRewardRegistry([firstChapterReward, sideQuestReward]);
  assert.equal(rewards.get(firstChapterReward.id).starGems, 30);
  assert.equal(rewards.get(firstChapterReward.id).replayPolicy.type, "once");
  assert.equal(rewards.get(sideQuestReward.id).replayPolicy.maxClaims, 3);
  assert.ok(Object.isFrozen(rewards.get(firstChapterReward.id)));
  assert.throws(() => rewards.register(firstChapterReward), /already registered/);
  assert.throws(() => createRewardRegistry([{
    ...firstChapterReward, starGems: 0, starlightSparkles: 0
  }]), /at least one currency/);
  assert.throws(() => createRewardRegistry([{
    ...firstChapterReward, replayPolicy: { type: "unlimited" }
  }]), /once.*capped/);
  assert.throws(() => createRewardRegistry([{
    ...firstChapterReward, replayPolicy: { type: "capped", maxClaims: gameConfig.economy.maximumRewardClaims + 1 }
  }]), /maximum/);
  assert.throws(() => createRewardRegistry([{
    ...firstChapterReward, starGems: Number.MAX_SAFE_INTEGER + 1
  }]), /safe integer/);
});

test("shop catalog validates item IDs, positive Star Gem prices, and ownership caps", () => {
  const catalog = createShopCatalog([crown]);
  assert.equal(catalog.get(crown.id).priceStarGems, 20);
  assert.equal(catalog.get(crown.id).maxOwned, 1);
  assert.ok(Object.isFrozen(catalog.get(crown.id)));
  assert.throws(() => catalog.register(crown), /already registered/);
  assert.throws(() => createShopCatalog([{ ...crown, priceStarGems: 0 }]), /positive safe integer/);
  assert.throws(() => createShopCatalog([{ ...crown, maxOwned: 0 }]), /maxOwned/);
  assert.throws(() => createShopCatalog([{ ...crown, purchaseWith: "starlightSparkles" }]), /only id, title/);
});

test("a one-time chapter reward atomically grants Gems, Sparkles, claim record, and transaction", () => {
  const harness = createHarness({ rewards: [firstChapterReward] });
  const result = harness.service.claimReward(firstChapterReward.id);
  assert.equal(result.granted, true);
  assert.equal(result.reason, "reward-granted");
  assert.deepEqual(result.balance, { starGems: 30, starlightSparkles: 4 });

  const economy = harness.store.getState().economy;
  assert.equal(economy.rewardClaims[firstChapterReward.id], 1);
  assert.equal(economy.transactions.length, 1);
  assert.deepEqual(economy.transactions[0], {
    sequence: 1,
    type: "reward",
    referenceId: firstChapterReward.id,
    sourceId: firstChapterReward.sourceId,
    starGemsDelta: 30,
    starlightSparklesDelta: 4,
    starGemsBalance: 30,
    starlightSparklesBalance: 4
  });
  assert.equal(economy.nextTransactionSequence, 2);
});

test("the same one-time reward cannot be farmed by replaying the activity", () => {
  const harness = createHarness({ rewards: [firstChapterReward] });
  assert.equal(harness.service.claimReward(firstChapterReward.id).granted, true);
  const before = harness.store.getState();
  const duplicate = harness.service.claimReward(firstChapterReward.id);
  assert.equal(duplicate.granted, false);
  assert.equal(duplicate.reason, "already-claimed");
  assert.equal(harness.store.getState(), before);
  assert.deepEqual(harness.service.getBalance(), { starGems: 30, starlightSparkles: 4 });
  assert.equal(harness.store.getState().economy.transactions.length, 1);
});

test("replay-capped rewards can be earned only up to their registered maximum", () => {
  const harness = createHarness({ rewards: [sideQuestReward] });
  const grants = Array.from({ length: 4 }, () => harness.service.claimReward(sideQuestReward.id));
  assert.deepEqual(grants.map((result) => result.granted), [true, true, true, false]);
  assert.equal(grants[3].reason, "replay-cap-reached");
  assert.equal(harness.store.getState().economy.rewardClaims[sideQuestReward.id], 3);
  assert.deepEqual(harness.service.getBalance(), { starGems: 15, starlightSparkles: 3 });
  assert.equal(harness.store.getState().economy.transactions.length, 3);
});

test("purchases spend only Star Gems and use the registered catalog price", () => {
  const earn = { ...firstChapterReward, starGems: 30, starlightSparkles: 50 };
  const harness = createHarness({ rewards: [earn], items: [crown] });
  harness.service.claimReward(earn.id);
  assert.equal(harness.service.canPurchase(crown.id).allowed, true);
  const purchased = harness.service.purchaseItem(crown.id);
  assert.equal(purchased.purchased, true);
  assert.equal(purchased.transaction.starGemsDelta, -20);
  assert.equal(purchased.transaction.starlightSparklesDelta, 0);
  assert.deepEqual(purchased.balance, { starGems: 10, starlightSparkles: 50 });
  assert.equal(selectOwnedItemCount(harness.store.getState(), crown.id), 1);
  assert.equal(harness.store.getState().economy.transactions.length, 2);
});

test("Sparkles cannot cover a purchase when the Star Gem balance is insufficient", () => {
  const sparkleReward = { ...firstChapterReward, starGems: 0, starlightSparkles: 100 };
  const expensive = { ...crown, priceStarGems: 1 };
  const harness = createHarness({ rewards: [sparkleReward], items: [expensive] });
  harness.service.claimReward(sparkleReward.id);
  assert.deepEqual(harness.service.getBalance(), { starGems: 0, starlightSparkles: 100 });
  assert.deepEqual(harness.service.canPurchase(expensive.id), {
    allowed: false, reason: "insufficient-star-gems"
  });
  const before = harness.store.getState();
  const result = harness.service.purchaseItem(expensive.id);
  assert.equal(result.purchased, false);
  assert.equal(result.reason, "insufficient-star-gems");
  assert.equal(harness.store.getState(), before);
  assert.equal(harness.store.getState().economy.starGems, 0);
  assert.equal(harness.store.getState().economy.starlightSparkles, 100);
});

test("ownership caps prevent duplicate optional cosmetic purchases", () => {
  const earn = { ...firstChapterReward, starGems: 100, starlightSparkles: 0 };
  const harness = createHarness({ rewards: [earn], items: [crown] });
  harness.service.claimReward(earn.id);
  assert.equal(harness.service.purchaseItem(crown.id).purchased, true);
  const before = harness.store.getState();
  const second = harness.service.purchaseItem(crown.id);
  assert.equal(second.purchased, false);
  assert.equal(second.reason, "ownership-limit-reached");
  assert.equal(harness.store.getState(), before);
  assert.equal(harness.store.getState().economy.starGems, 80);
  assert.equal(harness.store.getState().economy.transactions.length, 2);
});

test("action payloads cannot supply their own reward amount or shop price", () => {
  const harness = createHarness({ rewards: [firstChapterReward], items: [crown] });
  assert.throws(() => harness.store.dispatch({
    type: "economy/reward-claimed",
    payload: { rewardId: firstChapterReward.id, starGems: 999999 }
  }), /rewardId/);
  assert.throws(() => harness.store.dispatch({
    type: "economy/item-purchased",
    payload: { itemId: crown.id, priceStarGems: 0 }
  }), /itemId/);
  assert.equal(harness.store.getState().economy.starGems, 0);
  assert.equal(harness.store.getVersion(), 0);
});

test("unknown reward and item IDs are not accepted by the economy service", () => {
  const harness = createHarness();
  assert.throws(() => harness.service.claimReward("chapter-99.fake-reward"), /Unknown reward ID/);
  assert.throws(() => harness.service.purchaseItem("wardrobe.fake-item"), /Unknown shop item ID/);
  assert.equal(harness.store.getVersion(), 0);
});

test("reward and purchase reducers enforce caps and affordability even when dispatched directly", () => {
  const harness = createHarness({
    rewards: [firstChapterReward],
    items: [crown]
  });
  harness.store.dispatch({ type: "economy/reward-claimed", payload: { rewardId: firstChapterReward.id } });
  const afterReward = harness.store.getState();
  harness.store.dispatch({ type: "economy/reward-claimed", payload: { rewardId: firstChapterReward.id } });
  assert.equal(harness.store.getState(), afterReward);
  harness.store.dispatch({ type: "economy/item-purchased", payload: { itemId: crown.id } });
  assert.equal(harness.store.getState(), afterReward);
  assert.equal(harness.store.getState().economy.starGems, 30);
});

test("every successful transaction is atomic and transaction history is bounded", () => {
  const rewardList = Array.from({ length: gameConfig.economy.transactionHistoryLimit + 2 }, (_, index) => ({
    id: "chapter-" + String(index + 1).padStart(2, "0") + ".completion",
    sourceId: "chapter-" + String(index + 1).padStart(2, "0"),
    title: "Chapter reward " + (index + 1),
    starGems: 1,
    starlightSparkles: 1,
    replayPolicy: { type: "once" }
  }));
  const harness = createHarness({ rewards: rewardList });
  for (const reward of rewardList) harness.service.claimReward(reward.id);
  const economy = harness.store.getState().economy;
  assert.equal(economy.starGems, rewardList.length);
  assert.equal(economy.starlightSparkles, rewardList.length);
  assert.equal(economy.transactions.length, gameConfig.economy.transactionHistoryLimit);
  assert.equal(economy.transactions[0].sequence, 3);
  assert.equal(economy.transactions.at(-1).sequence, rewardList.length);
  assert.equal(economy.nextTransactionSequence, rewardList.length + 1);
});

test("legacy saves receive an empty economy without losing other saved progress", () => {
  const defaults = {
    ...createInitialGameState(),
    economy: createInitialEconomyState(),
    profile: { nickname: "Star Student" }
  };
  const restored = mergeGameStateDefaults(defaults, {
    app: { screenId: "academy" },
    profile: { nickname: "Moonbeam" },
    curriculum: { skills: { "math.multiplication": { totalResponses: 4 } } }
  });
  assert.deepEqual(restored.economy, createInitialEconomyState());
  assert.equal(restored.profile.nickname, "Moonbeam");
  assert.equal(restored.curriculum.skills["math.multiplication"].totalResponses, 4);
});

test("economy selectors safely report defaults and ignore malformed owned-item counts", () => {
  assert.deepEqual(selectEconomy({}), {
    starGems: 0,
    starlightSparkles: 0,
    rewardClaims: {},
    ownedItems: {},
    transactions: []
  });
  assert.equal(selectOwnedItemCount({ economy: { ownedItems: { "wardrobe.star-crown": -4 } } }, "wardrobe.star-crown"), 0);
});

import { selectEconomy, selectOwnedItemCount } from "./economyState.js";

/** The only runtime entry point for earning currency and buying catalog items. */
export function createEconomyService({ store, rewardRegistry, shopCatalog } = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.dispatch !== "function") {
    throw new TypeError("createEconomyService requires a compatible game store.");
  }
  if (!rewardRegistry || typeof rewardRegistry.get !== "function") {
    throw new TypeError("createEconomyService requires a reward registry.");
  }
  if (!shopCatalog || typeof shopCatalog.get !== "function") {
    throw new TypeError("createEconomyService requires a shop catalog.");
  }

  function getBalance() {
    const economy = selectEconomy(store.getState());
    return Object.freeze({
      starGems: economy.starGems,
      starlightSparkles: economy.starlightSparkles
    });
  }

  function claimReward(rewardId) {
    if (typeof rewardId !== "string" || !rewardId.trim()) {
      throw new TypeError("claimReward requires a non-empty reward ID.");
    }
    const reward = rewardRegistry.get(rewardId);
    if (!reward) throw new RangeError("Unknown reward ID: " + rewardId);

    const before = selectEconomy(store.getState());
    const previousClaims = before.rewardClaims[rewardId];
    const claimCount = Number.isSafeInteger(previousClaims) && previousClaims >= 0 ? previousClaims : 0;
    const maximumClaims = reward.replayPolicy.type === "once" ? 1 : reward.replayPolicy.maxClaims;
    if (claimCount >= maximumClaims) {
      return Object.freeze({
        granted: false,
        reason: reward.replayPolicy.type === "once" ? "already-claimed" : "replay-cap-reached",
        rewardId,
        claimCount,
        maximumClaims,
        balance: getBalance()
      });
    }
    if (!Number.isSafeInteger(before.starGems + reward.starGems)
        || !Number.isSafeInteger(before.starlightSparkles + reward.starlightSparkles)) {
      return Object.freeze({ granted: false, reason: "balance-limit-reached", rewardId, balance: getBalance() });
    }

    const receipt = store.dispatch({ type: "economy/reward-claimed", payload: { rewardId } });
    const after = selectEconomy(store.getState());
    const granted = receipt.changed === true
      && after.rewardClaims[rewardId] === claimCount + 1;
    return Object.freeze({
      granted,
      reason: granted ? "reward-granted" : "reward-not-applied",
      rewardId,
      claimCount: after.rewardClaims[rewardId] ?? claimCount,
      maximumClaims,
      transaction: granted ? after.transactions.at(-1) ?? null : null,
      balance: getBalance()
    });
  }

  function purchaseItem(itemId) {
    if (typeof itemId !== "string" || !itemId.trim()) {
      throw new TypeError("purchaseItem requires a non-empty item ID.");
    }
    const item = shopCatalog.get(itemId);
    if (!item) throw new RangeError("Unknown shop item ID: " + itemId);

    const before = selectEconomy(store.getState());
    const ownedCount = selectOwnedItemCount(store.getState(), itemId);
    if (ownedCount >= item.maxOwned) {
      return Object.freeze({
        purchased: false,
        reason: "ownership-limit-reached",
        itemId,
        ownedCount,
        priceStarGems: item.priceStarGems,
        balance: getBalance()
      });
    }
    if (before.starGems < item.priceStarGems) {
      return Object.freeze({
        purchased: false,
        reason: "insufficient-star-gems",
        itemId,
        ownedCount,
        priceStarGems: item.priceStarGems,
        balance: getBalance()
      });
    }

    const receipt = store.dispatch({ type: "economy/item-purchased", payload: { itemId } });
    const after = selectEconomy(store.getState());
    const nextOwnedCount = selectOwnedItemCount(store.getState(), itemId);
    const purchased = receipt.changed === true && nextOwnedCount === ownedCount + 1;
    return Object.freeze({
      purchased,
      reason: purchased ? "purchase-complete" : "purchase-not-applied",
      itemId,
      ownedCount: nextOwnedCount,
      priceStarGems: item.priceStarGems,
      transaction: purchased ? after.transactions.at(-1) ?? null : null,
      balance: getBalance()
    });
  }

  function canPurchase(itemId) {
    const item = shopCatalog.get(itemId);
    if (!item) return Object.freeze({ allowed: false, reason: "unknown-shop-item" });
    const state = store.getState();
    const ownedCount = selectOwnedItemCount(state, itemId);
    const balance = getBalance();
    if (ownedCount >= item.maxOwned) return Object.freeze({ allowed: false, reason: "ownership-limit-reached" });
    if (balance.starGems < item.priceStarGems) return Object.freeze({ allowed: false, reason: "insufficient-star-gems" });
    return Object.freeze({ allowed: true, reason: "purchase-available" });
  }

  return Object.freeze({
    claimReward,
    purchaseItem,
    canPurchase,
    getBalance,
    getState() { return selectEconomy(store.getState()); }
  });
}

import { gameConfig } from "../../config/gameConfig.js";

/** Create a serializable blank economy; Sparkles are achievements, never a wallet. */
export function createInitialEconomyState() {
  return {
    starGems: gameConfig.economy.defaultStarGems,
    starlightSparkles: gameConfig.economy.defaultStarlightSparkles,
    rewardClaims: {},
    ownedItems: {},
    transactions: [],
    nextTransactionSequence: 1
  };
}

function isNonNegativeSafeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

/** Read balances with safe defaults and never expose Sparkles as spendable funds. */
export function selectEconomy(state) {
  const economy = state?.economy;
  const defaults = createInitialEconomyState();
  return Object.freeze({
    starGems: isNonNegativeSafeInteger(economy?.starGems) ? economy.starGems : defaults.starGems,
    starlightSparkles: isNonNegativeSafeInteger(economy?.starlightSparkles)
      ? economy.starlightSparkles
      : defaults.starlightSparkles,
    rewardClaims: economy?.rewardClaims && typeof economy.rewardClaims === "object" ? economy.rewardClaims : Object.freeze({}),
    ownedItems: economy?.ownedItems && typeof economy.ownedItems === "object" ? economy.ownedItems : Object.freeze({}),
    transactions: Array.isArray(economy?.transactions) ? economy.transactions : Object.freeze([])
  });
}

export function selectOwnedItemCount(state, itemId) {
  const count = selectEconomy(state).ownedItems[itemId];
  return isNonNegativeSafeInteger(count) ? count : 0;
}

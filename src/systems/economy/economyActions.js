import { isPlainObject } from "../../core/state/stateUtils.js";
import { gameConfig } from "../../config/gameConfig.js";
import { createInitialEconomyState } from "./economyState.js";

function hasOnlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function validateIdPayload(payload, key, label, registry) {
  return isPlainObject(payload)
    && Object.keys(payload).length === 1
    && hasOnlyKeys(payload, [key])
    && typeof payload[key] === "string"
    && registry.has(payload[key])
    ? true
    : label + " expects a registered " + key + ".";
}

function readEconomy(state) {
  if (!isPlainObject(state.economy)) return createInitialEconomyState();
  const current = state.economy;
  if (!Number.isSafeInteger(current.starGems) || current.starGems < 0
      || !Number.isSafeInteger(current.starlightSparkles) || current.starlightSparkles < 0) {
    return null;
  }
  return {
    ...createInitialEconomyState(),
    ...current,
    rewardClaims: isPlainObject(current.rewardClaims) ? current.rewardClaims : {},
    ownedItems: isPlainObject(current.ownedItems) ? current.ownedItems : {},
    transactions: Array.isArray(current.transactions) ? current.transactions : [],
    nextTransactionSequence: Number.isSafeInteger(current.nextTransactionSequence)
      && current.nextTransactionSequence > 0
      ? current.nextTransactionSequence
      : 1
  };
}

function recordTransaction(economy, transaction) {
  const sequence = economy.nextTransactionSequence;
  if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence === Number.MAX_SAFE_INTEGER) return null;
  const entry = Object.freeze({ sequence, ...transaction });
  return {
    ...economy,
    transactions: [...economy.transactions, entry].slice(-gameConfig.economy.transactionHistoryLimit),
    nextTransactionSequence: sequence + 1
  };
}

/**
 * Reducers consult registered definitions for authoritative values and commit
 * each reward or purchase as one atomic state transition. Repeated/capped
 * claims, insufficient funds, and ownership limits are harmless no-ops.
 */
export function createEconomyActionDefinitions({ rewardRegistry, shopCatalog } = {}) {
  if (!rewardRegistry || typeof rewardRegistry.get !== "function" || typeof rewardRegistry.has !== "function") {
    throw new TypeError("createEconomyActionDefinitions requires a reward registry.");
  }
  if (!shopCatalog || typeof shopCatalog.get !== "function" || typeof shopCatalog.has !== "function") {
    throw new TypeError("createEconomyActionDefinitions requires a shop catalog.");
  }

  return Object.freeze({
    "economy/reward-claimed": Object.freeze({
      validate(payload) {
        return validateIdPayload(payload, "rewardId", "economy/reward-claimed", rewardRegistry);
      },
      reduce(state, payload) {
        const reward = rewardRegistry.get(payload.rewardId);
        const economy = readEconomy(state);
        if (!reward || !economy) return state;
        const priorClaims = economy.rewardClaims[reward.id];
        const claimCount = Number.isSafeInteger(priorClaims) && priorClaims >= 0 ? priorClaims : 0;
        const maximumClaims = reward.replayPolicy.type === "once" ? 1 : reward.replayPolicy.maxClaims;
        if (claimCount >= maximumClaims) return state;

        const nextGems = economy.starGems + reward.starGems;
        const nextSparkles = economy.starlightSparkles + reward.starlightSparkles;
        if (!Number.isSafeInteger(nextGems) || !Number.isSafeInteger(nextSparkles)) return state;

        const nextEconomy = recordTransaction(economy, {
          type: "reward",
          referenceId: reward.id,
          sourceId: reward.sourceId,
          starGemsDelta: reward.starGems,
          starlightSparklesDelta: reward.starlightSparkles,
          starGemsBalance: nextGems,
          starlightSparklesBalance: nextSparkles
        });
        if (!nextEconomy) return state;
        return {
          ...state,
          economy: {
            ...nextEconomy,
            starGems: nextGems,
            starlightSparkles: nextSparkles,
            rewardClaims: { ...economy.rewardClaims, [reward.id]: claimCount + 1 }
          }
        };
      }
    }),

    "economy/item-purchased": Object.freeze({
      validate(payload) {
        return validateIdPayload(payload, "itemId", "economy/item-purchased", shopCatalog);
      },
      reduce(state, payload) {
        const item = shopCatalog.get(payload.itemId);
        const economy = readEconomy(state);
        if (!item || !economy) return state;
        const priorOwned = economy.ownedItems[item.id];
        const ownedCount = Number.isSafeInteger(priorOwned) && priorOwned >= 0 ? priorOwned : 0;
        if (ownedCount >= item.maxOwned || economy.starGems < item.priceStarGems) return state;

        const nextGems = economy.starGems - item.priceStarGems;
        if (!Number.isSafeInteger(nextGems) || nextGems < 0) return state;
        const nextEconomy = recordTransaction(economy, {
          type: "purchase",
          referenceId: item.id,
          sourceId: null,
          starGemsDelta: -item.priceStarGems,
          starlightSparklesDelta: 0,
          starGemsBalance: nextGems,
          starlightSparklesBalance: economy.starlightSparkles
        });
        if (!nextEconomy) return state;
        return {
          ...state,
          economy: {
            ...nextEconomy,
            starGems: nextGems,
            ownedItems: { ...economy.ownedItems, [item.id]: ownedCount + 1 }
          }
        };
      }
    })
  });
}

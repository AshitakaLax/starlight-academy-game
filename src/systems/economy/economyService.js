/**
 * Economy service: Star Gems (spendable), Starlight Sparkles (non-spendable),
 * reward IDs, one-time rewards, replay policies, shop purchase validation.
 */
export class EconomyService {
  constructor(store) {
    this.store = store;
    this.grantedRewards = new Set();
    this.rewardRegistry = new Map(); // id -> reward def
    this.replayCounts = new Map();
  }

  registerReward(reward) {
    if (!reward?.id) throw new Error("Reward requires id");
    this.rewardRegistry.set(reward.id, reward);
  }

  grantReward(rewardOrId) {
    const reward = typeof rewardOrId === "string" ? this.rewardRegistry.get(rewardOrId) : rewardOrId;
    if (!reward?.id) return { ok: false, error: "unknown reward" };

    const repeatPolicy = reward.repeatPolicy || "once";
    if (repeatPolicy === "once" && this.grantedRewards.has(reward.id)) {
      return { ok: false, error: "reward already granted" };
    }
    if (repeatPolicy === "replay-capped") {
      const cap = reward.replayCap ?? 3;
      const count = this.replayCounts.get(reward.id) || 0;
      if (count >= cap) return { ok: false, error: "replay reward cap reached" };
      this.replayCounts.set(reward.id, count + 1);
    }

    // atomic: apply currency/item and record grant together
    const beforeGems = this.store.getState().economy.gems;
    const beforeSparkles = this.store.getState().economy.sparkles;
    try {
      if (reward.type === "gems") {
        const r = this.store.dispatch("economy/gems/add", { amount: reward.amount });
        if (!r.ok) throw new Error("gem grant failed");
      } else if (reward.type === "sparkles") {
        const r = this.store.dispatch("economy/sparkles/add", { amount: reward.amount });
        if (!r.ok) throw new Error("sparkle grant failed");
      } else if (reward.type === "item") {
        const r = this.store.dispatch("wardrobe/item/unlock", { itemId: reward.itemId });
        if (!r.ok) throw new Error("item unlock failed");
      } else {
        throw new Error("unknown reward type");
      }
      this.grantedRewards.add(reward.id);
      return { ok: true };
    } catch (err) {
      // rollback best-effort
      this.store.dispatch("economy/gems/spend", { amount: this.store.getState().economy.gems - beforeGems }).catch?.();
      return { ok: false, error: err.message };
    }
  }

  spendGems(amount, itemId = null, price = null) {
    const amt = Number(amount ?? price ?? 0);
    if (!Number.isFinite(amt) || amt < 0) return { ok: false, error: "invalid amount" };
    if (this.store.getState().economy.gems < amt) {
      return { ok: false, error: "insufficient gems" };
    }
    // if purchasing item, validate ownership
    if (itemId) {
      const res = this.store.dispatch("wardrobe/item/purchase", { itemId, price: amt });
      if (!res.ok) return { ok: false, error: "purchase failed" };
      return { ok: true };
    }
    const res = this.store.dispatch("economy/gems/spend", { amount: amt });
    if (!res.ok) return { ok: false, error: "spend failed" };
    return { ok: true };
  }

  // Sparkles are never spendable: no spend method exposed.
}
export default EconomyService;

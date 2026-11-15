/**
 * Registers all state action handlers (reducers). Each handler returns a new
 * state object or null to reject. Gameplay systems register additional
 * domain-specific actions through their own modules.
 */
import { Actions } from "./actions.js";
import { createDefaultState } from "../save/schema.js";

function clone(s) {
  return JSON.parse(JSON.stringify(s));
}

export function registerCoreActions(store) {
  // App
  store.registerAction(Actions.APP_BOOT, (s) => {
    const n = clone(s);
    n.app.bootstrapped = true;
    return n;
  });
  store.registerAction(Actions.SCREEN_CHANGE, (s, payload) => {
    if (!payload || typeof payload.screen !== "string") return null;
    const n = clone(s);
    n.app.screen = payload.screen;
    return n;
  });
  store.registerAction(Actions.SETTINGS_UPDATE, (s, payload) => {
    if (!payload || typeof payload !== "object") return null;
    const n = clone(s);
    n.settings = { ...n.settings, ...payload };
    return n;
  });

  // Economy
  store.registerAction(Actions.GEMS_ADD, (s, payload) => {
    const amount = Number(payload?.amount ?? 0);
    if (!Number.isFinite(amount) || amount < 0) return null;
    const n = clone(s);
    n.economy.gems += amount;
    return n;
  });
  store.registerAction(Actions.GEMS_SPEND, (s, payload) => {
    const amount = Number(payload?.amount ?? 0);
    if (!Number.isFinite(amount) || amount < 0) return null;
    if (s.economy.gems < amount) return null; // never negative
    const n = clone(s);
    n.economy.gems -= amount;
    return n;
  });
  store.registerAction(Actions.SPARKLES_ADD, (s, payload) => {
    const amount = Number(payload?.amount ?? 0);
    if (!Number.isFinite(amount) || amount < 0) return null;
    const n = clone(s);
    n.economy.sparkles += amount;
    return n;
  });

  // Save loaded (replace state)
  store.registerAction("save/loaded", (s, payload) => {
    if (!payload || typeof payload !== "object") return null;
    return clone(payload);
  });

  // Progression / skills / pets / wardrobe / gymnastics minimal
  store.registerAction(Actions.CHAPTER_START, (s, payload) => {
    if (!payload?.chapterId) return null;
    const n = clone(s);
    n.progress.chapters[payload.chapterId] = n.progress.chapters[payload.chapterId] || { started: true, completed: false, checkpoints: [] };
    n.progress.chapters[payload.chapterId].started = true;
    return n;
  });
  store.registerAction(Actions.CHAPTER_CHECKPOINT, (s, payload) => {
    if (!payload?.chapterId) return null;
    const n = clone(s);
    const rec = (n.progress.chapters[payload.chapterId] = n.progress.chapters[payload.chapterId] || { started: true, completed: false, checkpoints: [] });
    rec.checkpoints = rec.checkpoints || [];
    rec.checkpoints.push({ at: Date.now(), data: payload.data ?? null });
    return n;
  });
  store.registerAction(Actions.CHAPTER_COMPLETE, (s, payload) => {
    if (!payload?.chapterId) return null;
    const n = clone(s);
    const rec = (n.progress.chapters[payload.chapterId] = n.progress.chapters[payload.chapterId] || {});
    rec.completed = true;
    rec.completedAt = Date.now();
    rec.rewardGranted = payload.rewardId ?? rec.rewardGranted;
    return n;
  });
  store.registerAction(Actions.QUEST_COMPLETE, (s, payload) => {
    if (!payload?.questId) return null;
    const n = clone(s);
    const rec = (n.progress.quests[payload.questId] = n.progress.quests[payload.questId] || {});
    rec.completed = true;
    rec.completedAt = Date.now();
    return n;
  });

  store.registerAction(Actions.SKILL_ATTEMPT, (s, payload) => {
    if (!payload?.skillId) return null;
    const n = clone(s);
    const sk = (n.skills[payload.skillId] = n.skills[payload.skillId] || { tier: "Core", attempts: [] });
    sk.attempts = sk.attempts || [];
    sk.attempts.push({ correct: !!payload.correct, hintUsed: !!payload.hintUsed, demonstrated: !!payload.demonstrated, at: Date.now() });
    if (sk.attempts.length > 5) sk.attempts = sk.attempts.slice(-5);
    return n;
  });
  store.registerAction(Actions.SKILL_TIER_SET, (s, payload) => {
    if (!payload?.skillId || !payload?.tier) return null;
    const tiers = ["Foundation", "Developing", "Core", "Stretch"];
    if (!tiers.includes(payload.tier)) return null;
    const n = clone(s);
    const sk = (n.skills[payload.skillId] = n.skills[payload.skillId] || { tier: payload.tier, attempts: [] });
    sk.tier = payload.tier;
    return n;
  });

  store.registerAction(Actions.PET_UNLOCK, (s, payload) => {
    if (!payload?.petId) return null;
    const n = clone(s);
    if (!n.pets.pets[payload.petId]) return null;
    n.pets.pets[payload.petId].unlocked = true;
    return n;
  });
  store.registerAction(Actions.PET_SELECT_ACTIVE, (s, payload) => {
    if (!payload?.petId) return null;
    const n = clone(s);
    if (!n.pets.pets[payload.petId]?.unlocked) return null;
    n.pets.activePetId = payload.petId;
    return n;
  });
  store.registerAction(Actions.PET_CARE, (s, payload) => {
    if (!payload?.petId) return null;
    const n = clone(s);
    const pet = n.pets.pets[payload.petId];
    if (!pet) return null;
    const metric = payload.metric; // joy|nourishment|grooming
    if (!["joy", "nourishment", "grooming"].includes(metric)) return null;
    const amount = Number(payload.amount ?? 1);
    if (!Number.isFinite(amount) || amount < 0) return null;
    pet.careProgress[metric] = Math.min(100, (pet.careProgress[metric] ?? 0) + amount);
    pet.bondXp = (pet.bondXp ?? 0) + (payload.bondXp ?? 1);
    return n;
  });
  store.registerAction(Actions.PET_APPEARANCE_SET, (s, payload) => {
    if (!payload?.petId) return null;
    const n = clone(s);
    const pet = n.pets.pets[payload.petId];
    if (!pet) return null;
    pet.appearance = { ...pet.appearance, ...(payload.appearance || {}) };
    return n;
  });

  store.registerAction(Actions.ITEM_UNLOCK, (s, payload) => {
    if (!payload?.itemId) return null;
    const n = clone(s);
    if (!n.wardrobe.owned.includes(payload.itemId)) n.wardrobe.owned.push(payload.itemId);
    return n;
  });
  store.registerAction(Actions.ITEM_PURCHASE, (s, payload) => {
    // payload: { itemId, price }
    if (!payload?.itemId) return null;
    const price = Number(payload.price ?? 0);
    if (!Number.isFinite(price) || price < 0) return null;
    if (s.economy.gems < price) return null;
    const n = clone(s);
    if (n.wardrobe.owned.includes(payload.itemId)) return n; // already owned
    n.economy.gems -= price;
    n.wardrobe.owned.push(payload.itemId);
    return n;
  });
  store.registerAction(Actions.ITEM_EQUIP, (s, payload) => {
    if (!payload?.slot) return null;
    const n = clone(s);
    const itemId = payload.itemId ?? null;
    if (itemId && !n.wardrobe.owned.includes(itemId)) return null; // locked cannot equip
    if (itemId === null) delete n.wardrobe.equipped[payload.slot];
    else n.wardrobe.equipped[payload.slot] = itemId;
    return n;
  });
  store.registerAction(Actions.TEXTURE_SAVE, (s, payload) => {
    if (!payload?.itemId) return null;
    const n = clone(s);
    n.wardrobe.textures[payload.itemId] = payload.dataUrl ?? null;
    return n;
  });

  store.registerAction(Actions.ROUTINE_START, (s, payload) => {
    if (!payload?.routineId) return null;
    const n = clone(s);
    n.gymnastics.routines[payload.routineId] = n.gymnastics.routines[payload.routineId] || { plays: 0 };
    return n;
  });
  store.registerAction(Actions.ROUTINE_CHECKPOINT, (s, payload) => {
    if (!payload?.routineId) return null;
    return clone(s);
  });
  store.registerAction(Actions.ROUTINE_COMPLETE, (s, payload) => {
    if (!payload?.routineId) return null;
    const n = clone(s);
    const rec = (n.gymnastics.routines[payload.routineId] = n.gymnastics.routines[payload.routineId] || { plays: 0 });
    rec.plays = (rec.plays ?? 0) + 1;
    rec.lastTracing = payload.tracing ?? rec.lastTracing;
    rec.lastRhythm = payload.rhythm ?? rec.lastRhythm;
    rec.lastCombined = payload.combined ?? rec.lastCombined;
    rec.bestTracing = Math.max(rec.bestTracing ?? 0, payload.tracing ?? 0);
    rec.bestRhythm = Math.max(rec.bestRhythm ?? 0, payload.rhythm ?? 0);
    rec.bestCombined = Math.max(rec.bestCombined ?? 0, payload.combined ?? 0);
    rec.stars = Math.max(rec.stars ?? 0, payload.stars ?? 0);
    return n;
  });
}
export default registerCoreActions;

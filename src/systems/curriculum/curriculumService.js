/**
 * Curriculum service: skill registry, generator registry, seeded generation,
 * evidence recording, and per-skill mastery state.
 */
import { SkillRegistry } from "./skillRegistry.js";
import { adjustTier } from "./mastery.js";

export class CurriculumService {
  constructor(store) {
    this.store = store;
    this.skills = new SkillRegistry();
    this.generators = new Map(); // skillId -> QuestionGenerator
  }

  registerSkill(skillId, meta) {
    this.skills.define(skillId, meta);
    this.initializeSkill(skillId);
  }

  initializeSkill(skillId) {
    if (!this.store) return;
    const state = this.store.getState().skills?.[skillId];
    if (state) return; // preserve existing mastery
    const pref = this.store.getState().settings?.startingDifficultyPreference || "standard";
    const tier = (pref === "gentle") ? "Developing" : (pref === "challenging") ? "Stretch" : "Core";
    this.store.dispatch("skill/tier/set", { skillId, tier });
  }

  registerGenerator(skillId, generator) {
    this.generators.set(skillId, generator);
  }

  getSkill(skillId) {
    return this.skills.get(skillId);
  }

  generate(skillId, seed, params = {}, tier) {
    const gen = this.generators.get(skillId);
    if (!gen) throw new Error(`No generator for skill ${skillId}`);
    const supported = gen.supportedTiers || [];
    const effectiveTier = tier || "Core";
    if (supported.length && !supported.includes(effectiveTier)) {
      throw new Error(`Tier ${effectiveTier} not supported for ${skillId}`);
    }
    const q = gen.generate(seed, { ...params, tier: effectiveTier });
    if (!gen.validate(q)) throw new Error(`Invalid generated question for ${skillId}`);
    return { ...q, skillId, tier: effectiveTier, seed };
  }

  recordAttempt(skillId, evidence) {
    if (!this.store) return;
    this.store.dispatch("skill/attempt", {
      skillId,
      correct: !!evidence.correct,
      hintUsed: !!evidence.hintUsed,
      demonstrated: !!evidence.demonstrated,
    });
    // adjust tier based on rolling evidence
    const skillState = this.store.getState().skills?.[skillId];
    const attempts = skillState?.attempts || [];
    const currentTier = skillState?.tier || "Core";
    const nextTier = adjustTier(currentTier, attempts);
    if (nextTier !== currentTier) {
      this.store.dispatch("skill/tier/set", { skillId, tier: nextTier });
    }
  }

  getTier(skillId) {
    return this.store?.getState().skills?.[skillId]?.tier || "Core";
  }
}
export default CurriculumService;

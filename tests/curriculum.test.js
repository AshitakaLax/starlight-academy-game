import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import { gameConfig } from "../src/config/gameConfig.js";
import { createLowPressureOnboardingProfile, evaluateAdaptiveTier, selectSkillTier, selectSupportedSkillTier } from "../src/systems/curriculum/adaptiveDifficulty.js";
import { DIFFICULTY_TIER_IDS, difficultyTierDefinitions, getDifficultyTier } from "../src/systems/curriculum/difficultyTiers.js";
import { skillDefinitions, skillRegistry, getSkillDefinition } from "../src/systems/curriculum/skillRegistry.js";
import { createActivityDefinition, createActivityRegistry, validateActivityDefinition } from "../src/systems/curriculum/activityDefinitions.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";
import { createSeededRandom, createQuestionGeneratorRegistry, generateQuestion } from "../src/systems/curriculum/questionGenerators.js";
import {
  createInitialCurriculumProgress,
  curriculumActionDefinitions,
  selectSkillProgress,
  selectCurriculumEvidence
} from "../src/systems/curriculum/curriculumProgress.js";

function createStore() {
  return createGameStore({
    initialState: {
      ...createInitialGameState(),
      curriculum: createInitialCurriculumProgress()
    },
    actions: curriculumActionDefinitions
  });
}

function multiplicationActivity() {
  return createActivityDefinition({
    id: "chapter-01.multiplication-practice",
    title: "Multiplication practice",
    skillIds: ["math.multiplication"],
    objectives: ["Solve multiplication facts using equal groups and known facts."],
    supportedTiers: ["foundation", "core", "stretch"],
    answerRules: { type: "numeric", tolerance: 0 },
    generatorId: "arithmetic.multiplication",
    generatorConstraints: {
      foundation: { factorMin: 1, factorMax: 5, multiplierMin: 1, multiplierMax: 5, choiceCount: 4 },
      core: { factorMin: 2, factorMax: 10, multiplierMin: 2, multiplierMax: 10, choiceCount: 4 },
      stretch: { factorMin: 6, factorMax: 12, multiplierMin: 6, multiplierMax: 12, choiceCount: 4 }
    }
  });
}

function skipCountingActivity() {
  return createActivityDefinition({
    id: "chapter-01.skip-counting",
    title: "Skip-counting trail",
    skillIds: ["math.skip-counting"],
    objectives: ["Continue a sequence that grows by equal steps."],
    supportedTiers: ["foundation", "core"],
    answerRules: { type: "numeric" },
    generatorId: "number.skip-counting",
    generatorConstraints: {
      foundation: { startMin: 0, startMax: 10, stepMin: 2, stepMax: 3, sequenceLength: 3, choiceCount: 4 },
      core: { startMin: 5, startMax: 40, stepMin: 3, stepMax: 8, sequenceLength: 4, choiceCount: 4 }
    }
  });
}

test("difficulty tiers have stable IDs and Core is the configured default", () => {
  assert.deepEqual(DIFFICULTY_TIER_IDS, ["foundation", "core", "stretch"]);
  assert.equal(gameConfig.curriculum.defaultTier, "core");
  assert.deepEqual(difficultyTierDefinitions.map((tier) => tier.order), [1, 2, 3]);
  assert.equal(getDifficultyTier("core").label, "Core");
  assert.equal(getDifficultyTier("advanced"), null);
  assert.equal(getDifficultyTier("__proto__"), null);
});

test("skill registry contains unique, stable IDs with objectives and tier support", () => {
  const ids = skillDefinitions.map((skill) => skill.id);
  assert.ok(ids.length >= 20);
  assert.equal(new Set(ids).size, ids.length);
  for (const skill of skillDefinitions) {
    assert.equal(skillRegistry[skill.id], skill);
    assert.ok(skill.objective.length > 10);
    assert.deepEqual(skill.supportedTiers, DIFFICULTY_TIER_IDS);
  }
  assert.equal(getSkillDefinition("math.multiplication").title, "Multiplication");
  assert.equal(getSkillDefinition("unknown.skill"), null);
  assert.equal(getSkillDefinition("toString"), null);
});

test("activity definitions declare skills, objectives, tiers, answer rules, and per-tier generator constraints", () => {
  const activity = multiplicationActivity();
  assert.deepEqual(activity.skillIds, ["math.multiplication"]);
  assert.equal(activity.objectives.length, 1);
  assert.deepEqual(activity.supportedTiers, DIFFICULTY_TIER_IDS);
  assert.equal(activity.answerRules.type, "numeric");
  assert.deepEqual(Object.keys(activity.generatorConstraints), DIFFICULTY_TIER_IDS);
  assert.ok(Object.isFrozen(activity));
  assert.ok(Object.isFrozen(activity.generatorConstraints.core));
  assert.ok(Object.isFrozen(activity.skillIds));
  assert.equal(validateActivityDefinition(activity), true);
  assert.throws(() => createActivityDefinition({
    ...activity, skillIds: ["math.not-in-registry"]
  }), /skillIds/);
  assert.throws(() => createActivityDefinition({
    ...activity, supportedTiers: ["foundation", "expert"]
  }), /supportedTiers/);
  assert.throws(() => createActivityDefinition({
    ...activity, generatorConstraints: { foundation: {}, core: {} }
  }), /one plain-object constraint set/);
  assert.throws(() => createActivityDefinition({
    ...activity, answerRules: { type: "unknown" }
  }), /answerRules/);
  assert.throws(() => createActivityDefinition({
    ...activity,
    generatorConstraints: {
      foundation: { factorMin: Number.NaN },
      core: {},
      stretch: {}
    }
  }), /finite, JSON-compatible data/);

});

test("activity registry rejects duplicate IDs and returns stable sorted definitions", () => {
  const registry = createActivityRegistry([multiplicationActivity()]);
  const skip = registry.register(skipCountingActivity());
  assert.deepEqual(registry.get(skip.id), skip);
  assert.notEqual(registry.get(skip.id), skip);
  assert.equal(registry.has("chapter-01.multiplication-practice"), true);
  assert.deepEqual(registry.list().map((activity) => activity.id), [
    "chapter-01.multiplication-practice",
    "chapter-01.skip-counting"
  ]);
  assert.throws(() => registry.register(multiplicationActivity()), /already registered/);
});

test("seeded random streams repeat exactly and different seeds produce different streams", () => {
  const first = createSeededRandom("starlight-seed");
  const second = createSeededRandom("starlight-seed");
  const other = createSeededRandom("another-seed");
  const firstValues = Array.from({ length: 8 }, () => first.next());
  const secondValues = Array.from({ length: 8 }, () => second.next());
  const otherValues = Array.from({ length: 8 }, () => other.next());
  assert.deepEqual(firstValues, secondValues);
  assert.notDeepEqual(firstValues, otherValues);
  assert.throws(() => createSeededRandom(""), /non-empty string/);
  assert.throws(() => createSeededRandom(Number.NaN), /non-empty string/);
});

test("question generation is deterministic for the same activity, seed, and tier", () => {
  const activity = multiplicationActivity();
  const first = generateQuestion(activity, { seed: "chapter-one-demo", tier: "core" });
  const second = generateQuestion(activity, { seed: "chapter-one-demo", tier: "core" });
  const differentSeed = generateQuestion(activity, { seed: "chapter-one-replay", tier: "core" });
  assert.deepEqual(first, second);
  assert.notEqual(first.id, differentSeed.id);
  assert.equal(first.activityId, activity.id);
  assert.equal(first.tier, "core");
  assert.match(first.prompt, /^What is \d+ × \d+\?$/);
  assert.equal(first.choices.length, 4);
  assert.ok(first.choices.includes(first.correctAnswer));
  assert.equal(checkActivityAnswer(String(first.correctAnswer), first.correctAnswer, first.answerRules), true);
  assert.throws(() => generateQuestion(activity, { seed: "same-seed", tier: "expert" }), /does not support/);
});

test("skip-counting generator exposes the number pattern and uses tier-specific constraints", () => {
  const activity = skipCountingActivity();
  const foundation = generateQuestion(activity, { seed: 12, tier: "foundation" });
  const core = generateQuestion(activity, { seed: 12, tier: "core" });
  assert.equal(foundation.stimulus.sequence.length, 3);
  assert.equal(core.stimulus.sequence.length, 4);
  assert.equal(foundation.correctAnswer, foundation.stimulus.sequence.at(-1) + foundation.stimulus.step);
  assert.ok(Object.isFrozen(core.stimulus.sequence));
  assert.throws(() => { core.stimulus.sequence.push(999); }, TypeError);
});

test("question generator registry supports isolated custom generator extensions", () => {
  const registry = createQuestionGeneratorRegistry();
  const activity = createActivityDefinition({
    id: "custom.sequence-practice",
    title: "Custom sequence",
    skillIds: ["math.skip-counting"],
    objectives: ["Identify the missing term in a pattern."],
    supportedTiers: ["core"],
    answerRules: { type: "sequence" },
    generatorId: "custom.sequence",
    generatorConstraints: { core: { length: 3 } }
  });
  const unregister = registry.register("custom.sequence", ({ random, constraints }) => {
    const sequence = Array.from({ length: constraints.length }, () => random.integer(1, 9));
    return { prompt: "Complete the pattern.", correctAnswer: sequence, stimulus: { sequence } };
  });
  const first = registry.generate(activity, { seed: "custom-seed", tier: "core" });
  const second = registry.generate(activity, { seed: "custom-seed", tier: "core" });
  assert.deepEqual(first, second);
  assert.equal(registry.has("custom.sequence"), true);
  unregister();
  assert.equal(registry.has("custom.sequence"), false);
  assert.throws(() => registry.generate(activity, { seed: "custom-seed", tier: "core" }), /Unknown question generator/);
});

test("answer rules support numeric tolerance, normalized text, choice IDs, and sequences", () => {
  assert.equal(checkActivityAnswer("3.02", 3, { type: "numeric", tolerance: 0.05 }), true);
  assert.equal(checkActivityAnswer("3.2", 3, { type: "numeric", tolerance: 0.05 }), false);
  assert.equal(checkActivityAnswer("  StArLiGhT  ", "starlight", { type: "exact" }), true);
  assert.equal(checkActivityAnswer("B", "b", { type: "choice" }), true);
  assert.equal(checkActivityAnswer([2, 4, 6], [2, 4, 6], { type: "sequence", itemType: "numeric" }), true);
  assert.equal(checkActivityAnswer([2, 4, 5], [2, 4, 6], { type: "sequence", itemType: "numeric" }), false);
  assert.equal(checkActivityAnswer("not a number", 3, { type: "numeric" }), false);
});

test("legacy save normalization restores defaults without carrying forward progress from the current save", () => {
  const store = createStore();
  const defaults = store.getState();
  const evidencePayload = {
    skillId: "math.multiplication",
    activityId: "chapter-01.multiplication-practice",
    tier: "core",
    correct: true,
    hintLevel: 0,
    attempts: 1
  };
  store.dispatch({ type: "curriculum/evidence-recorded", payload: evidencePayload });
  assert.equal(selectSkillProgress(store.getState(), "math.multiplication").totalResponses, 1);

  const normalized = mergeGameStateDefaults(defaults, {
    app: { screenId: "academy" },
    ui: { activeOverlayId: null }
  });
  store.dispatch({ type: "app/state-restored", payload: { state: normalized } });
  assert.equal(Object.keys(store.getState().curriculum.skills).length, skillDefinitions.length);
  assert.equal(selectSkillProgress(store.getState(), "math.multiplication").totalResponses, 0);
  assert.equal(store.getState().audio.masterVolume, gameConfig.audio.defaultMasterVolume);
  assert.equal(store.getState().narration.enabled, false);

  store.dispatch({ type: "curriculum/evidence-recorded", payload: evidencePayload });
  assert.equal(selectSkillProgress(store.getState(), "math.multiplication").totalResponses, 1);
  store.destroy();
});

test("onboarding starts at Core without requiring a placement assessment", () => {
  const onboarding = createLowPressureOnboardingProfile();
  const progress = createInitialCurriculumProgress();
  assert.equal(onboarding.mode, "guided-discovery");
  assert.equal(onboarding.placementTestRequired, false);
  assert.equal(onboarding.initialTier, "core");
  assert.match(onboarding.startingGuidance, /third-grade range/i);
  assert.equal(progress.onboarding.placementTestRequired, false);
  assert.equal(progress.onboarding.initialTier, gameConfig.curriculum.defaultTier);
  assert.equal(selectSkillTier({ curriculum: progress }, "math.multiplication"), "core");
  assert.equal(selectSkillTier({ curriculum: progress }, "unknown.skill"), null);
  assert.equal(selectSupportedSkillTier({ curriculum: progress }, "math.multiplication", ["foundation", "stretch"]), "foundation");
  assert.equal(selectSupportedSkillTier({ curriculum: progress }, "math.multiplication", ["core", "stretch"]), "core");
});

test("adaptive tier policy waits for a complete rolling window and promotes on independent success", () => {
  const shortWindow = evaluateAdaptiveTier({
    currentTier: "core",
    evidence: [
      { correct: true, hintLevel: 0 },
      { correct: true, hintLevel: 0 },
      { correct: true, hintLevel: 0 },
      { correct: true, hintLevel: 0 }
    ]
  });
  assert.equal(shortWindow.changed, false);
  assert.equal(shortWindow.reason, "gathering-evidence");

  const promote = evaluateAdaptiveTier({
    currentTier: "core",
    evidence: [
      { correct: true, hintLevel: 0 },
      { correct: true, hintLevel: 0 },
      { correct: true, hintLevel: 0 },
      { correct: true, hintLevel: 0 },
      { correct: false, hintLevel: 0 }
    ]
  });
  assert.equal(promote.nextTier, "stretch");
  assert.equal(promote.direction, "increase");
  assert.equal(promote.independentCorrect, 4);
  assert.equal(Object.hasOwn(promote, "responseTime"), false);
});

test("adaptive tier policy offers more support after sustained difficulty", () => {
  const decision = evaluateAdaptiveTier({
    currentTier: "core",
    evidence: [
      { correct: false, hintLevel: 0 },
      { correct: false, hintLevel: 0 },
      { correct: false, hintLevel: 1 },
      { correct: false, hintLevel: 2 },
      { correct: true, hintLevel: 0 }
    ]
  });
  assert.equal(decision.nextTier, "foundation");
  assert.equal(decision.direction, "decrease");
  assert.equal(decision.reason, "more-supported-practice");
});

test("adaptive tiers are bounded at Foundation and Stretch", () => {
  const foundation = evaluateAdaptiveTier({
    currentTier: "foundation",
    evidence: Array.from({ length: 5 }, () => ({ correct: false, hintLevel: 0 }))
  });
  const stretch = evaluateAdaptiveTier({
    currentTier: "stretch",
    evidence: Array.from({ length: 5 }, () => ({ correct: true, hintLevel: 0 }))
  });
  assert.equal(foundation.nextTier, "foundation");
  assert.equal(foundation.reason, "foundation-support-retained");
  assert.equal(stretch.nextTier, "stretch");
  assert.equal(stretch.reason, "top-tier-demonstrated");
});

test("skill tiers adapt independently and reset their tier evidence after a change", () => {
  const store = createStore();
  const base = {
    activityId: "chapter-01.multiplication-practice",
    tier: "core",
    correct: true,
    hintLevel: 0,
    attempts: 1
  };
  for (let index = 0; index < gameConfig.curriculum.adaptiveWindowSize; index += 1) {
    store.dispatch({
      type: "curriculum/evidence-recorded",
      payload: { ...base, skillId: "math.multiplication" }
    });
  }
  const progress = store.getState();
  assert.equal(selectSkillTier(progress, "math.multiplication"), "stretch");
  assert.equal(selectSkillTier(progress, "math.division"), "core");
  assert.equal(progress.curriculum.skills["math.multiplication"].tierChanges, 1);
  assert.deepEqual(progress.curriculum.skills["math.multiplication"].tierEvidence, []);
  store.destroy();
});

test("difficulty adjustment uses only evidence for its skill's current tier", () => {
  const store = createStore();
  for (let index = 0; index < gameConfig.curriculum.adaptiveWindowSize; index += 1) {
    store.dispatch({
      type: "curriculum/evidence-recorded",
      payload: {
        skillId: "math.multiplication",
        activityId: "chapter-01.multiplication-practice",
        tier: "core",
        correct: false,
        hintLevel: 0,
        attempts: 1
      }
    });
  }
  assert.equal(selectSkillTier(store.getState(), "math.multiplication"), "foundation");
  assert.equal(selectSkillTier(store.getState(), "math.division"), "core");
  store.destroy();
});

test("STEP-10 save records receive Core and tier-evidence defaults without losing prior learning evidence", () => {
  const store = createStore();
  const defaults = store.getState();
  const olderEvidence = [{
    sequence: 3,
    skillId: "math.multiplication",
    activityId: "chapter-01.multiplication-practice",
    tier: "core",
    correct: true,
    hintLevel: 0,
    attempts: 1
  }];
  const normalized = mergeGameStateDefaults(defaults, {
    app: { screenId: "academy" },
    ui: { activeOverlayId: null },
    curriculum: {
      skills: {
        "math.multiplication": {
          totalResponses: 3,
          totalAttempts: 4,
          correctResponses: 2,
          unassistedCorrect: 2,
          hintedResponses: 0,
          masteryStatus: "in-progress",
          recentEvidence: olderEvidence
        }
      },
      evidence: olderEvidence,
      nextEvidenceSequence: 4
    }
  });
  store.dispatch({ type: "app/state-restored", payload: { state: normalized } });
  const skill = selectSkillProgress(store.getState(), "math.multiplication");
  assert.equal(skill.currentTier, "core");
  assert.deepEqual(skill.tierEvidence, []);
  assert.equal(skill.tierChanges, 0);
  assert.equal(skill.totalResponses, 3);
  assert.deepEqual(skill.recentEvidence, olderEvidence);
  assert.equal(store.getState().curriculum.onboarding.placementTestRequired, false);
  store.destroy();
});

test("fresh curriculum progress starts every registered skill independently", () => {
  const progress = createInitialCurriculumProgress();
  assert.equal(Object.keys(progress.skills).length, skillDefinitions.length);
  assert.equal(progress.skills["math.multiplication"].masteryStatus, "not-started");
  assert.equal(progress.skills["language.prefixes"].totalResponses, 0);
  assert.deepEqual(progress.evidence, []);
  assert.equal(progress.nextEvidenceSequence, 1);
  assert.equal(selectSkillProgress({ curriculum: progress }, "math.multiplication").masteryStatus, "not-started");
  assert.equal(selectSkillProgress({}, "math.multiplication").masteryStatus, "not-started");
  assert.deepEqual(selectCurriculumEvidence({}), []);
});

test("curriculum evidence is recorded per skill and mastery uses a rolling independent-evidence window", () => {
  const store = createStore();
  const record = (payload) => store.dispatch({
    type: "curriculum/evidence-recorded",
    payload: {
      skillId: "math.multiplication",
      activityId: "chapter-01.multiplication-practice",
      tier: "core",
      correct: true,
      hintLevel: 0,
      attempts: 1,
      ...payload
    }
  });

  for (let count = 0; count < 4; count += 1) record({});
  assert.equal(selectSkillProgress(store.getState(), "math.multiplication").masteryStatus, "in-progress");
  record({ hintLevel: 1 });
  let progress = selectSkillProgress(store.getState(), "math.multiplication");
  assert.equal(progress.totalResponses, 5);
  assert.equal(progress.correctResponses, 5);
  assert.equal(progress.unassistedCorrect, 4);
  assert.equal(progress.hintedResponses, 1);
  assert.equal(progress.masteryStatus, "demonstrated");
  assert.equal(selectSkillProgress(store.getState(), "math.skip-counting").masteryStatus, "not-started");
  assert.deepEqual(selectCurriculumEvidence(store.getState()).map((item) => item.sequence), [1, 2, 3, 4, 5]);

  record({ correct: false, hintLevel: 0, attempts: 2 });
  progress = selectSkillProgress(store.getState(), "math.multiplication");
  assert.equal(progress.totalAttempts, 7);
  assert.equal(progress.recentEvidence.length, gameConfig.curriculum.masteryWindowSize);
  assert.equal(progress.masteryStatus, "demonstrated");
  store.destroy();
});

test("curriculum evidence action rejects unknown skills, unsupported tiers, and malformed outcomes", () => {
  const store = createStore();
  const initial = store.getState();
  const base = {
    skillId: "math.multiplication",
    activityId: "chapter-01.multiplication-practice",
    tier: "core",
    correct: true,
    hintLevel: 0,
    attempts: 1
  };
  for (const payload of [
    { ...base, skillId: "math.unknown" },
    { ...base, tier: "expert" },
    { ...base, correct: "yes" },
    { ...base, hintLevel: 4 },
    { ...base, attempts: 0 },
    { ...base, activityId: "bad id" },
    { ...base, responseTimeMs: 2300 }
  ]) {
    assert.throws(() => store.dispatch({ type: "curriculum/evidence-recorded", payload }));
  }
  assert.equal(store.getState(), initial);
  store.destroy();
});

test("curriculum evidence history is bounded while sequence numbers continue increasing", () => {
  const store = createStore();
  for (let index = 0; index < gameConfig.curriculum.evidenceHistoryLimit + 5; index += 1) {
    store.dispatch({
      type: "curriculum/evidence-recorded",
      payload: {
        skillId: "math.skip-counting",
        activityId: "chapter-01.skip-counting",
        tier: "foundation",
        correct: index % 2 === 0,
        hintLevel: 0,
        attempts: 1
      }
    });
  }
  const evidence = selectCurriculumEvidence(store.getState());
  assert.equal(evidence.length, gameConfig.curriculum.evidenceHistoryLimit);
  assert.equal(evidence[0].sequence, 6);
  assert.equal(evidence.at(-1).sequence, gameConfig.curriculum.evidenceHistoryLimit + 5);
  store.destroy();
});

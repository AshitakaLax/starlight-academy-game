import test from "node:test";
import assert from "node:assert/strict";
import { createAcademyContentRegistries } from "../src/validation/academyContent.js";
import { validateAcademyContent } from "../src/validation/contentValidation.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";

const registry = createAcademyContentRegistries();

test("release content registration covers all chapters, optional quests, rewards, activities, hints, and generators", () => {
  assert.deepEqual(registry.validation, {
    chapters: 10,
    quests: 20,
    activities: registry.activityRegistry.list().length,
    hints: registry.hintRegistry.list().length,
    rewards: 30,
    skills: registry.validation.skills,
    generators: registry.questionGeneratorRegistry.list().length
  });
  assert.equal(registry.chapterCatalog.list().length, 30);
  assert.equal(registry.validation.activities, registry.validation.hints);
  assert.ok(registry.questionGeneratorRegistry.list().length > 0);
});

test("every registered activity generates deterministic questions with one unambiguous correct choice at every tier", () => {
  for (const activity of registry.activityRegistry.list()) {
    for (const tier of activity.supportedTiers) {
      for (let sample = 0; sample < 3; sample += 1) {
        const seed = "content-contract:" + activity.id + ":" + tier + ":" + sample;
        const question = registry.questionGeneratorRegistry.generate(activity, { seed, tier });
        const replay = registry.questionGeneratorRegistry.generate(activity, { seed, tier });
        assert.deepEqual(question, replay, activity.id + " must be deterministic for " + tier + ".");
        assert.equal(question.activityId, activity.id);
        assert.equal(question.tier, tier);
        assert.deepEqual(question.skillIds, activity.skillIds);
        if (question.choices !== undefined) {
          assert.ok(Array.isArray(question.choices) && question.choices.length >= 2,
            activity.id + " must provide at least two choices when a choice list is present.");
          const serialized = question.choices.map((choice) => JSON.stringify(choice));
          assert.equal(new Set(serialized).size, question.choices.length,
            activity.id + " has duplicate answer choices at " + tier + ".");
          const correctMatches = question.choices.filter((choice) =>
            checkActivityAnswer(choice, question.correctAnswer, question.answerRules));
          assert.equal(correctMatches.length, 1,
            activity.id + " must have exactly one correct choice at " + tier + ".");
        } else if (activity.answerRules.type === "choice") {
          assert.fail(activity.id + " uses choice answer rules but generated no choices.");
        }
      }
    }
  }
});

test("content validation reports duplicate activity IDs and broken cross-registry links", () => {
  const activityList = registry.activityRegistry.list();
  assert.throws(() => validateAcademyContent({
    ...registry,
    activityRegistry: { list: () => [...activityList, activityList[0]] }
  }), /duplicate ID/);

  const firstReward = registry.rewardRegistry.list()[0];
  assert.throws(() => validateAcademyContent({
    ...registry,
    rewardRegistry: {
      list: () => registry.rewardRegistry.list().map((reward) =>
        reward.id === firstReward.id ? { ...reward, sourceId: "chapter-99" } : reward)
    }
  }), /sourceId must match|unknown reward source/);

  const firstActivity = activityList[0];
  assert.throws(() => validateAcademyContent({
    ...registry,
    activityRegistry: {
      list: () => activityList.map((activity) => activity.id === firstActivity.id
        ? { ...activity, skillIds: ["science.not-registered"] }
        : activity)
    }
  }), /unknown skill/);
});

test("content validation reports missing activity, generator, hint, and reward registrations", () => {
  const activityList = registry.activityRegistry.list();
  const hintList = registry.hintRegistry.list();
  const rewardList = registry.rewardRegistry.list();
  const generatorList = registry.questionGeneratorRegistry.list();

  assert.throws(() => validateAcademyContent({
    ...registry,
    activityRegistry: { list: () => activityList.slice(1) }
  }), /unregistered curriculum activity/);

  const activity = activityList[0];
  assert.throws(() => validateAcademyContent({
    ...registry,
    questionGeneratorRegistry: { list: () => generatorList.filter((id) => id !== activity.generatorId) }
  }), /missing question generator/);

  assert.throws(() => validateAcademyContent({
    ...registry,
    hintRegistry: { list: () => hintList.slice(1) }
  }), /missing its Professor Hoot hint/);

  const missingRewardId = registry.chapterCatalog.list()[0].majorRewardIds[0];
  assert.throws(() => validateAcademyContent({
    ...registry,
    rewardRegistry: { list: () => rewardList.filter((reward) => reward.id !== missingRewardId) }
  }), /references missing reward/);
});

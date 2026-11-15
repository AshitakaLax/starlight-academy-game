import fs from "node:fs";

const errors = [];
function fail(msg) { errors.push(msg); }

// Load modules via dynamic import
const { SKILL_IDS } = await import("../src/systems/curriculum/skillRegistry.js");
const { ITEM_CATALOG } = await import("../src/data/items.js");
const { chapter1Definition } = await import("../src/chapters/chapter1.js");
const chapters = await Promise.all(
  Array.from({ length: 10 }, (_, i) => import(`../src/chapters/chapter${i + 1}.js`).then((m) => m.default || m[`chapter${i + 1}Definition`]))
);

// side quests
const { allQuests } = await import("../src/ui/screens/sideQuestScreen.js");

// unique chapter ids
const chapterIds = chapters.map((c) => c.id);
if (new Set(chapterIds).size !== chapterIds.length) fail("Duplicate chapter IDs");
if (chapterIds.length !== 10) fail(`Expected 10 chapters, got ${chapterIds.length}`);

// unique quest ids
const questIds = allQuests.map((q) => q.id);
if (new Set(questIds).size !== questIds.length) fail("Duplicate quest IDs");
if (questIds.length !== 20) fail(`Expected 20 side quests, got ${questIds.length}`);

// reward references
const itemIds = new Set(ITEM_CATALOG.map((i) => i.id));
for (const ch of chapters) {
  if (ch.reward?.type === "item" && ch.reward.itemId && !itemIds.has(ch.reward.itemId)) {
    fail(`Chapter ${ch.id} references unknown item ${ch.reward.itemId}`);
  }
}
for (const q of allQuests) {
  if (q.reward?.type === "item" && q.reward.itemId && !itemIds.has(q.reward.itemId)) {
    fail(`Quest ${q.id} references unknown item ${q.reward.itemId}`);
  }
}

// skill identifiers
const skillSet = new Set(Object.values(SKILL_IDS));
for (const ch of chapters) {
  for (const sid of ch.skillIds || []) {
    if (!skillSet.has(sid)) fail(`Chapter ${ch.id} uses unknown skill ${sid}`);
  }
}
for (const q of allQuests) {
  if (q.skillId && !skillSet.has(q.skillId)) fail(`Quest ${q.id} uses unknown skill ${q.skillId}`);
}

// generator contract check (sample)
const { MultiplicationGenerator } = await import("../src/systems/curriculum/generators/multiplicationGenerator.js");
const g = new MultiplicationGenerator();
const q = g.generate(1, { tier: "Core" });
if (!g.validate(q)) fail("Multiplication generator produced invalid question");
if (new Set(q.choices).size !== q.choices.length) fail("Duplicate answer choices");

if (errors.length) {
  console.error("Content validation failed:");
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("Content validation passed.");

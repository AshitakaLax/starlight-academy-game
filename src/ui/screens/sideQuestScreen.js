import { SideQuestRuntime } from "../../gameplay/sidequests/sideQuestRuntime.js";
import { chapter1Quests } from "../../side-quests/chapter1Quests.js";
import { chapter2Quests } from "../../side-quests/chapter2Quests.js";
import { chapter3Quests } from "../../side-quests/chapter3Quests.js";
import { chapter4Quests } from "../../side-quests/chapter4Quests.js";
import { chapter5Quests } from "../../side-quests/chapter5Quests.js";
import { chapter6Quests } from "../../side-quests/chapter6Quests.js";
import { chapter7Quests } from "../../side-quests/chapter7Quests.js";
import { chapter8Quests } from "../../side-quests/chapter8Quests.js";
import { chapter9Quests } from "../../side-quests/chapter9Quests.js";
import { chapter10Quests } from "../../side-quests/chapter10Quests.js";
import { MultiplicationGenerator } from "../../systems/curriculum/generators/multiplicationGenerator.js";
import { FractionPartsGenerator, EquivalentFractionGenerator } from "../../systems/curriculum/generators/fractionGenerators.js";
import { SpellingGenerator } from "../../systems/curriculum/generators/spellingGenerator.js";
import { GeometryGenerator } from "../../systems/curriculum/generators/geometryGenerator.js";
import { HabitatGenerator } from "../../systems/curriculum/generators/habitatGenerator.js";
import { BotanyGenerator } from "../../systems/curriculum/generators/botanyGenerator.js";
import { GrammarGenerator } from "../../systems/curriculum/generators/grammarGenerator.js";
import { MeasurementGenerator } from "../../systems/curriculum/generators/measurementGenerator.js";
import { MultiStepGenerator } from "../../systems/curriculum/generators/multistepGenerator.js";
import { SKILL_IDS } from "../../systems/curriculum/skillRegistry.js";
import { CurriculumService } from "../../systems/curriculum/curriculumService.js";
import { EconomyService } from "../../systems/economy/economyService.js";

function generatorForSkill(skillId) {
  switch (skillId) {
    case SKILL_IDS.MATH_MULT_FACTS_1_5: return new MultiplicationGenerator();
    case SKILL_IDS.MATH_FRACTIONS_PARTS: return new FractionPartsGenerator();
    case SKILL_IDS.MATH_FRACTIONS_EQUIV: return new EquivalentFractionGenerator();
    case SKILL_IDS.ELA_SPELLING_ROOTS: return new SpellingGenerator();
    case SKILL_IDS.MATH_GEOMETRY_SHAPES: return new GeometryGenerator();
    case SKILL_IDS.SCIENCE_HABITATS: return new HabitatGenerator();
    case SKILL_IDS.SCIENCE_BOTANY_LIFECYCLE: return new BotanyGenerator();
    case SKILL_IDS.ELA_GRAMMAR_POS: return new GrammarGenerator();
    case SKILL_IDS.MATH_MEASUREMENT_VOLUME: return new MeasurementGenerator();
    case SKILL_IDS.MATH_MULTISTEP: return new MultiStepGenerator();
    default: return new MultiplicationGenerator();
  }
}

export const allQuests = [...chapter1Quests, ...chapter2Quests, ...chapter3Quests, ...chapter4Quests, ...chapter5Quests, ...chapter6Quests, ...chapter7Quests, ...chapter8Quests, ...chapter9Quests, ...chapter10Quests];

export const sideQuestScreen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    const eco = new EconomyService(store);
    const sqrt = new (await import("../../gameplay/sidequests/sideQuestRuntime.js")).SideQuestRuntime(store, eco);
    allQuests.forEach((q) => sqrt.register(q));

    const questId = params?.questId || allQuests[0].id;
    const quest = sqrt.start(questId);
    if (!quest.ok) { root.innerHTML = "<div class='screen'>Unknown quest</div>"; return; }
    const qdef = quest.quest;

    const curr = new CurriculumService(store);
    curr.registerSkill(qdef.skillId, { objective: qdef.title });
    curr.registerGenerator(qdef.skillId, generatorForSkill(qdef.skillId));

    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen sidequest";
    root.appendChild(container);
    const show = (html) => { container.innerHTML = html; };

    const skillId = qdef.skillId;
    const tier = curr.getTier(skillId);
    const questions = Array.from({ length: qdef.count }, (_, i) => curr.generate(skillId, qdef.seedBase + i, { tier }, tier));
    let qi = 0;
    show(`<h1>${qdef.title}</h1><p>Optional side quest</p><button id="start">Start</button>`);
    container.querySelector("#start").addEventListener("click", () => runPractice());

    function runPractice() {
      if (qi >= questions.length) { finish(); return; }
      const q = questions[qi];
      show(`<h2>${qdef.title} ${qi+1}/${questions.length}</h2><p>${q.prompt}</p><div class="choices">${q.choices.map(c=>`<button>${c}</button>`).join("")}</div><p id="fb"></p>`);
      const fb = container.querySelector("#fb");
      container.querySelectorAll(".choices button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const correct = btn.textContent === String(q.answer);
          curr.recordAttempt(skillId, { correct, hintUsed: false, demonstrated: false });
          if (correct) { fb.textContent = "Correct!"; qi++; setTimeout(runPractice, 500); }
          else { fb.textContent = "Try again."; }
        });
      });
    }
    function finish() {
      sqrt.complete(qdef.id);
      show(`<h2>Quest Complete!</h2><p>Reward granted.</p><button id="back">Back to hub</button>`);
      container.querySelector("#back").addEventListener("click", () => store.dispatch("screen/change", { screen: "hub" }));
    }
  },
  unmount() {},
};
export default sideQuestScreen;

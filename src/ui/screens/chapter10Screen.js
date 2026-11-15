import { chapter10Definition } from "../../chapters/chapter10.js";
import { MultiplicationGenerator } from "../../systems/curriculum/generators/multiplicationGenerator.js";
import { FractionPartsGenerator } from "../../systems/curriculum/generators/fractionGenerators.js";
import { SpellingGenerator } from "../../systems/curriculum/generators/spellingGenerator.js";
import { GeometryGenerator } from "../../systems/curriculum/generators/geometryGenerator.js";
import { SKILL_IDS } from "../../systems/curriculum/skillRegistry.js";
import { CurriculumService } from "../../systems/curriculum/curriculumService.js";
import { ChapterRuntime } from "../../gameplay/chapters/chapterRuntime.js";
import { EconomyService } from "../../systems/economy/economyService.js";

export const chapter10Screen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    const eco = new EconomyService(store);
    const curr = new CurriculumService(store);
    const gens = [
      { skill: SKILL_IDS.MATH_MULT_FACTS_1_5, gen: new MultiplicationGenerator() },
      { skill: SKILL_IDS.MATH_FRACTIONS_PARTS, gen: new FractionPartsGenerator() },
      { skill: SKILL_IDS.ELA_SPELLING_ROOTS, gen: new SpellingGenerator() },
      { skill: SKILL_IDS.MATH_GEOMETRY_SHAPES, gen: new GeometryGenerator() },
    ];
    gens.forEach(({ skill, gen }) => {
      curr.registerSkill(skill, { objective: "review" });
      curr.registerGenerator(skill, gen);
    });
    const rt = new ChapterRuntime(store, eco);
    rt.register(chapter10Definition);

    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen chapter10";
    root.appendChild(container);
    const show = (html) => { container.innerHTML = html; };

    rt.start("chapter10");
    show(`<h1>${chapter10Definition.title}</h1><p>${chapter10Definition.scenes[0].text}</p><button id="next">Start</button>`);
    container.querySelector("#next").addEventListener("click", () => runPractice());

    const questions = gens.map(({ skill }, i) => {
      const tier = curr.getTier(skill);
      return { skill, q: curr.generate(skill, 1000 + i, { tier }, tier) };
    });
    let qi = 0;
    function runPractice() {
      if (qi >= questions.length) { runReward(); return; }
      const { skill, q } = questions[qi];
      show(`<h2>Event ${qi+1}/${questions.length}</h2><p>${q.prompt}</p><div class="choices">${q.choices.map(c=>`<button>${c}</button>`).join("")}</div><p id="fb"></p>`);
      const fb = container.querySelector("#fb");
      container.querySelectorAll(".choices button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const correct = btn.textContent === String(q.answer);
          curr.recordAttempt(skill, { correct, hintUsed: false, demonstrated: false });
          if (correct) { fb.textContent = "Correct!"; qi++; setTimeout(runPractice, 500); }
          else { fb.textContent = "Try again."; }
        });
      });
    }
    function runReward() {
      rt.complete(chapter10Definition.reward);
      show(`<h2>Reward!</h2><p>${chapter10Definition.scenes[2].text}</p><button id="back">Back to hub</button>`);
      container.querySelector("#back").addEventListener("click", () => store.dispatch("screen/change", { screen: "hub" }));
    }
  },
  unmount() {},
};
export default chapter10Screen;

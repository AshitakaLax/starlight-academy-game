import { chapter2Definition } from "../../chapters/chapter2.js";
import { FractionPartsGenerator, EquivalentFractionGenerator } from "../../systems/curriculum/generators/fractionGenerators.js";
import { SKILL_IDS } from "../../systems/curriculum/skillRegistry.js";
import { CurriculumService } from "../../systems/curriculum/curriculumService.js";
import { ChapterRuntime } from "../../gameplay/chapters/chapterRuntime.js";
import { EconomyService } from "../../systems/economy/economyService.js";

export const chapter2Screen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    const eco = new EconomyService(store);
    const curr = new CurriculumService(store);
    curr.registerSkill(SKILL_IDS.MATH_FRACTIONS_PARTS, { objective: "parts" });
    curr.registerSkill(SKILL_IDS.MATH_FRACTIONS_EQUIV, { objective: "equiv" });
    curr.registerGenerator(SKILL_IDS.MATH_FRACTIONS_PARTS, new FractionPartsGenerator());
    curr.registerGenerator(SKILL_IDS.MATH_FRACTIONS_EQUIV, new EquivalentFractionGenerator());
    const rt = new ChapterRuntime(store, eco);
    rt.register(chapter2Definition);

    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen chapter2";
    root.appendChild(container);
    const show = (html) => { container.innerHTML = html; };

    rt.start("chapter2");
    show(`<h1>${chapter2Definition.title}</h1><p>${chapter2Definition.scenes[0].text}</p><button id="next">Start</button>`);
    container.querySelector("#next").addEventListener("click", () => runSkill(SKILL_IDS.MATH_FRACTIONS_PARTS, 2, () => runSkill(SKILL_IDS.MATH_FRACTIONS_EQUIV, 2, runReward)));

    function runSkill(skillId, count, done) {
      const tier = curr.getTier(skillId);
      const questions = Array.from({ length: count }, (_, i) => curr.generate(skillId, 200 + i, { tier }, tier));
      let qi = 0;
      function next() {
        if (qi >= questions.length) { done(); return; }
        const q = questions[qi];
        show(`<h2>Practice ${qi+1}/${questions.length}</h2><p>${q.prompt}</p><div class="choices">${q.choices.map(c=>`<button>${c}</button>`).join("")}</div><p id="fb"></p>`);
        const fb = container.querySelector("#fb");
        container.querySelectorAll(".choices button").forEach((btn) => {
          btn.addEventListener("click", () => {
            const correct = btn.textContent === q.answer;
            curr.recordAttempt(skillId, { correct, hintUsed: false, demonstrated: false });
            if (correct) { fb.textContent = "Correct!"; qi++; setTimeout(next, 500); }
            else { fb.textContent = "Try again."; }
          });
        });
      }
      next();
    }

    function runReward() {
      rt.complete(chapter2Definition.reward);
      show(`<h2>Reward!</h2><p>${chapter2Definition.scenes[3].text}</p><button id="back">Back to hub</button>`);
      container.querySelector("#back").addEventListener("click", () => store.dispatch("screen/change", { screen: "hub" }));
    }
  },
  unmount() {},
};
export default chapter2Screen;

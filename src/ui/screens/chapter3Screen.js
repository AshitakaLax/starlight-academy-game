import { chapter3Definition } from "../../chapters/chapter3.js";
import { SpellingGenerator } from "../../systems/curriculum/generators/spellingGenerator.js";
import { SKILL_IDS } from "../../systems/curriculum/skillRegistry.js";
import { CurriculumService } from "../../systems/curriculum/curriculumService.js";
import { ChapterRuntime } from "../../gameplay/chapters/chapterRuntime.js";
import { EconomyService } from "../../systems/economy/economyService.js";

export const chapter3Screen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    const eco = new EconomyService(store);
    const curr = new CurriculumService(store);
    curr.registerSkill(SKILL_IDS.ELA_SPELLING_ROOTS, { objective: "spelling" });
    curr.registerGenerator(SKILL_IDS.ELA_SPELLING_ROOTS, new SpellingGenerator());
    const rt = new ChapterRuntime(store, eco);
    rt.register(chapter3Definition);

    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen chapter3";
    root.appendChild(container);
    const show = (html) => { container.innerHTML = html; };

    rt.start("chapter3");
    show(`<h1>${chapter3Definition.title}</h1><p>${chapter3Definition.scenes[0].text}</p><button id="next">Start</button>`);
    container.querySelector("#next").addEventListener("click", () => runPractice());

    const skillId = SKILL_IDS.ELA_SPELLING_ROOTS;
    const tier = curr.getTier(skillId);
    const questions = Array.from({ length: 3 }, (_, i) => curr.generate(skillId, 300 + i, { tier }, tier));
    let qi = 0;
    function runPractice() {
      if (qi >= questions.length) { runReward(); return; }
      const q = questions[qi];
      show(`<h2>Practice ${qi+1}/${questions.length}</h2><p>${q.prompt}</p><div class="choices">${q.choices.map(c=>`<button>${c}</button>`).join("")}</div><p id="fb"></p>`);
      const fb = container.querySelector("#fb");
      container.querySelectorAll(".choices button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const correct = btn.textContent === q.answer;
          curr.recordAttempt(skillId, { correct, hintUsed: false, demonstrated: false });
          if (correct) { fb.textContent = `Correct! ${q.meaning || ""}`; qi++; setTimeout(runPractice, 600); }
          else { fb.textContent = "Try again."; }
        });
      });
    }
    function runReward() {
      rt.complete(chapter3Definition.reward);
      show(`<h2>Reward!</h2><p>${chapter3Definition.scenes[2].text}</p><button id="back">Back to hub</button>`);
      container.querySelector("#back").addEventListener("click", () => store.dispatch("screen/change", { screen: "hub" }));
    }
  },
  unmount() {},
};
export default chapter3Screen;

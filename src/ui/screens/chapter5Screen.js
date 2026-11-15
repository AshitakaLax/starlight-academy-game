import { chapter5Definition } from "../../chapters/chapter5.js";
import { HabitatGenerator } from "../../systems/curriculum/generators/habitatGenerator.js";
import { SKILL_IDS } from "../../systems/curriculum/skillRegistry.js";
import { CurriculumService } from "../../systems/curriculum/curriculumService.js";
import { ChapterRuntime } from "../../gameplay/chapters/chapterRuntime.js";
import { EconomyService } from "../../systems/economy/economyService.js";

export const chapter5Screen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    const eco = new EconomyService(store);
    const curr = new CurriculumService(store);
    curr.registerSkill(SKILL_IDS.SCIENCE_HABITATS, { objective: "habitats" });
    curr.registerGenerator(SKILL_IDS.SCIENCE_HABITATS, new HabitatGenerator());
    const rt = new ChapterRuntime(store, eco);
    rt.register(chapter5Definition);

    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen chapter5";
    root.appendChild(container);
    const show = (html) => { container.innerHTML = html; };

    rt.start("chapter5");
    show(`<h1>${chapter5Definition.title}</h1><p>${chapter5Definition.scenes[0].text}</p><button id="next">Start</button>`);
    container.querySelector("#next").addEventListener("click", () => runPractice());

    const skillId = SKILL_IDS.SCIENCE_HABITATS;
    const tier = curr.getTier(skillId);
    const questions = Array.from({ length: 3 }, (_, i) => curr.generate(skillId, 500 + i, { tier }, tier));
    let qi = 0;
    function runPractice() {
      if (qi >= questions.length) { runReward(); return; }
      const q = questions[qi];
      show(`<h2>Investigation ${qi+1}/${questions.length}</h2><p>${q.prompt}</p><div class="choices">${q.choices.map(c=>`<button>${c}</button>`).join("")}</div><p id="fb"></p>`);
      const fb = container.querySelector("#fb");
      container.querySelectorAll(".choices button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const correct = btn.textContent === q.answer;
          curr.recordAttempt(skillId, { correct, hintUsed: false, demonstrated: false });
          if (correct) { fb.textContent = "Correct!"; qi++; setTimeout(runPractice, 500); }
          else { fb.textContent = "Try again."; }
        });
      });
    }
    function runReward() {
      rt.complete(chapter5Definition.reward);
      show(`<h2>Reward!</h2><p>${chapter5Definition.scenes[2].text}</p><button id="back">Back to hub</button>`);
      container.querySelector("#back").addEventListener("click", () => store.dispatch("screen/change", { screen: "hub" }));
    }
  },
  unmount() {},
};
export default chapter5Screen;

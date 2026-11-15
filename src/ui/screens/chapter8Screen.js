import { chapter8Definition } from "../../chapters/chapter8.js";
import { MeasurementGenerator } from "../../systems/curriculum/generators/measurementGenerator.js";
import { SKILL_IDS } from "../../systems/curriculum/skillRegistry.js";
import { CurriculumService } from "../../systems/curriculum/curriculumService.js";
import { ChapterRuntime } from "../../gameplay/chapters/chapterRuntime.js";
import { EconomyService } from "../../systems/economy/economyService.js";

export const chapter8Screen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    const eco = new EconomyService(store);
    const curr = new CurriculumService(store);
    curr.registerSkill(SKILL_IDS.MATH_MEASUREMENT_VOLUME, { objective: "measurement" });
    curr.registerGenerator(SKILL_IDS.MATH_MEASUREMENT_VOLUME, new MeasurementGenerator());
    const rt = new ChapterRuntime(store, eco);
    rt.register(chapter8Definition);

    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen chapter8";
    root.appendChild(container);
    const show = (html) => { container.innerHTML = html; };

    rt.start("chapter8");
    show(`<h1>${chapter8Definition.title}</h1><p>${chapter8Definition.scenes[0].text}</p><button id="next">Start</button>`);
    container.querySelector("#next").addEventListener("click", () => runPractice());

    const skillId = SKILL_IDS.MATH_MEASUREMENT_VOLUME;
    const tier = curr.getTier(skillId);
    const questions = Array.from({ length: 3 }, (_, i) => curr.generate(skillId, 800 + i, { tier }, tier));
    let qi = 0;
    function runPractice() {
      if (qi >= questions.length) { runReward(); return; }
      const q = questions[qi];
      show(`<h2>Practice ${qi+1}/${questions.length}</h2><p>${q.prompt}</p><div class="choices">${q.choices.map(c=>`<button>${c}</button>`).join("")}</div><p id="fb"></p>`);
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
    function runReward() {
      rt.complete(chapter8Definition.reward);
      show(`<h2>Reward!</h2><p>${chapter8Definition.scenes[2].text}</p><button id="back">Back to hub</button>`);
      container.querySelector("#back").addEventListener("click", () => store.dispatch("screen/change", { screen: "hub" }));
    }
  },
  unmount() {},
};
export default chapter8Screen;

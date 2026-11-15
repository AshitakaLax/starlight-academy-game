import { chapter1Definition } from "../../chapters/chapter1.js";
import { MultiplicationGenerator } from "../../systems/curriculum/generators/multiplicationGenerator.js";
import { SKILL_IDS } from "../../systems/curriculum/skillRegistry.js";
import { CurriculumService } from "../../systems/curriculum/curriculumService.js";
import { ChapterRuntime } from "../../gameplay/chapters/chapterRuntime.js";
import { EconomyService } from "../../systems/economy/economyService.js";
import { GymnasticsEngine } from "../../gameplay/gymnastics/gymnasticsEngine.js";

export const chapter1Screen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    const eco = new EconomyService(store);
    const curr = new CurriculumService(store);
    curr.registerSkill(SKILL_IDS.MATH_MULT_FACTS_1_5, { objective: "mult" });
    curr.registerGenerator(SKILL_IDS.MATH_MULT_FACTS_1_5, new MultiplicationGenerator());
    const rt = new ChapterRuntime(store, eco);
    rt.register(chapter1Definition);

    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen chapter1";
    root.appendChild(container);

    const show = (html) => { container.innerHTML = html; };

    // Start chapter
    rt.start("chapter1");
    show(`<h1>${chapter1Definition.title}</h1><p>${chapter1Definition.scenes[0].text}</p><button id="next">Start practice</button>`);
    container.querySelector("#next").addEventListener("click", () => runPractice());

    const skillId = SKILL_IDS.MATH_MULT_FACTS_1_5;
    const tier = curr.getTier(skillId);
    const questions = [0,1,2].map((i) => curr.generate(skillId, 100 + i, { tier }, tier));

    let qi = 0;
    let correctCount = 0;
    function runPractice() {
      if (qi >= questions.length) { runGymnastics(); return; }
      const q = questions[qi];
      show(`
        <h2>Practice ${qi+1}/${questions.length}</h2>
        <p>${q.prompt}</p>
        <div class="choices">${q.choices.map((c,i)=>`<button data-idx="${i}">${c}</button>`).join("")}</div>
        <p id="feedback"></p>
        <button id="hint">Hint (H)</button>
      `);
      const fb = container.querySelector("#feedback");
      container.querySelectorAll(".choices button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.textContent);
          const correct = val === q.answer;
          curr.recordAttempt(skillId, { correct, hintUsed: false, demonstrated: false });
          if (correct) { correctCount++; fb.textContent = "Correct!"; qi++; setTimeout(runPractice, 600); }
          else { fb.textContent = "Try again."; }
        });
      });
      container.querySelector("#hint").addEventListener("click", () => {
        fb.textContent = q.hints[0].text;
      });
    }

    function runGymnastics() {
      const g = new GymnasticsEngine();
      g.preview("chapter1_ribbon", [{x:0,y:0},{x:100,y:0}], [{atMs:500,position:{x:50,y:0}}]);
      g.start();
      show(`
        <h2>Ribbon Routine</h2>
        <p>Trace the ribbon! (Simplified)</p>
        <button id="finish">Finish routine</button>
      `);
      container.querySelector("#finish").addEventListener("click", () => {
        g.recordTrace({x:0,y:0});
        g.recordTrace({x:100,y:0});
        g.hitCheckpoint(0, 520);
        const res = g.finish();
        store.dispatch("gymnastics/routine/complete", { routineId: "chapter1_ribbon", tracing: res.tracing, rhythm: res.rhythm, combined: res.combined, stars: res.stars });
        const baseGems = 10;
        const gems = (window.__starlightPets ? baseGems : baseGems);
        store.dispatch("economy/gems/add", { amount: baseGems });
        runReward();
      });
    }

    function runReward() {
      rt.complete(chapter1Definition.reward);
      show(`
        <h2>Reward!</h2>
        <p>${chapter1Definition.scenes[3].text}</p>
        <p>Gems +10</p>
        <button id="back">Back to hub</button>
      `);
      container.querySelector("#back").addEventListener("click", () => {
        store.dispatch("screen/change", { screen: "hub" });
      });
    }
  },
  unmount() {},
};
export default chapter1Screen;

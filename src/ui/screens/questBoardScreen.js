import { allQuests } from "./sideQuestScreen.js";

const CHAPTERS = Array.from({ length: 10 }, (_, i) => `chapter${i + 1}`);

export const questBoardScreen = {
  async mount(root, params, scope, store) {
    if (!store) { root.innerHTML = "<div class='screen'>No store</div>"; return; }
    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen questboard";
    root.appendChild(container);

    const progress = store.getState().progress;
    const chaptersHtml = CHAPTERS.map((cid) => {
      const rec = progress.chapters?.[cid];
      const status = rec?.completed ? "Completed" : (rec?.started ? "In progress" : "Not started");
      return `<li>${cid}: ${status}</li>`;
    }).join("");
    const questsHtml = allQuests.map((q) => {
      const rec = progress.quests?.[q.id];
      const status = rec?.completed ? "Completed" : "Not started";
      return `<li>${q.id} (${q.chapterId}): ${status}</li>`;
    }).join("");

    container.innerHTML = `
      <h1>Quest Board</h1>
      <h2>Chapters (${CHAPTERS.length})</h2>
      <ul>${chaptersHtml}</ul>
      <h2>Side Quests (${allQuests.length})</h2>
      <ul>${questsHtml}</ul>
      <button id="back">Back to hub</button>
    `;
    container.querySelector("#back").addEventListener("click", () => store.dispatch("screen/change", { screen: "hub" }));
  },
  unmount() {},
};
export default questBoardScreen;

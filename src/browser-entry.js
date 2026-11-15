import { createGameApp } from "./app/createGameApp.js";
import { gameConfig } from "./config/gameConfig.js";
import { chapterDefinitions } from "./chapters/registry.js";
import { sideQuestDefinitions } from "./side-quests/registry.js";
import academyEmblem from "./assets/academy-emblem.svg";
import releaseManifest from "./data/release-manifest.json";

/** Minimal offline launch shell; full screens and gameplay arrive in later steps. */
async function launch() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app root element.");

  const app = createGameApp();
  await app.start();

  const card = document.createElement("section");
  card.className = "academy-card";

  const emblem = document.createElement("div");
  emblem.className = "academy-emblem";
  // This is a build-time embedded, repository-owned SVG asset, not user input.
  emblem.innerHTML = academyEmblem;

  const title = document.createElement("h1");
  title.textContent = gameConfig.application.title;

  const subtitle = document.createElement("p");
  subtitle.className = "academy-subtitle";
  subtitle.textContent = "A little magic. A lot to discover.";

  const status = document.createElement("p");
  status.className = "academy-status";
  status.textContent = "Your academy is ready for its next chapter.";

  const release = document.createElement("p");
  release.className = "academy-release";
  release.textContent = String(releaseManifest.release.chapterCount)
    + " chapters · " + String(releaseManifest.release.sideQuestCount) + " side quests planned";

  const foundation = document.createElement("p");
  foundation.className = "academy-foundation";
  foundation.textContent = "Content registries: " + chapterDefinitions.length
    + " chapters and " + sideQuestDefinitions.length
    + " side quests currently authored. More gameplay is added in the next implementation steps.";

  card.append(emblem, title, subtitle, status, release, foundation);
  root.replaceChildren(card);
  document.documentElement.dataset.appStatus = app.status;

  window.addEventListener("pagehide", () => {
    void app.stop();
  }, { once: true });
}

launch().catch((error) => {
  console.error("Starlight Academy could not start.", error);
  const root = document.getElementById("app");
  if (root) {
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent = "The academy could not start. Please close this page and try again.";
    root.replaceChildren(message);
  }
});

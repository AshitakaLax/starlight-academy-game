import { createGameApp } from "./app/createGameApp.js";
import { createGameStore } from "./core/state/createGameStore.js";
import { createSaveManager, getBrowserStorage } from "./core/save/createSaveManager.js";
import { createSaveService } from "./core/save/createSaveService.js";
import { gameConfig } from "./config/gameConfig.js";
import { selectCurrentScreen } from "./core/state/selectors.js";
import { chapterDefinitions } from "./chapters/registry.js";
import { sideQuestDefinitions } from "./side-quests/registry.js";
import academyEmblem from "./assets/academy-emblem.svg";
import releaseManifest from "./data/release-manifest.json";

/** Minimal offline launch shell; full screens and gameplay arrive in later steps. */
async function launch() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app root element.");

  const saveHealth = document.createElement("p");
  saveHealth.className = "academy-save-status";
  saveHealth.setAttribute("role", "status");
  saveHealth.setAttribute("aria-live", "polite");
  saveHealth.textContent = "Checking saved progress…";

  const store = createGameStore();
  const screenScope = store.createScope("launch-screen");
  screenScope.subscribeSelector(selectCurrentScreen, (screenId) => {
    root.dataset.screenId = screenId ?? "";
  }, { emitCurrent: true });

  const saveManager = createSaveManager({
    storage: getBrowserStorage(),
    storageKey: gameConfig.persistence.storageKey,
    schemaVersion: gameConfig.persistence.schemaVersion,
    autosaveDelayMs: gameConfig.persistence.autosaveDelayMs,
    maxImportBytes: gameConfig.persistence.maxImportBytes,
    onStatus(status) {
      saveHealth.textContent = status.message;
      saveHealth.dataset.status = status.state;
      root.dataset.saveStatus = status.state;
    }
  });
  const saveService = createSaveService({
    store,
    saveManager,
    onError(error, context) {
      console.error("Starlight Academy save operation failed (" + context + ").", error);
      saveHealth.textContent = "Progress could not be saved. You can keep playing, but export a backup when available.";
      saveHealth.dataset.status = "error";
    }
  });

  const app = createGameApp({ services: [saveService] });
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

  card.append(emblem, title, subtitle, status, release, foundation, saveHealth);
  root.replaceChildren(card);
  document.documentElement.dataset.appStatus = app.status;

  window.addEventListener("pagehide", () => {
    screenScope.dispose();
    store.destroy();
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

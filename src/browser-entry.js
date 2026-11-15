import { createGameApp } from "./app/createGameApp.js";
import { createGameStore } from "./core/state/createGameStore.js";
import { createSaveManager, getBrowserStorage } from "./core/save/createSaveManager.js";
import { createSaveService } from "./core/save/createSaveService.js";
import { createInputRouter } from "./core/input/createInputRouter.js";
import { registerStandardInputContexts } from "./core/input/standardContexts.js";
import { gameConfig } from "./config/gameConfig.js";
import { createAcademyShell } from "./ui/createAcademyShell.js";
import { createAudioEngine } from "./systems/audio/createAudioEngine.js";
import { createAudioService } from "./systems/audio/createAudioService.js";
import { createNarrationService } from "./systems/narration/createNarrationService.js";
import academyEmblem from "./assets/academy-emblem.svg";
import releaseManifest from "./data/release-manifest.json";

async function launch() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app root element.");

  const saveHealth = document.createElement("p");
  saveHealth.className = "academy-save-status";
  saveHealth.setAttribute("role", "status");
  saveHealth.setAttribute("aria-live", "polite");
  saveHealth.textContent = "Checking saved progress…";

  const audioStatus = document.createElement("p");
  audioStatus.className = "audio-status";
  audioStatus.setAttribute("role", "status");
  audioStatus.setAttribute("aria-live", "polite");
  audioStatus.textContent = "Audio begins after your first interaction.";

  const narrationCaption = document.createElement("p");
  narrationCaption.className = "narration-caption";
  narrationCaption.setAttribute("role", "status");
  narrationCaption.setAttribute("aria-live", "polite");
  narrationCaption.hidden = true;

  const narrationStatus = document.createElement("p");
  narrationStatus.className = "narration-status";
  narrationStatus.setAttribute("role", "status");
  narrationStatus.setAttribute("aria-live", "polite");
  narrationStatus.textContent = "Narration is optional and turned off.";

  const store = createGameStore();
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

  const audioEngine = createAudioEngine({
    onStatus(status) {
      audioStatus.textContent = status.message;
      audioStatus.dataset.kind = status.state;
    }
  });
  const audioService = createAudioService({
    engine: audioEngine,
    store,
    gestureTarget: document,
    root,
    onStatus(status) {
      audioStatus.textContent = status.message;
      audioStatus.dataset.kind = status.kind;
    }
  });

  const narrationService = createNarrationService({
    store,
    audioEngine,
    textElement: narrationCaption,
    onStatus(status) {
      narrationStatus.textContent = status.message;
      narrationStatus.dataset.kind = status.kind;
    }
  });

  const inputRouter = createInputRouter({
    store, target: window, documentRef: document, root,
    onError(error, context) {
      console.error("Starlight Academy input was not accepted (" + context + ").", error);
    }
  });
  const unregisterInputContexts = registerStandardInputContexts(inputRouter);
  const inputService = {
    name: "input",
    start() { inputRouter.start(); },
    stop() { inputRouter.stop(); unregisterInputContexts(); }
  };

  const app = createGameApp({ services: [saveService, audioService, narrationService, inputService] });
  await app.start();

  const academyShell = createAcademyShell({
    root, store, saveService, saveStatusElement: saveHealth, audioStatusElement: audioStatus,
    narrationService, narrationStatusElement: narrationStatus, narrationTextElement: narrationCaption,
    emblemSvg: academyEmblem, documentRef: document, windowRef: window
  });
  document.documentElement.dataset.appStatus = app.status;
  root.dataset.plannedChapters = String(releaseManifest.release.chapterCount);
  root.dataset.plannedQuests = String(releaseManifest.release.sideQuestCount);

  window.addEventListener("pagehide", () => {
    academyShell.dispose();
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

import { createGameApp } from "./app/createGameApp.js";
import { createGameStore } from "./core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "./core/state/actions.js";
import { createInitialCurriculumProgress, curriculumActionDefinitions } from "./systems/curriculum/curriculumProgress.js";
import { createInitialEconomyState } from "./systems/economy/economyState.js";
import { createRewardRegistry, createShopCatalog } from "./systems/economy/economyCatalogs.js";
import { createEconomyActionDefinitions } from "./systems/economy/economyActions.js";
import { createEconomyService } from "./systems/economy/createEconomyService.js";
import { createWardrobeCatalog, createWardrobeShopCatalog, defaultWardrobeItems } from "./gameplay/wardrobe/wardrobeCatalog.js";
import { createInitialWardrobeState } from "./gameplay/wardrobe/wardrobeState.js";
import { createWardrobeActionDefinitions } from "./gameplay/wardrobe/wardrobeActions.js";
import { createWardrobeService } from "./gameplay/wardrobe/createWardrobeService.js";
import { createGarmentTemplateRegistry, defaultGarmentTemplates } from "./gameplay/coloring/garmentTemplates.js";
import { createInitialColoringState } from "./gameplay/coloring/coloringState.js";
import { createColoringActionDefinitions } from "./gameplay/coloring/coloringActions.js";
import { createColoringService } from "./gameplay/coloring/createColoringService.js";
import { createPetCatalog, defaultPetDefinitions } from "./gameplay/pets/petCatalog.js";
import { createInitialPetCollectionState } from "./gameplay/pets/petCollectionState.js";
import { createPetActionDefinitions } from "./gameplay/pets/petActions.js";
import { createPetCollectionService } from "./gameplay/pets/createPetCollectionService.js";
import { chapterDefinitions, createChapterCatalog } from "./chapters/registry.js";
import { chapterOneActivityDefinitions, chapterOneHintDefinitions, chapterOneReward } from "./chapters/chapterOne.js";
import { createActivityRegistry } from "./systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "./systems/curriculum/questionGenerators.js";
import { createHintRegistry } from "./systems/hints/createHintRegistry.js";
import { createHintService } from "./systems/hints/createHintService.js";
import { createInitialChapterRuntimeState } from "./gameplay/chapter-runtime/chapterRuntimeState.js";
import { createChapterRuntimeActionDefinitions } from "./gameplay/chapter-runtime/chapterRuntimeActions.js";
import { createChapterRuntimeService } from "./gameplay/chapter-runtime/createChapterRuntimeService.js";
import { createGymnasticsRoutineCatalog, defaultGymnasticsRoutines } from "./gameplay/gymnastics/gymnasticsCatalog.js";
import { createInitialGymnasticsState } from "./gameplay/gymnastics/gymnasticsState.js";
import { createGymnasticsActionDefinitions } from "./gameplay/gymnastics/gymnasticsActions.js";
import { createGymnasticsService } from "./gameplay/gymnastics/createGymnasticsService.js";
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

  const rewardRegistry = createRewardRegistry([chapterOneReward]);
  const activityRegistry = createActivityRegistry(chapterOneActivityDefinitions);
  const questionGeneratorRegistry = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterOneHintDefinitions });
  const wardrobeCatalog = createWardrobeCatalog(defaultWardrobeItems);
  const garmentTemplateRegistry = createGarmentTemplateRegistry(defaultGarmentTemplates);
  const petCatalog = createPetCatalog(defaultPetDefinitions);
  const gymnasticsRoutineCatalog = createGymnasticsRoutineCatalog(defaultGymnasticsRoutines);
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const shopCatalog = createShopCatalog(createWardrobeShopCatalog(wardrobeCatalog));
  const economyActionDefinitions = createEconomyActionDefinitions({ rewardRegistry, shopCatalog });
  const wardrobeActionDefinitions = createWardrobeActionDefinitions({ wardrobeCatalog, economyActionDefinitions });
  const coloringActionDefinitions = createColoringActionDefinitions({ templateRegistry: garmentTemplateRegistry });
  const petActionDefinitions = createPetActionDefinitions({ petCatalog });
  const gymnasticsActionDefinitions = createGymnasticsActionDefinitions({ routineCatalog: gymnasticsRoutineCatalog });
  const chapterRuntimeActionDefinitions = createChapterRuntimeActionDefinitions({ chapterCatalog });
  const initialGameState = {
    ...createInitialGameState(),
    curriculum: createInitialCurriculumProgress(),
    economy: createInitialEconomyState(),
    wardrobe: createInitialWardrobeState(wardrobeCatalog),
    coloring: createInitialColoringState(garmentTemplateRegistry),
    petCollection: createInitialPetCollectionState(petCatalog),
    gymnastics: createInitialGymnasticsState(),
    chapterRuntime: createInitialChapterRuntimeState()
  };
  const store = createGameStore({
    initialState: initialGameState,
    actions: { ...curriculumActionDefinitions, ...economyActionDefinitions, ...wardrobeActionDefinitions, ...coloringActionDefinitions, ...petActionDefinitions, ...gymnasticsActionDefinitions, ...chapterRuntimeActionDefinitions }
  });
  const wardrobeService = createWardrobeService({ store, wardrobeCatalog });
  const coloringService = createColoringService({ store, templateRegistry: garmentTemplateRegistry });
  const petCollectionService = createPetCollectionService({ store, petCatalog });
  const gymnasticsService = createGymnasticsService({ store, routineCatalog: gymnasticsRoutineCatalog });
  const economyService = createEconomyService({ store, rewardRegistry, shopCatalog });
  const chapterRuntimeService = createChapterRuntimeService({
    store, chapterCatalog, rewardRegistry, economyService, wardrobeService
  });
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
    normalizeRestoredState: (restored) => mergeGameStateDefaults(initialGameState, restored),
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
  const hintService = createHintService({
    activityRegistry, hintRegistry, questionGeneratorRegistry, narrationService
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
    activityRegistry, questionGeneratorRegistry, hintService, wardrobeService, coloringService, garmentTemplateRegistry, petCollectionService, petCatalog, gymnasticsService, chapterRuntimeService, audioService,
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

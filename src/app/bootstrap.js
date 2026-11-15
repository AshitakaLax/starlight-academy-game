/**
 * Application bootstrap. Wires core services together and starts the router.
 * Gameplay modules must use services via this container rather than reaching
 * into unrelated systems directly.
 */
import { Store } from "../core/state/store.js";
import { createDefaultState } from "../core/save/schema.js";
import { SaveManager } from "../core/save/saveManager.js";
import { InputManager } from "../core/input/inputManager.js";
import Router from "../app/router.js";
import Lifecycle from "../app/lifecycle.js";

export class AppContext {
  constructor() {
    this.store = null;
    this.saveManager = null;
    this.input = null;
    this.router = null;
    this.lifecycle = null;
  }
}

export async function bootstrap(rootSelector = "#app") {
  const ctx = new AppContext();
  const root = document.querySelector(rootSelector);
  if (!root) throw new Error("Root element not found");
  root.classList.add("app-root");
  const stage = document.createElement("div");
  stage.id = "stage";
  stage.className = "stage";
  root.appendChild(stage);

  ctx.store = new Store(createDefaultState());
  ctx.saveManager = new SaveManager(ctx.store);
  // register core actions before any dispatch
  const { registerCoreActions } = await import("../core/state/registerActions.js");
  registerCoreActions(ctx.store);
  const loaded = ctx.saveManager.load();
  if (loaded) {
    ctx.store.dispatch("save/loaded", loaded);
  }
  ctx.saveManager.store = ctx.store;

  ctx.input = new InputManager();
  ctx.input.attach();

  const { default: AudioEngine } = await import("../systems/audio/audioEngine.js");
  ctx.audio = new AudioEngine();
  if (typeof window !== "undefined") window.__starlightAudio = ctx.audio;
  ctx.audio.hookUserGesture();

  const { default: NarrationEngine } = await import("../systems/narration/narrationEngine.js");
  ctx.narration = new NarrationEngine(ctx.audio);
  if (typeof window !== "undefined") window.__starlightNarration = ctx.narration;

  ctx.router = new Router(stage, ctx.store);
  const { default: hubScreen } = await import("../ui/screens/hubScreen.js");
  const { default: settingsScreen } = await import("../ui/screens/settingsScreen.js");
  const { placeholderScreen } = await import("../ui/screens/placeholderScreen.js");
  ctx.router.register("hub", hubScreen);
  ctx.router.register("settings", settingsScreen);
  ctx.router.register("chapters", placeholderScreen("Chapters"));
  const { default: chapter1Screen } = await import("../ui/screens/chapter1Screen.js");
  const { default: chapter2Screen } = await import("../ui/screens/chapter2Screen.js");
  const { default: chapter3Screen } = await import("../ui/screens/chapter3Screen.js");
  const { default: chapter4Screen } = await import("../ui/screens/chapter4Screen.js");
  const { default: chapter5Screen } = await import("../ui/screens/chapter5Screen.js");
  const { default: chapter6Screen } = await import("../ui/screens/chapter6Screen.js");
  const { default: chapter7Screen } = await import("../ui/screens/chapter7Screen.js");
  const { default: chapter8Screen } = await import("../ui/screens/chapter8Screen.js");
  const { default: chapter9Screen } = await import("../ui/screens/chapter9Screen.js");
  const { default: chapter10Screen } = await import("../ui/screens/chapter10Screen.js");
  const { default: sideQuestScreen } = await import("../ui/screens/sideQuestScreen.js");
  const { default: questBoardScreen } = await import("../ui/screens/questBoardScreen.js");
  ctx.router.register("chapter1", chapter1Screen);
  ctx.router.register("chapter2", chapter2Screen);
  ctx.router.register("chapter3", chapter3Screen);
  ctx.router.register("chapter4", chapter4Screen);
  ctx.router.register("chapter5", chapter5Screen);
  ctx.router.register("chapter6", chapter6Screen);
  ctx.router.register("chapter7", chapter7Screen);
  ctx.router.register("chapter8", chapter8Screen);
  ctx.router.register("chapter9", chapter9Screen);
  ctx.router.register("chapter10", chapter10Screen);
  ctx.router.register("sidequest", sideQuestScreen);
  ctx.router.register("questboard", questBoardScreen);
  ctx.router.register("wardrobe", placeholderScreen("Wardrobe"));
  ctx.router.register("pets", placeholderScreen("Pets"));
  ctx.router.register("shop", placeholderScreen("Shop"));
  ctx.lifecycle = new Lifecycle({
    onBoot: async () => {
      const { applySettings } = await import("../ui/shell.js");
      applySettings(ctx.store.getState().settings, ctx.audio);
      await ctx.router.go("hub");
    },
    onPause: () => {
      ctx.saveManager.flush();
    },
    onResume: () => {},
  });

  // autosave on state changes (debounced)
  ctx.store.subscribe((state, name) => {
    ctx.saveManager.checkpoint(state);
    if (name === "settings/update" || name === "save/loaded") {
      import("../ui/shell.js").then(({ applySettings }) => applySettings(state.settings));
    }
  });

  window.addEventListener("pagehide", () => ctx.saveManager.flush());
  window.addEventListener("beforeunload", () => ctx.saveManager.flush());

  await ctx.lifecycle.boot();
  return ctx;
}

export default bootstrap;

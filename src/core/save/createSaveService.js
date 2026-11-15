/**
 * Lifecycle adapter connecting the versioned save manager to the central state store.
 * Loading happens before subscriptions begin, so restoring a save does not trigger
 * an immediate redundant autosave.
 */
export function createSaveService({
  store,
  saveManager,
  onError = () => {}
} = {}) {
  if (!store || typeof store.getState !== "function"
      || typeof store.dispatch !== "function"
      || typeof store.subscribe !== "function") {
    throw new TypeError("createSaveService requires a compatible game store.");
  }
  if (!saveManager || typeof saveManager.load !== "function"
      || typeof saveManager.schedule !== "function"
      || typeof saveManager.flush !== "function"
      || typeof saveManager.checkpoint !== "function"
      || typeof saveManager.export !== "function"
      || typeof saveManager.previewImport !== "function"
      || typeof saveManager.import !== "function") {
    throw new TypeError("createSaveService requires a compatible save manager.");
  }
  if (typeof onError !== "function") throw new TypeError("onError must be a function.");

  let started = false;
  let unsubscribe = null;

  function reportError(error, context) {
    try {
      onError(error, context);
    } catch {
      // Application diagnostics cannot be allowed to interrupt the save lifecycle.
    }
  }

  async function start() {
    if (started) return;

    try {
      const restoredState = await saveManager.load();
      if (restoredState) {
        store.dispatch({
          type: "app/state-restored",
          payload: { state: restoredState }
        });
      }
    } catch (error) {
      reportError(error, "load");
    }

    unsubscribe = store.subscribe((state, action) => {
      if (action.type === "app/state-restored") return;
      try {
        saveManager.schedule(state);
      } catch (error) {
        reportError(error, "autosave-schedule");
      }
    });
    started = true;
  }

  async function stop() {
    if (!started) return;
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
    started = false;
    try {
      await saveManager.flush();
    } catch (error) {
      reportError(error, "autosave-flush");
    }
  }

  function assertStarted() {
    if (!started) throw new Error("The save service must be started before use.");
  }

  function saveCheckpoint() {
    assertStarted();
    try {
      return saveManager.checkpoint(store.getState());
    } catch (error) {
      reportError(error, "checkpoint");
      throw error;
    }
  }

  function exportSave() {
    assertStarted();
    return saveManager.export(store.getState());
  }

  function previewImport(serialized) {
    assertStarted();
    return saveManager.previewImport(serialized);
  }

  function importSave(serialized, options) {
    assertStarted();
    const importedState = saveManager.import(serialized, options);
    store.dispatch({
      type: "app/state-restored",
      payload: { state: importedState }
    });
    return store.getState();
  }

  return Object.freeze({
    name: "save",
    start,
    stop,
    saveCheckpoint,
    export: exportSave,
    previewImport,
    import: importSave,
    get started() { return started; },
    getStatus() { return saveManager.getStatus?.() ?? null; }
  });
}

import { cloneSerializable, isPlainObject } from "../state/stateUtils.js";

export const SAVE_FORMAT = "starlight-academy-save";

export class SaveDataError extends Error {
  constructor(code, message, options = {}) {
    super(message, options);
    this.name = "SaveDataError";
    this.code = code;
  }
}

function defaultValidateState(state) {
  if (!isPlainObject(state)) return "The save state must be a plain object.";
  if (!isPlainObject(state.app)
      || typeof state.app.screenId !== "string"
      || !state.app.screenId.trim()) {
    return 'The save is missing a valid "app.screenId".';
  }
  if (!isPlainObject(state.ui)
      || !(state.ui.activeOverlayId === null
        || (typeof state.ui.activeOverlayId === "string" && state.ui.activeOverlayId.trim()))) {
    return 'The save is missing a valid "ui.activeOverlayId".';
  }
  return true;
}

function makeError(code, message, cause) {
  return new SaveDataError(code, message, cause === undefined ? {} : { cause });
}

/**
 * Versioned local save storage with validation, migration, recovery diagnostics,
 * debounced autosave and explicit confirmation before replacing existing data.
 *
 * Storage, clock and timer functions are injectable for deterministic tests.
 */
export function createSaveManager({
  storage = getBrowserStorage(),
  storageKey = "starlight-academy.save",
  schemaVersion = 1,
  migrations = {},
  validateState = defaultValidateState,
  autosaveDelayMs = 700,
  maxImportBytes = 10 * 1024 * 1024,
  now = () => new Date(),
  setTimer = globalThis.setTimeout?.bind(globalThis),
  clearTimer = globalThis.clearTimeout?.bind(globalThis),
  onStatus = () => {}
} = {}) {
  if (typeof storageKey !== "string" || !storageKey.trim()) {
    throw new TypeError("createSaveManager: storageKey must be a non-empty string.");
  }
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new TypeError("createSaveManager: schemaVersion must be a positive integer.");
  }
  if (!Number.isInteger(autosaveDelayMs) || autosaveDelayMs < 0) {
    throw new TypeError("createSaveManager: autosaveDelayMs must be a non-negative integer.");
  }
  if (!Number.isInteger(maxImportBytes) || maxImportBytes < 1) {
    throw new TypeError("createSaveManager: maxImportBytes must be a positive integer.");
  }
  if (typeof validateState !== "function" || typeof now !== "function" || typeof onStatus !== "function") {
    throw new TypeError("createSaveManager: validateState, now and onStatus must be functions.");
  }
  if (typeof setTimer !== "function" || typeof clearTimer !== "function") {
    throw new TypeError("createSaveManager: timer functions must be available.");
  }
  if (storage !== null && (!storage
      || typeof storage.getItem !== "function"
      || typeof storage.setItem !== "function")) {
    throw new TypeError("createSaveManager: storage must provide getItem() and setItem(), or be null.");
  }

  const migrationMap = new Map();
  for (const [versionText, migrate] of Object.entries(migrations)) {
    const version = Number(versionText);
    if (!Number.isInteger(version) || version < 1 || version >= schemaVersion || typeof migrate !== "function") {
      throw new TypeError("Migrations must map a supported schema version to a function.");
    }
    migrationMap.set(version, migrate);
  }

  let status = Object.freeze({ state: "idle", message: "Save system ready.", savedAt: null, code: null });
  let lastKnownState = null;
  let pendingState = null;
  let timerId = null;

  function updateStatus(nextStatus, message, code = null, savedAt = null) {
    status = Object.freeze({ state: nextStatus, message, savedAt, code });
    try {
      onStatus(status);
    } catch {
      // Status presentation must never break persistence.
    }
    return status;
  }

  function requireStorage(operation) {
    if (!storage) {
      throw makeError("STORAGE_UNAVAILABLE", "Local storage is unavailable; progress cannot be saved on this device.");
    }
    return storage;
  }

  function validateAndCloneState(input, label = "Save state") {
    let clone;
    try {
      clone = cloneSerializable(input, "$state");
    } catch (error) {
      throw makeError("INVALID_STATE", label + " contains data that cannot be saved.", error);
    }
    let result;
    try {
      result = validateState(clone);
    } catch (error) {
      throw makeError("INVALID_STATE", label + " failed validation.", error);
    }
    if (result !== true) {
      throw makeError("INVALID_STATE", typeof result === "string" ? result : label + " failed validation.");
    }
    return clone;
  }

  function createEnvelope(inputState) {
    const state = validateAndCloneState(inputState);
    const timestamp = now();
    if (!(timestamp instanceof Date) || !Number.isFinite(timestamp.getTime())) {
      throw makeError("CLOCK_ERROR", "The save timestamp could not be created.");
    }
    return {
      format: SAVE_FORMAT,
      schemaVersion,
      savedAt: timestamp.toISOString(),
      state
    };
  }

  function parseEnvelope(serialized) {
    if (typeof serialized !== "string" || serialized.length === 0) {
      throw makeError("INVALID_FILE", "The selected save file is empty or is not text.");
    }
    if (new TextEncoder().encode(serialized).byteLength > maxImportBytes) {
      throw makeError("FILE_TOO_LARGE", "This save file is too large to import.");
    }

    let parsed;
    try {
      parsed = JSON.parse(serialized);
    } catch (error) {
      throw makeError("INVALID_JSON", "The selected save file is not valid JSON.", error);
    }

    if (!isPlainObject(parsed)
        || parsed.format !== SAVE_FORMAT
        || !Number.isInteger(parsed.schemaVersion)
        || parsed.schemaVersion < 1
        || typeof parsed.savedAt !== "string"
        || !Number.isFinite(Date.parse(parsed.savedAt))
        || !Object.hasOwn(parsed, "state")
        || Object.keys(parsed).some((key) => !["format", "schemaVersion", "savedAt", "state"].includes(key))) {
      throw makeError("INVALID_ENVELOPE", "The selected file is not a recognized Starlight Academy save.");
    }
    if (parsed.schemaVersion > schemaVersion) {
      throw makeError("UNSUPPORTED_VERSION", "This save was created by a newer version of Starlight Academy.");
    }

    let version = parsed.schemaVersion;
    let state;
    try {
      state = cloneSerializable(parsed.state, "$importedState");
    } catch (error) {
      throw makeError("INVALID_STATE", "Imported save contains data that cannot be migrated safely.", error);
    }
    if (!isPlainObject(state)) {
      throw makeError("INVALID_STATE", "Imported save state must be a plain object.");
    }
    let migrated = false;
    while (version < schemaVersion) {
      const migrate = migrationMap.get(version);
      if (!migrate) {
        throw makeError("MIGRATION_UNAVAILABLE", "This save needs an update that is not available in this version.");
      }
      try {
        state = cloneSerializable(migrate(state), "$migratedState");
        if (!isPlainObject(state)) throw new TypeError("A migration must return a plain object.");
      } catch (error) {
        throw makeError("MIGRATION_FAILED", "The selected save could not be safely upgraded.", error);
      }
      version += 1;
      migrated = true;
    }
    state = validateAndCloneState(state, "Migrated save");

    return {
      state,
      sourceVersion: parsed.schemaVersion,
      schemaVersion: version,
      savedAt: parsed.savedAt,
      migrated
    };
  }

  function writeState(inputState) {
    let targetStorage;
    try {
      targetStorage = requireStorage("save");
    } catch (error) {
      updateStatus("unavailable", error.message, error.code ?? "STORAGE_UNAVAILABLE");
      throw error;
    }
    const envelope = createEnvelope(inputState);
    const serialized = JSON.stringify(envelope);
    try {
      targetStorage.setItem(storageKey, serialized);
    } catch (error) {
      updateStatus("error", "Progress could not be saved. Check available browser storage space.", "STORAGE_WRITE_FAILED");
      throw makeError("STORAGE_WRITE_FAILED", "Progress could not be saved. Your current in-memory progress is unchanged.", error);
    }
    lastKnownState = validateAndCloneState(envelope.state);
    updateStatus("saved", "Progress saved on this device.", null, envelope.savedAt);
    return Object.freeze({ savedAt: envelope.savedAt, schemaVersion });
  }

  function cancelAutosave() {
    if (timerId !== null) {
      clearTimer(timerId);
      timerId = null;
    }
    pendingState = null;
  }

  function schedule(inputState) {
    const nextState = validateAndCloneState(inputState);
    pendingState = nextState;
    if (timerId !== null) clearTimer(timerId);
    updateStatus("pending", "Saving progress…");
    timerId = setTimer(() => {
      timerId = null;
      const snapshot = pendingState;
      pendingState = null;
      if (!snapshot) return;
      try {
        writeState(snapshot);
      } catch {
        // The error status is retained for the UI. Do not create an unhandled timer rejection.
      }
    }, autosaveDelayMs);
    return true;
  }

  function save(inputState) {
    cancelAutosave();
    return writeState(inputState);
  }

  function checkpoint(inputState) {
    return save(inputState);
  }

  function flush() {
    if (!pendingState) return null;
    const snapshot = pendingState;
    cancelAutosave();
    return writeState(snapshot);
  }

  function load() {
    const targetStorage = storage;
    if (!targetStorage) {
      updateStatus("unavailable", "Local storage is unavailable. Progress will remain only for this session.", "STORAGE_UNAVAILABLE");
      return null;
    }

    let serialized;
    try {
      serialized = targetStorage.getItem(storageKey);
    } catch (error) {
      updateStatus("unavailable", "Saved progress could not be read from browser storage.", "STORAGE_READ_FAILED");
      return null;
    }

    if (serialized === null) {
      lastKnownState = null;
      updateStatus("empty", "No saved progress was found on this device.");
      return null;
    }

    try {
      const parsed = parseEnvelope(serialized);
      lastKnownState = validateAndCloneState(parsed.state);
      if (parsed.migrated) {
        try {
          writeState(lastKnownState);
          updateStatus("migrated", "Saved progress was safely upgraded to the current format.");
        } catch {
          updateStatus("migration-save-failed", "Saved progress was upgraded for this session, but the updated copy could not be written.");
        }
      } else {
        updateStatus("loaded", "Saved progress was loaded.", null, parsed.savedAt);
      }
      return validateAndCloneState(lastKnownState);
    } catch (error) {
      const code = error instanceof SaveDataError ? error.code : "SAVE_RECOVERY_REQUIRED";
      updateStatus("recovery-required", "Saved progress could not be read safely. The original data was left untouched.", code);
      return null;
    }
  }

  function exportSave(inputState = lastKnownState) {
    if (inputState === null || inputState === undefined) {
      throw makeError("NO_SAVE_TO_EXPORT", "There is no saved progress to export yet.");
    }
    return JSON.stringify(createEnvelope(inputState), null, 2);
  }

  function previewImport(serialized) {
    try {
      const preview = parseEnvelope(serialized);
      let hasExistingSave = false;
      if (storage) {
        try {
          hasExistingSave = storage.getItem(storageKey) !== null;
        } catch (error) {
          throw makeError("STORAGE_READ_FAILED", "The current save could not be checked before import.", error);
        }
      }
      updateStatus("import-preview", preview.migrated
        ? "Import is valid and will be upgraded before saving."
        : "Import is valid and ready for review.");
      return Object.freeze({
        state: validateAndCloneState(preview.state),
        sourceVersion: preview.sourceVersion,
        schemaVersion: preview.schemaVersion,
        migrated: preview.migrated,
        hasExistingSave,
        replacesExistingSave: hasExistingSave
      });
    } catch (error) {
      const code = error instanceof SaveDataError ? error.code : "IMPORT_VALIDATION_FAILED";
      updateStatus("import-error", error.message || "The selected save could not be imported.", code);
      throw error;
    }
  }

  function importSave(serialized, { confirmReplace = false } = {}) {
    const preview = previewImport(serialized);
    if (preview.hasExistingSave && confirmReplace !== true) {
      const error = makeError("IMPORT_CONFIRMATION_REQUIRED", "Review the imported progress and confirm replacement before overwriting the current save.");
      updateStatus("confirmation-required", error.message, error.code);
      throw error;
    }

    cancelAutosave();
    const receipt = writeState(preview.state);
    updateStatus("imported", "Imported progress was saved on this device.", null, receipt.savedAt);
    return validateAndCloneState(preview.state);
  }

  function getStatus() {
    return status;
  }

  return Object.freeze({
    save,
    checkpoint,
    schedule,
    flush,
    cancelAutosave,
    load,
    export: exportSave,
    previewImport,
    import: importSave,
    getStatus,
    getLastKnownState() {
      return lastKnownState === null ? null : validateAndCloneState(lastKnownState);
    }
  });
}

export function getBrowserStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

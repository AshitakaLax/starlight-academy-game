/**
 * Save manager: versioned persistence, autosave checkpoints, JSON export/import,
 * validation, migration, and recovery/error messaging.
 */
import { createDefaultState, SCHEMA_VERSION } from "./schema.js";
import { validateSave } from "./validation.js";
import { migrateSave } from "./migration.js";
import { globalBus } from "../state/events.js";

const STORAGE_KEY = "starlight_academy_save_v1";
const BACKUP_KEY = "starlight_academy_save_v1_backup";

export class SaveManager {
  constructor(store, storage = null) {
    this.store = store;
    this.storage = storage || (typeof window !== "undefined" ? window.localStorage : null);
    this.lastError = null;
    this._debounceTimer = null;
    this._pendingState = null;
  }

  _emitError(msg) {
    this.lastError = msg;
    try { globalBus.emit("save:error", { message: msg }); } catch (e) {}
  }

  _clearError() {
    this.lastError = null;
    try { globalBus.emit("save:ok", {}); } catch (e) {}
  }

  /** Load save from storage; tries backup on corruption. Returns state. */
  load() {
    const tryKey = (key) => {
      if (!this.storage) return null;
      const raw = this.storage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const v = validateSave(parsed);
      if (!v.ok) throw new Error(v.errors.join("; "));
      return migrateSave(parsed);
    };
    try {
      try {
        const data = tryKey(STORAGE_KEY);
        if (data) return data;
      } catch (err) {
        try {
          const backup = tryKey(BACKUP_KEY);
          if (backup) {
            this._emitError(`Primary save corrupted, restored from backup: ${err.message}`);
            return backup;
          }
        } catch (e) {}
        this._emitError(`Corrupted save: ${err.message}`);
      }
      return createDefaultState();
    } catch (err) {
      this._emitError(`Failed to load save: ${err.message}`);
      return createDefaultState();
    }
  }

  /** Persist state immediately. Returns { ok, error? }. */
  save(state) {
    const v = validateSave(state);
    if (!v.ok) {
      const msg = `Invalid save data: ${v.errors.join("; ")}`;
      this._emitError(msg);
      return { ok: false, error: msg };
    }
    const storage = this.storage;
    if (!storage) {
      const msg = "Storage unavailable";
      this._emitError(msg);
      return { ok: false, error: msg };
    }
    try {
      const current = storage.getItem(STORAGE_KEY);
      if (current) {
        try { storage.setItem(BACKUP_KEY, current); } catch (e) {}
      }
      const payload = { ...state, updatedAt: Date.now(), schemaVersion: SCHEMA_VERSION };
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this._clearError();
      return { ok: true };
    } catch (err) {
      const msg = err && err.name === "QuotaExceededError"
        ? `Storage quota exceeded: ${err.message}`
        : `Save failed: ${err.message}`;
      this._emitError(msg);
      return { ok: false, error: msg };
    }
  }

  /** Autosave checkpoint: debounced. */
  checkpoint(state) {
    this._pendingState = state;
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      const s = this._pendingState;
      this._pendingState = null;
      this._debounceTimer = null;
      if (s) this.save(s);
    }, 300);
    return { ok: true, deferred: true };
  }

  /** Force any pending checkpoint to write now. */
  flush() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    if (this._pendingState) {
      const s = this._pendingState;
      this._pendingState = null;
      return this.save(s);
    }
    return { ok: true };
  }

  /** Export current state as a downloadable object URL. */
  export(state) {
    const payload = { ...state, exportedAt: Date.now(), schemaVersion: SCHEMA_VERSION };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    return URL.createObjectURL(blob);
  }

  /** Validate and preview an import without applying. */
  previewImport(jsonText) {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      return { ok: false, errors: [`Invalid JSON: ${err.message}`] };
    }
    const v = validateSave(parsed);
    if (!v.ok) return { ok: false, errors: v.errors };
    try {
      const migrated = migrateSave(parsed);
      return { ok: true, data: migrated, message: "Import preview valid." };
    } catch (err) {
      return { ok: false, errors: [err.message] };
    }
  }

  /** Apply a previously previewed import, protecting current save. */
  applyImport(store, data) {
    const v = validateSave(data);
    if (!v.ok) {
      const msg = v.errors.join("; ");
      this._emitError(msg);
      return { ok: false, error: msg };
    }
    let migrated;
    try {
      migrated = migrateSave(data);
    } catch (err) {
      this._emitError(err.message);
      return { ok: false, error: err.message };
    }
    try {
      const current = store.getState();
      const backupPayload = { ...current, updatedAt: Date.now(), schemaVersion: SCHEMA_VERSION };
      if (this.storage) this.storage.setItem(BACKUP_KEY, JSON.stringify(backupPayload));
    } catch (e) {}
    store.dispatch("save/loaded", migrated);
    const res = this.save(migrated);
    if (!res.ok) return res;
    return { ok: true, message: "Import applied." };
  }

  getLastError() {
    return this.lastError;
  }

  getHealth() {
    if (this.lastError) return { ok: false, message: this.lastError };
    return { ok: true, message: "Save healthy" };
  }
}
export default SaveManager;

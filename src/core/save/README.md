# Save system

STEP-04 implements versioned persistence and safe backup/restore.

## Save manager

\`createSaveManager({ storage, storageKey, schemaVersion, migrations, validateState, autosaveDelayMs, maxImportBytes, onStatus })\` accepts an injected storage adapter. Browser localStorage is resolved defensively by \`getBrowserStorage()\`; blocked or unavailable storage is reported instead of crashing the game.

- \`load()\` validates the save envelope, state and schema version. Corrupt or unsupported data is left untouched and returns \`null\` with a \`recovery-required\` status.
- \`save(state)\` writes immediately. \`checkpoint(state)\` also writes immediately and cancels any pending debounce.
- \`schedule(state)\` debounces frequent changes. \`flush()\` commits the latest pending state; \`cancelAutosave()\` discards it.
- \`export(state)\` returns a portable, pretty-printed JSON envelope.
- \`previewImport(json)\` parses, validates, migrates, and reports whether an existing save would be replaced. It does not write.
- \`import(json, { confirmReplace: true })\` writes only after validation. When a local save already exists, explicit replacement confirmation is required. Failed imports leave the existing save unchanged.

Save envelopes include a format identifier, schema version, timestamp, and serializable game state. Migrations are registered by their source version; migration 1 upgrades version 1 to version 2, and so on. Migrations run before current-schema validation. Missing migrations, future versions, malformed data and oversized files are rejected.

## Save service

\`createSaveService({ store, saveManager, onError })\` is an application lifecycle service. It loads before subscribing to changes, restores through the validated \`app/state-restored\` action, autosaves subsequent store transitions, and flushes on shutdown. Explicit checkpoints, exports and confirmed imports use the current store state.

The manager is independent of DOM presentation. Its \`onStatus\` callback reports saved, pending, loaded, migrated, unavailable, error and recovery-required states. The application shell displays a simple save-health message; the full settings and recovery panel are part of the UI work in STEP-06.

The save manager accepts only JSON-compatible state. Blob/canvas texture persistence will use a separate size-aware representation when the coloring system is implemented.

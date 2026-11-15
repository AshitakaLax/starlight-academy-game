/** Shared interfaces for the Starlight Academy source project. */

export interface ApplicationService {
  /** Stable diagnostic name, unique within one application instance. */
  readonly name: string;
  /** Start and acquire this service's resources. A rejected start must clean up its own partial work. */
  start(): void | Promise<void>;
  /** Release resources acquired by start(). Safe to call after a successful start only. */
  stop(): void | Promise<void>;
}

export interface GameAction<TPayload = unknown> {
  /** Stable, namespaced action name, such as pet/feed. */
  readonly type: string;
  /** Serializable action data, validated at the receiving boundary. */
  readonly payload?: TPayload;
}

export interface StateActionDefinition<TState extends object = Record<string, unknown>, TPayload = unknown> {
  /** Return true for valid input, otherwise return a short validation message. */
  validate(payload: TPayload | undefined): true | string;
  /** Pure reducer: return the next state without mutating the supplied snapshot. */
  reduce(state: Readonly<TState>, payload: TPayload | undefined, action: Readonly<GameAction<TPayload>>): TState;
}

export interface StateSubscriptionScope<TState extends object = Record<string, unknown>> {
  readonly id: string;
  readonly screenId: string | null;
  readonly active: boolean;
  subscribe(listener: (state: Readonly<TState>, action: GameAction, version: number) => void): () => void;
  subscribeSelector<TSelected>(
    selector: (state: Readonly<TState>) => TSelected,
    listener: (value: TSelected, previous: TSelected | undefined, action: GameAction | null, version: number) => void,
    options?: { equalityFn?: (left: TSelected, right: TSelected) => boolean; emitCurrent?: boolean }
  ): () => void;
  dispose(): void;
}

export interface StateStore<TState extends object = Record<string, unknown>> {
  /** Return a deeply immutable state snapshot. */
  getState(): Readonly<TState>;
  getVersion(): number;
  /** Validate and dispatch a named action. */
  dispatch(action: GameAction): Readonly<{ accepted: true; changed?: boolean; queued?: boolean; version: number; type: string }>;
  subscribe(listener: (state: Readonly<TState>, action: GameAction, version: number) => void): () => void;
  subscribeSelector<TSelected>(
    selector: (state: Readonly<TState>) => TSelected,
    listener: (value: TSelected, previous: TSelected | undefined, action: GameAction | null, version: number) => void,
    options?: { equalityFn?: (left: TSelected, right: TSelected) => boolean; emitCurrent?: boolean }
  ): () => void;
  /** A screen-bound scope is disposed automatically after navigation leaves its screen. */
  createScope(scopeId: string, options?: { screenId?: string | null }): StateSubscriptionScope<TState>;
  destroy(): void;
}

export interface InputRouter {
  start(): void;
  stop(): void;
  /** Register bindings for one active screen/context. */
  registerContext(contextId: string, bindings: Record<string, string>): void;
}

export interface SaveStatus {
  readonly state: "idle" | "empty" | "pending" | "saved" | "loaded" | "migrated"
    | "migration-save-failed" | "unavailable" | "error" | "recovery-required"
    | "import-preview" | "imported";
  readonly message: string;
  readonly savedAt: string | null;
  readonly code: string | null;
}

export interface SaveImportPreview<TState extends object> {
  readonly state: Readonly<TState>;
  readonly sourceVersion: number;
  readonly schemaVersion: number;
  readonly migrated: boolean;
  readonly hasExistingSave: boolean;
  readonly replacesExistingSave: boolean;
}

export interface SaveManager<TState extends object = Record<string, unknown>> {
  save(state: Readonly<TState>): { savedAt: string; schemaVersion: number };
  checkpoint(state: Readonly<TState>): { savedAt: string; schemaVersion: number };
  schedule(state: Readonly<TState>): boolean;
  flush(): { savedAt: string; schemaVersion: number } | null;
  cancelAutosave(): void;
  load(): TState | null | Promise<TState | null>;
  export(state?: Readonly<TState>): string;
  previewImport(serialized: string): SaveImportPreview<TState>;
  /** Existing local progress requires explicit replacement confirmation. */
  import(serialized: string, options?: { confirmReplace?: boolean }): TState;
  getStatus(): SaveStatus;
}

export interface SaveService<TState extends object = Record<string, unknown>> extends ApplicationService {
  saveCheckpoint(): { savedAt: string; schemaVersion: number };
  export(): string;
  previewImport(serialized: string): SaveImportPreview<TState>;
  import(serialized: string, options?: { confirmReplace?: boolean }): Readonly<TState>;
}

export interface GameplaySystem {
  readonly id: string;
  initialize(context: Readonly<Record<string, unknown>>): void | Promise<void>;
  handleAction(action: GameAction, context: Readonly<Record<string, unknown>>): void | Promise<void>;
}

export interface ChapterDefinition {
  readonly id: string;
  readonly title: string;
  readonly skillIds: readonly string[];
  readonly activities: readonly Readonly<Record<string, unknown>>[];
  readonly majorRewardIds: readonly string[];
}

export interface SideQuestDefinition {
  readonly id: string;
  readonly chapterId: string;
  readonly title: string;
  readonly skillIds: readonly string[];
  readonly activities: readonly Readonly<Record<string, unknown>>[];
  readonly rewardIds: readonly string[];
}

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
  /** Stable, namespaced action name, such as \`pet/feed\`. */
  readonly type: string;
  /** Serializable action data, validated at the receiving boundary. */
  readonly payload?: TPayload;
}

export interface StateStore<TState extends object = Record<string, unknown>> {
  /** Return a read-only state snapshot. */
  getState(): Readonly<TState>;
  /** Validate and dispatch a named action. */
  dispatch(action: GameAction): unknown;
  /** Subscribe to committed state changes; return an unsubscribe function. */
  subscribe(listener: (state: Readonly<TState>, action: GameAction) => void): () => void;
}

export interface InputRouter {
  start(): void;
  stop(): void;
  /** Register bindings for one active screen/context. */
  registerContext(contextId: string, bindings: Record<string, string>): void;
}

export interface SaveManager<TState extends object = Record<string, unknown>> {
  save(state: Readonly<TState>): void | Promise<void>;
  load(): TState | null | Promise<TState | null>;
  export(): string | Promise<string>;
  /** Validate and migrate before replacing the active save. */
  import(serialized: string): TState | Promise<TState>;
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

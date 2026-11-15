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

export interface InputBinding {
  readonly type: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly preventDefault?: boolean;
}

export interface InputContextBindings {
  /** Defaults to contextId. Use null for an application-wide context. */
  readonly screenId?: string | null;
  /** When provided, this context is active only while this overlay is open (or closed when null). */
  readonly overlayId?: string | null;
  readonly priority?: number;
  readonly enabledWhen?: (state: Readonly<Record<string, unknown>>) => boolean;
  readonly keys?: Readonly<Record<string, string | InputBinding>>;
}

export interface InputRouter {
  start(): void;
  stop(): void;
  /** Register named action bindings for one active screen/context and return an unregister function. */
  registerContext(contextId: string, bindings: InputContextBindings): () => void;
}

export interface SaveStatus {
  readonly state: "idle" | "empty" | "pending" | "saved" | "loaded" | "migrated"
    | "migration-save-failed" | "unavailable" | "error" | "recovery-required"
    | "import-preview" | "import-error" | "confirmation-required" | "imported";
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


export type DifficultyTierId = "foundation" | "core" | "stretch";

export interface SkillDefinition {
  readonly id: string;
  readonly subject: "mathematics" | "language-arts" | "science";
  readonly title: string;
  readonly objective: string;
  readonly supportedTiers: readonly DifficultyTierId[];
}

export type ActivityAnswerRules =
  | { readonly type: "numeric"; readonly tolerance?: number }
  | { readonly type: "exact" | "choice"; readonly caseSensitive?: boolean }
  | { readonly type: "sequence"; readonly itemType?: "numeric" | "exact"; readonly tolerance?: number; readonly caseSensitive?: boolean };

export interface ActivityDefinition {
  readonly id: string;
  readonly title: string;
  readonly skillIds: readonly string[];
  readonly objectives: readonly string[];
  readonly supportedTiers: readonly DifficultyTierId[];
  readonly answerRules: ActivityAnswerRules;
  readonly generatorId: string;
  readonly generatorConstraints: Readonly<Record<DifficultyTierId, Readonly<Record<string, unknown>>>>;
}

export interface LearningEvidence {
  readonly sequence: number;
  readonly skillId: string;
  readonly activityId: string;
  readonly tier: DifficultyTierId;
  readonly correct: boolean;
  readonly hintLevel: 0 | 1 | 2 | 3;
  readonly attempts: number;
}

export interface SkillMasteryProgress {
  readonly totalResponses: number;
  readonly totalAttempts: number;
  readonly correctResponses: number;
  readonly unassistedCorrect: number;
  readonly hintedResponses: number;
  readonly masteryStatus: "not-started" | "in-progress" | "demonstrated";
  readonly recentEvidence: readonly LearningEvidence[];
}

export interface GeneratedQuestion {
  readonly id: string;
  readonly activityId: string;
  readonly tier: DifficultyTierId;
  readonly skillIds: readonly string[];
  readonly objectives: readonly string[];
  readonly seed: string;
  readonly prompt: string;
  readonly correctAnswer: unknown;
  readonly answerRules: ActivityAnswerRules;
  readonly choices?: readonly unknown[];
  readonly stimulus?: Readonly<Record<string, unknown>>;
}


export interface CurriculumOnboardingProfile {
  readonly mode: "guided-discovery";
  readonly placementTestRequired: false;
  readonly initialTier: DifficultyTierId;
  readonly startingGuidance: string;
}

export interface AdaptiveTierDecision {
  readonly currentTier: DifficultyTierId;
  readonly nextTier: DifficultyTierId;
  readonly changed: boolean;
  readonly direction: "maintain" | "increase" | "decrease";
  readonly reason: string;
  readonly evidenceCount: number;
  readonly correctResponses: number;
  readonly independentCorrect: number;
  readonly windowSize: number;
}

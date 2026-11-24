import { createProfessorHootDemonstration } from "./hintDefinitions.js";

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

function requireQuestionId(questionId) {
  if (typeof questionId !== "string" || questionId.trim().length === 0) {
    throw new TypeError("A questionId must be a non-empty string.");
  }
}

function sameItems(left, right) {
  return Array.isArray(left) && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

/**
 * Coordinates activity-specific assistance without owning answer evaluation or
 * progression. Hints may explain, retry, or generate a parallel question, but
 * completion is always permitted.
 */
export function createHintService({
  activityRegistry,
  hintRegistry,
  questionGeneratorRegistry,
  narrationService = null,
  onHint = () => {}
} = {}) {
  if (!activityRegistry || typeof activityRegistry.get !== "function") {
    throw new TypeError("createHintService requires an activity registry.");
  }
  if (!hintRegistry || typeof hintRegistry.get !== "function") {
    throw new TypeError("createHintService requires a hint registry.");
  }
  if (!questionGeneratorRegistry || typeof questionGeneratorRegistry.generate !== "function") {
    throw new TypeError("createHintService requires a question generator registry for parallel questions.");
  }
  if (narrationService !== null && typeof narrationService.speak !== "function") {
    throw new TypeError("narrationService must expose speak() when supplied.");
  }
  if (typeof onHint !== "function") throw new TypeError("onHint must be a function.");

  const sessions = new Map();

  function validateQuestion(question) {
    if (!isPlainObject(question)
        || typeof question.id !== "string" || question.id.trim().length === 0
        || typeof question.activityId !== "string"
        || typeof question.prompt !== "string" || !question.prompt.trim()
        || !(typeof question.seed === "string" || (typeof question.seed === "number" && Number.isFinite(question.seed)))) {
      throw new TypeError("A hint session requires a generated question with id, activityId, prompt, and seed.");
    }
    const activity = activityRegistry.get(question.activityId);
    if (!activity) throw new Error("Question references an unknown activity: " + question.activityId);
    if (!activity.supportedTiers.includes(question.tier)) {
      throw new RangeError("Question tier is not supported by activity " + activity.id + ".");
    }
    if (!sameItems(question.skillIds, activity.skillIds)) {
      throw new TypeError("Question skillIds must match the activity skillIds.");
    }
    return activity;
  }

  function getOrCreateSession(question) {
    validateQuestion(question);
    const existing = sessions.get(question.id);
    if (existing) {
      if (existing.question.activityId !== question.activityId || existing.question.seed !== question.seed) {
        throw new Error("A questionId cannot be reused for different question content.");
      }
      return existing;
    }
    const session = {
      question,
      incorrectAttempts: 0,
      hintRequests: 0,
      parallelCount: 0,
      lastHintStage: 0,
      lastHintKind: null,
      completed: false
    };
    sessions.set(question.id, session);
    return session;
  }

  function snapshot(session) {
    return freezeRecursively({
      questionId: session.question.id,
      activityId: session.question.activityId,
      incorrectAttempts: session.incorrectAttempts,
      hintRequests: session.hintRequests,
      parallelCount: session.parallelCount,
      lastHintStage: session.lastHintStage,
      lastHintKind: session.lastHintKind,
      completed: session.completed,
      canComplete: true
    });
  }

  function presentHint(session, requestedAttempt) {
    const definition = hintRegistry.get(session.question.activityId);
    if (!definition) {
      return freezeRecursively({
        available: false,
        reason: "activity-hints-not-registered",
        ...snapshot(session)
      });
    }

    let stageIndex = -1;
    for (let index = 0; index < definition.stages.length; index += 1) {
      if (definition.stages[index].attempt <= requestedAttempt) stageIndex = index;
    }
    if (stageIndex < 0) {
      return freezeRecursively({
        available: false,
        reason: "no-stage-available-yet",
        ...snapshot(session)
      });
    }

    const stage = definition.stages[stageIndex];
    const stageNumber = stageIndex + 1;
    const demonstration = stage.demonstration
      ? createProfessorHootDemonstration(stage.demonstration)
      : null;
    const narrationText = stage.narrationText ?? demonstration?.narrationText ?? stage.message;
    const presentation = freezeRecursively({
      available: true,
      questionId: session.question.id,
      activityId: session.question.activityId,
      title: definition.title,
      attemptNumber: requestedAttempt,
      stage: stageNumber,
      attemptThreshold: stage.attempt,
      kind: stage.kind,
      message: stage.message,
      narrationText,
      visibleTextEquivalent: demonstration?.textEquivalent ?? stage.message,
      demonstration,
      canRetry: true,
      canSolveParallelQuestion: true,
      canComplete: true
    });

    session.lastHintStage = stageNumber;
    session.lastHintKind = stage.kind;
    try { narrationService?.speak(narrationText, { interrupt: true }); } catch {}
    try { onHint(presentation); } catch {}
    return presentation;
  }

  function recordIncorrect(question) {
    const session = getOrCreateSession(question);
    if (session.completed) {
      return freezeRecursively({
        available: false,
        reason: "question-already-completed",
        ...snapshot(session)
      });
    }
    session.incorrectAttempts += 1;
    session.hintRequests += 1;
    return presentHint(session, session.incorrectAttempts);
  }

  /** A player may ask for a hint before submitting; this never counts as an incorrect answer. */
  function requestHint(question) {
    const session = getOrCreateSession(question);
    if (session.completed) {
      return freezeRecursively({
        available: false,
        reason: "question-already-completed",
        ...snapshot(session)
      });
    }
    session.hintRequests += 1;
    return presentHint(session, Math.max(1, session.incorrectAttempts));
  }

  function retry(questionId) {
    requireQuestionId(questionId);
    const session = sessions.get(questionId);
    if (!session) throw new Error("Cannot retry an unknown hint session: " + questionId);
    if (session.completed) throw new Error("A completed question cannot be retried.");
    return freezeRecursively({
      kind: "retry",
      question: session.question,
      incorrectAttempts: session.incorrectAttempts,
      canComplete: true
    });
  }

  function solveParallel(questionId) {
    requireQuestionId(questionId);
    const session = sessions.get(questionId);
    if (!session) throw new Error("Cannot create a parallel question for an unknown hint session: " + questionId);
    if (session.completed) throw new Error("A completed question cannot be replaced with a parallel question.");
    const activity = activityRegistry.get(session.question.activityId);
    session.parallelCount += 1;
    const seed = String(session.question.seed) + ":parallel:" + session.parallelCount;
    const question = questionGeneratorRegistry.generate(activity, {
      seed,
      tier: session.question.tier
    });
    getOrCreateSession(question);
    return freezeRecursively({
      kind: "parallel",
      originalQuestionId: questionId,
      parallelIndex: session.parallelCount,
      question,
      canComplete: true
    });
  }

  function chooseNextStep(questionId, choice) {
    if (choice === "retry") return retry(questionId);
    if (choice === "parallel") return solveParallel(questionId);
    throw new TypeError('Next step must be "retry" or "parallel".');
  }

  /** Completion is an unconditional signal; no hint count or stage is required. */
  function complete(questionId) {
    requireQuestionId(questionId);
    const session = sessions.get(questionId);
    if (session) session.completed = true;
    return freezeRecursively({
      questionId,
      completed: true,
      canComplete: true,
      incorrectAttempts: session?.incorrectAttempts ?? 0,
      lastHintStage: session?.lastHintStage ?? 0
    });
  }

  function getSession(questionId) {
    requireQuestionId(questionId);
    const session = sessions.get(questionId);
    return session ? snapshot(session) : freezeRecursively({
      questionId,
      activityId: null,
      incorrectAttempts: 0,
      hintRequests: 0,
      parallelCount: 0,
      lastHintStage: 0,
      lastHintKind: null,
      completed: false,
      canComplete: true
    });
  }

  return Object.freeze({
    recordIncorrect,
    requestHint,
    retry,
    solveParallel,
    chooseNextStep,
    complete,
    getSession,
    listSessions() {
      return [...sessions.keys()].sort();
    }
  });
}

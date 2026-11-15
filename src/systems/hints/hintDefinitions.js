import { cloneSerializable } from "../../core/state/stateUtils.js";

const ACTIVITY_ID_PATTERN = /^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/;
const HINT_KINDS = Object.freeze(["nudge", "strategy", "demonstration"]);
const VISUAL_KINDS = Object.freeze(["equation", "array", "number-line", "sequence", "place-value", "diagram"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function nonEmptyText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

function validateDemonstration(input) {
  if (!isPlainObject(input) || !hasOnlyKeys(input, ["title", "introduction", "steps", "summary"])) {
    return "A Professor Hoot demonstration must contain only title, introduction, steps, and summary.";
  }
  if (!nonEmptyText(input.title) || !nonEmptyText(input.introduction) || !nonEmptyText(input.summary)) {
    return "A Professor Hoot demonstration needs a title, introduction, and summary.";
  }
  if (!Array.isArray(input.steps) || input.steps.length < 2 || input.steps.length > 6) {
    return "A Professor Hoot demonstration must contain 2 to 6 steps.";
  }
  for (const step of input.steps) {
    if (!isPlainObject(step) || !hasOnlyKeys(step, ["label", "explanation", "visual"])
        || !nonEmptyText(step.label) || !nonEmptyText(step.explanation)) {
      return "Each demonstration step needs a label and explanation.";
    }
    const visual = step.visual;
    if (!isPlainObject(visual) || !hasOnlyKeys(visual, ["kind", "content", "ariaLabel"])
        || !VISUAL_KINDS.includes(visual.kind) || !nonEmptyText(visual.content)
        || (visual.ariaLabel !== undefined && !nonEmptyText(visual.ariaLabel))) {
      return "Each demonstration step needs a supported, accessible visual descriptor.";
    }
  }
  return true;
}

/** Validate activity-specific, three-stage assistance content before it enters a registry. */
export function validateHintDefinition(input) {
  if (!isPlainObject(input) || !hasOnlyKeys(input, ["activityId", "title", "skillIds", "stages"])) {
    return "A hint definition must contain only activityId, title, skillIds, and stages.";
  }
  if (typeof input.activityId !== "string" || !ACTIVITY_ID_PATTERN.test(input.activityId)) {
    return "Hint activityId must be a stable namespaced activity identifier.";
  }
  if (!nonEmptyText(input.title)) return "Hint title must be non-empty.";
  if (!Array.isArray(input.skillIds) || input.skillIds.length === 0
      || input.skillIds.some((id) => typeof id !== "string" || !/^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/.test(id))
      || new Set(input.skillIds).size !== input.skillIds.length) {
    return "Hint skillIds must contain unique, stable skill identifiers.";
  }
  if (!Array.isArray(input.stages) || input.stages.length !== 3) {
    return "Hint definitions must configure exactly three assistance stages.";
  }

  let previousAttempt = 0;
  for (let index = 0; index < input.stages.length; index += 1) {
    const stage = input.stages[index];
    const expectedKind = HINT_KINDS[index];
    if (!isPlainObject(stage) || !hasOnlyKeys(stage, ["attempt", "kind", "message", "narrationText", "demonstration"])) {
      return "Each hint stage contains an unsupported property or is not a plain object.";
    }
    if (!Number.isSafeInteger(stage.attempt) || stage.attempt <= previousAttempt) {
      return "Hint stage attempt thresholds must be increasing positive integers.";
    }
    if (index === 0 && stage.attempt !== 1) {
      return "The first hint stage must be available on the first attempt.";
    }
    previousAttempt = stage.attempt;
    if (stage.kind !== expectedKind || !nonEmptyText(stage.message)) {
      return "Hint stages must be ordered as nudge, strategy, and demonstration, each with a message.";
    }
    if (stage.narrationText !== undefined && !nonEmptyText(stage.narrationText)) {
      return "Optional narrationText must be non-empty when supplied.";
    }
    if (index < 2 && stage.demonstration !== undefined) {
      return "Only the third hint stage may contain a worked demonstration.";
    }
    if (index === 2) {
      const result = validateDemonstration(stage.demonstration);
      if (result !== true) return result;
    }
  }

  try {
    cloneSerializable(input, "hint definition");
  } catch {
    return "Hint definitions must contain only finite, JSON-compatible data.";
  }
  return true;
}

/** Construct a deeply immutable hint definition; stage thresholds are content-configurable. */
export function createHintDefinition(input) {
  const validation = validateHintDefinition(input);
  if (validation !== true) throw new TypeError(validation);
  const copy = cloneSerializable(input, "hint definition");
  return freezeRecursively({
    activityId: copy.activityId,
    title: copy.title.trim(),
    skillIds: copy.skillIds.slice(),
    stages: copy.stages.map((stage) => ({
      ...stage,
      message: stage.message.trim(),
      ...(stage.narrationText ? { narrationText: stage.narrationText.trim() } : {}),
      ...(stage.demonstration ? {
        demonstration: {
          ...stage.demonstration,
          title: stage.demonstration.title.trim(),
          introduction: stage.demonstration.introduction.trim(),
          summary: stage.demonstration.summary.trim(),
          steps: stage.demonstration.steps.map((step) => ({
            label: step.label.trim(),
            explanation: step.explanation.trim(),
            visual: {
              ...step.visual,
              content: step.visual.content.trim(),
              ...(step.visual.ariaLabel ? { ariaLabel: step.visual.ariaLabel.trim() } : {})
            }
          }))
        }
      } : {})
    }))
  });
}

/**
 * Create a renderer-friendly, accessible Professor Hoot presentation model.
 * The visual descriptors and complete text equivalent travel together so no
 * learning instruction is available only through imagery or speech.
 */
export function createProfessorHootDemonstration(demonstration) {
  const validation = validateDemonstration(demonstration);
  if (validation !== true) throw new TypeError(validation);
  const steps = demonstration.steps.map((step, index) => ({
    number: index + 1,
    label: step.label,
    explanation: step.explanation,
    visual: {
      kind: step.visual.kind,
      content: step.visual.content,
      ariaLabel: step.visual.ariaLabel ?? step.visual.content
    }
  }));
  const narrationText = [
    demonstration.introduction,
    ...steps.map((step) => "Step " + step.number + ". " + step.label + ". " + step.explanation),
    demonstration.summary
  ].join(" ");
  const textEquivalent = [
    "Professor Hoot: " + demonstration.title,
    demonstration.introduction,
    ...steps.map((step) => step.number + ". " + step.label + ": " + step.explanation + " Visual: " + step.visual.ariaLabel),
    demonstration.summary
  ].join("\n");
  return freezeRecursively({
    component: "professor-hoot-demonstration",
    character: "professor-hoot",
    title: demonstration.title,
    introduction: demonstration.introduction,
    steps,
    summary: demonstration.summary,
    narrationText,
    textEquivalent,
    ariaLabel: "Professor Hoot demonstration: " + demonstration.title
  });
}

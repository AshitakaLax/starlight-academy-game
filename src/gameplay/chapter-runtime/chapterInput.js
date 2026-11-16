function isTextEntryTarget(target) {
  if (!target) return false;
  const tagName = String(target.tagName ?? "").toLowerCase();
  if (["input", "textarea", "select"].includes(tagName) || target.isContentEditable === true) return true;
  return typeof target.closest === "function"
    && Boolean(target.closest("[contenteditable=''], [contenteditable='true'], [role='textbox']"));
}

/**
 * Chapter-panel shortcuts are scoped to an active question. They never replace
 * native button activation and never intercept text entry or modified key chords.
 */
export function createChapterInputController({
  getCurrentActivity,
  getCurrentQuestion,
  onAnswer,
  onHint
} = {}) {
  if (typeof getCurrentActivity !== "function" || typeof getCurrentQuestion !== "function"
      || typeof onAnswer !== "function" || typeof onHint !== "function") {
    throw new TypeError("createChapterInputController requires activity, question, answer, and hint callbacks.");
  }

  function handleKeydown(event) {
    if (!event || event.defaultPrevented || event.repeat || event.isComposing
        || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey
        || isTextEntryTarget(event.target)) {
      return false;
    }

    const activity = getCurrentActivity();
    if (!activity || !["learning", "challenge"].includes(activity.type)) return false;
    const question = getCurrentQuestion();
    if (!question || !Array.isArray(question.choices)) return false;

    if (/^[1-4]$/.test(event.key)) {
      const choiceIndex = Number(event.key) - 1;
      if (choiceIndex >= question.choices.length) return false;
      event.preventDefault?.();
      onAnswer(question.choices[choiceIndex]);
      return true;
    }

    if (String(event.key).toLowerCase() === "h") {
      event.preventDefault?.();
      onHint(question);
      return true;
    }
    return false;
  }

  return Object.freeze({ handleKeydown });
}

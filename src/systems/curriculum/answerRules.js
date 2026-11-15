function normalizeText(value, caseSensitive) {
  const normalized = String(value).normalize("NFKC").trim().replace(/\s+/g, " ");
  return caseSensitive ? normalized : normalized.toLocaleLowerCase("en-US");
}

/** Compare a response using an activity's declared answer contract. */
export function checkActivityAnswer(answer, correctAnswer, rules = {}) {
  if (!rules || typeof rules !== "object") throw new TypeError("Answer rules must be an object.");
  switch (rules.type) {
    case "numeric": {
      const candidate = typeof answer === "number" ? answer
        : (typeof answer === "string" && answer.trim() ? Number(answer) : Number.NaN);
      if (!Number.isFinite(candidate) || !Number.isFinite(correctAnswer)) return false;
      const tolerance = Number.isFinite(rules.tolerance) ? Math.max(0, rules.tolerance) : 0;
      return Math.abs(candidate - correctAnswer) <= tolerance;
    }
    case "exact":
    case "choice":
      if (typeof answer === "number" && typeof correctAnswer === "number") return Object.is(answer, correctAnswer);
      return normalizeText(answer, rules.caseSensitive === true)
        === normalizeText(correctAnswer, rules.caseSensitive === true);
    case "sequence": {
      if (!Array.isArray(answer) || !Array.isArray(correctAnswer) || answer.length !== correctAnswer.length) return false;
      const itemRules = rules.itemType === "numeric"
        ? { type: "numeric", tolerance: rules.tolerance ?? 0 }
        : { type: "exact", caseSensitive: rules.caseSensitive === true };
      return answer.every((item, index) => checkActivityAnswer(item, correctAnswer[index], itemRules));
    }
    default:
      throw new TypeError("Unsupported answer rule type: " + String(rules.type));
  }
}

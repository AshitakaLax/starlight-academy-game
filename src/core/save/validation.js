/**
 * Validation helpers for save data. Malformed imports must not overwrite saves.
 */

export function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateSave(data) {
  const errors = [];
  if (!isPlainObject(data)) {
    return { ok: false, errors: ["Save must be a JSON object"] };
  }
  if (typeof data.schemaVersion !== "number") {
    errors.push("Missing or invalid schemaVersion");
  }
  if (!isPlainObject(data.app)) errors.push("Missing app state");
  if (!isPlainObject(data.settings)) errors.push("Missing settings");
  if (!isPlainObject(data.economy)) errors.push("Missing economy");
  if (typeof data.economy?.gems !== "number" || data.economy.gems < 0) errors.push("Invalid gems balance");
  if (typeof data.economy?.sparkles !== "number" || data.economy.sparkles < 0) errors.push("Invalid sparkles balance");
  if (!isPlainObject(data.progress)) errors.push("Missing progress");
  if (!isPlainObject(data.pets)) errors.push("Missing pets state");
  if (!isPlainObject(data.wardrobe)) errors.push("Missing wardrobe state");
  return { ok: errors.length === 0, errors };
}
export default { isPlainObject, validateSave };

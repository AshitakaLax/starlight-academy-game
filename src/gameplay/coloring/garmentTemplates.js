export const COLORING_TEXTURE_WIDTH = 64;
export const COLORING_TEXTURE_HEIGHT = 80;
export const COLORING_PIXEL_COUNT = COLORING_TEXTURE_WIDTH * COLORING_TEXTURE_HEIGHT;

const TEMPLATE_ID_PATTERN = /^garment\.[a-z][a-z0-9-]*$/;

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

function validatePoints(points) {
  if (!Array.isArray(points) || points.length < 6 || points.length > 40) return false;
  return points.every((point) => Array.isArray(point) && point.length === 2
    && Number.isFinite(point[0]) && point[0] >= 0 && point[0] <= COLORING_TEXTURE_WIDTH
    && Number.isFinite(point[1]) && point[1] >= 0 && point[1] <= COLORING_TEXTURE_HEIGHT);
}

export function validateGarmentTemplate(input) {
  if (!isPlainObject(input) || Object.keys(input).some((key) =>
    !["id", "title", "description", "points", "accentLines", "baseColor"].includes(key))) {
    return "A garment template must contain only id, title, description, points, accentLines, and baseColor.";
  }
  if (typeof input.id !== "string" || !TEMPLATE_ID_PATTERN.test(input.id)) return "Garment template ID must use the garment namespace.";
  if (typeof input.title !== "string" || !input.title.trim()) return "Garment template title must be non-empty.";
  if (typeof input.description !== "string" || !input.description.trim()) return "Garment template description must be non-empty.";
  if (!validatePoints(input.points)) return "Garment template points must be a polygon with 6 to 40 in-bounds points.";
  if (input.baseColor !== undefined && (typeof input.baseColor !== "string" || !/^#[0-9a-fA-F]{6}$/.test(input.baseColor))) {
    return "Garment template baseColor must be a six-digit hex color.";
  }
  if (input.accentLines !== undefined) {
    if (!Array.isArray(input.accentLines) || input.accentLines.length > 12
        || input.accentLines.some((line) => !validatePoints(line) || line.length < 2)) {
      return "Garment accentLines must be arrays of in-bounds points.";
    }
  }
  return true;
}

export function createGarmentTemplate(input) {
  const validation = validateGarmentTemplate(input);
  if (validation !== true) throw new TypeError(validation);
  return freezeRecursively({
    id: input.id,
    title: input.title.trim(),
    description: input.description.trim(),
    points: input.points.map((point) => [point[0], point[1]]),
    accentLines: (input.accentLines ?? []).map((line) => line.map((point) => [point[0], point[1]])),
    baseColor: input.baseColor ?? "#f4eef9"
  });
}

/** Polygon containment test used for clipping and every drawing tool. */
export function isPointInGarmentMask(x, y, points) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Array.isArray(points)) return false;
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const crosses = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (crosses) inside = !inside;
  }
  return inside;
}

export function createGarmentMask(template) {
  const mask = new Uint8Array(COLORING_PIXEL_COUNT);
  for (let y = 0; y < COLORING_TEXTURE_HEIGHT; y += 1) {
    for (let x = 0; x < COLORING_TEXTURE_WIDTH; x += 1) {
      if (isPointInGarmentMask(x + 0.5, y + 0.5, template.points)) {
        mask[y * COLORING_TEXTURE_WIDTH + x] = 1;
      }
    }
  }
  return mask;
}

export function createGarmentTemplateRegistry(initialTemplates = []) {
  if (!Array.isArray(initialTemplates)) throw new TypeError("Garment templates must be an array.");
  const templates = new Map();
  function register(input) {
    const template = createGarmentTemplate(input);
    if (templates.has(template.id)) throw new Error("Garment template already registered: " + template.id);
    templates.set(template.id, template);
    return template;
  }
  for (const template of initialTemplates) register(template);
  return Object.freeze({
    register,
    get(id) { return templates.get(id) ?? null; },
    has(id) { return templates.has(id); },
    list() { return [...templates.values()].sort((a, b) => a.title.localeCompare(b.title)); }
  });
}

export const defaultGarmentTemplates = Object.freeze([
  Object.freeze({
    id: "garment.academy-tunic",
    title: "Academy Tunic",
    description: "A classic academy silhouette with flutter sleeves.",
    baseColor: "#f2eafb",
    points: Object.freeze([[22,7],[42,7],[46,16],[57,22],[63,34],[54,42],[49,36],[47,72],[17,72],[15,36],[10,42],[1,34],[7,22],[18,16]]),
    accentLines: Object.freeze([Object.freeze([[22,7],[32,17],[42,7]]),Object.freeze([[17,72],[47,72]])])
  }),
  Object.freeze({
    id: "garment.comet-dress",
    title: "Comet Dance Dress",
    description: "A twirling skirt with a fitted waist and soft sleeves.",
    baseColor: "#f6e9f5",
    points: Object.freeze([[23,6],[41,6],[45,15],[56,19],[63,31],[54,39],[49,33],[46,41],[60,77],[56,80],[8,80],[4,77],[18,41],[15,33],[10,39],[1,31],[8,19],[19,15]]),
    accentLines: Object.freeze([Object.freeze([[23,6],[32,16],[41,6]]),Object.freeze([[18,41],[46,41]]),Object.freeze([[10,67],[54,67]])])
  }),
  Object.freeze({
    id: "garment.starlight-cape",
    title: "Starlight Cape",
    description: "A sweeping cape ready for a little magical color.",
    baseColor: "#eaf0fb",
    points: Object.freeze([[23,5],[41,5],[46,14],[56,19],[62,31],[57,43],[52,38],[48,80],[16,80],[12,38],[7,43],[2,31],[8,19],[18,14]]),
    accentLines: Object.freeze([Object.freeze([[23,5],[32,15],[41,5]]),Object.freeze([[16,80],[32,68],[48,80]])])
  })
]);

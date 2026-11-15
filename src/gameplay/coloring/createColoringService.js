import {
  COLORING_MAX_PALETTE_COLORS,
  decodeColorTexture,
  encodeColorTexture
} from "./textureCodec.js";
import {
  COLORING_TEXTURE_HEIGHT,
  COLORING_TEXTURE_WIDTH,
  createGarmentMask
} from "./garmentTemplates.js";
import { selectColoring, selectGarmentDesign } from "./coloringState.js";

const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const HISTORY_LIMIT = 24;
const STAMPS = Object.freeze({
  star: Object.freeze(["...#...", "..###..", ".#####.", "#######", ".#####.", "..###..", "...#..."]),
  heart: Object.freeze([".##.##.", "#######", "#######", ".#####.", "..###..", "...#...", "......."]),
  flower: Object.freeze(["...#...", "..###..", ".#####.", "###.###", ".#####.", "..###..", "...#..."])
});

function cloneDesign(design) {
  return { pixels: new Uint8Array(design.pixels), palette: design.palette.slice() };
}

function designsEqual(left, right) {
  if (left.palette.length !== right.palette.length || left.pixels.length !== right.pixels.length) return false;
  if (!left.palette.every((color, index) => color === right.palette[index])) return false;
  for (let index = 0; index < left.pixels.length; index += 1) {
    if (left.pixels[index] !== right.pixels[index]) return false;
  }
  return true;
}

/** Coordinates and bounded history for clipped brush, eraser, stamp, undo, and redo tools. */
export function createColoringService({ store, templateRegistry, historyLimit = HISTORY_LIMIT } = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.dispatch !== "function") {
    throw new TypeError("createColoringService requires a compatible game store.");
  }
  if (typeof store.subscribe !== "function") throw new TypeError("Coloring store must support subscriptions.");
  if (!templateRegistry || typeof templateRegistry.get !== "function"
      || typeof templateRegistry.has !== "function" || typeof templateRegistry.list !== "function") {
    throw new TypeError("createColoringService requires a garment template registry.");
  }
  if (!Number.isInteger(historyLimit) || historyLimit < 1 || historyLimit > 100) {
    throw new RangeError("Coloring historyLimit must be an integer from 1 to 100.");
  }

  let currentTemplateId = null;
  let currentTemplate = null;
  let mask = null;
  let currentDesign = null;
  let selectedColor = "#b78bd2";
  let selectedTool = "brush";
  let brushSize = 3;
  let activeStroke = null;
  let previousPoint = null;
  const history = new Map();
  let disposed = false;

  function ensureActive() {
    if (disposed) throw new Error("Coloring service has been disposed.");
  }

  function loadDesign(templateId) {
    const template = templateRegistry.get(templateId);
    if (!template) throw new RangeError("Unknown garment template: " + templateId);
    const encoded = selectGarmentDesign(store.getState(), templateId);
    const decoded = decodeColorTexture(encoded);
    currentTemplateId = templateId;
    currentTemplate = template;
    currentDesign = { pixels: new Uint8Array(decoded.pixels), palette: decoded.palette.slice() };
    mask = createGarmentMask(template);
    if (!history.has(templateId)) history.set(templateId, { undo: [], redo: [] });
    activeStroke = null;
    previousPoint = null;
  }

  function ensureLoaded() {
    ensureActive();
    if (!currentTemplateId || !currentDesign) {
      const coloring = selectColoring(store.getState(), templateRegistry);
      loadDesign(coloring.activeTemplateId);
    }
  }

  function currentHistory() {
    const value = history.get(currentTemplateId);
    if (!value) {
      const created = { undo: [], redo: [] };
      history.set(currentTemplateId, created);
      return created;
    }
    return value;
  }

  function pushUndo(snapshot) {
    const stack = currentHistory().undo;
    stack.push(cloneDesign(snapshot));
    if (stack.length > historyLimit) stack.splice(0, stack.length - historyLimit);
    currentHistory().redo.length = 0;
  }

  function commitDesign() {
    const texture = encodeColorTexture(currentDesign.pixels, currentDesign.palette);
    store.dispatch({
      type: "coloring/design-saved",
      payload: { templateId: currentTemplateId, texture }
    });
    return texture;
  }

  function colorIndex() {
    let index = currentDesign.palette.indexOf(selectedColor);
    if (index >= 0) return index + 1;
    if (currentDesign.palette.length >= COLORING_MAX_PALETTE_COLORS) {
      throw new RangeError("This design has reached its maximum number of colors.");
    }
    currentDesign.palette.push(selectedColor);
    return currentDesign.palette.length;
  }

  function validPoint(point) {
    return point && Number.isFinite(point.x) && Number.isFinite(point.y)
      && point.x >= 0 && point.x < COLORING_TEXTURE_WIDTH
      && point.y >= 0 && point.y < COLORING_TEXTURE_HEIGHT;
  }

  function drawAt(point, value) {
    const size = brushSize;
    const radius = (size - 1) / 2;
    const centerX = Math.floor(point.x);
    const centerY = Math.floor(point.y);
    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(COLORING_TEXTURE_WIDTH - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(COLORING_TEXTURE_HEIGHT - 1, Math.ceil(centerY + radius));
    let changed = false;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x + 0.5 - (point.x);
        const dy = y + 0.5 - (point.y);
        if (dx * dx + dy * dy > radius * radius + 0.75) continue;
        const offset = y * COLORING_TEXTURE_WIDTH + x;
        if (!mask[offset]) continue;
        if (currentDesign.pixels[offset] === value) continue;
        currentDesign.pixels[offset] = value;
        changed = true;
      }
    }
    return changed;
  }

  function applyLine(from, to, value) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance * 2));
    let changed = false;
    for (let step = 0; step <= steps; step += 1) {
      const ratio = step / steps;
      changed = drawAt({
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio
      }, value) || changed;
    }
    return changed;
  }

  function beginStroke(point) {
    ensureLoaded();
    if (activeStroke) endStroke();
    activeStroke = cloneDesign(currentDesign);
    previousPoint = validPoint(point) ? { x: point.x, y: point.y } : null;
    if (!previousPoint) return false;
    const value = selectedTool === "eraser" ? 0 : colorIndex();
    return drawAt(previousPoint, value);
  }

  function continueStroke(point) {
    ensureLoaded();
    if (!activeStroke || !validPoint(point)) return false;
    const value = selectedTool === "eraser" ? 0 : colorIndex();
    const changed = previousPoint ? applyLine(previousPoint, point, value) : drawAt(point, value);
    previousPoint = { x: point.x, y: point.y };
    return changed;
  }

  function endStroke() {
    ensureLoaded();
    if (!activeStroke) return Object.freeze({ changed: false, texture: getTexture() });
    const before = activeStroke;
    activeStroke = null;
    previousPoint = null;
    if (designsEqual(before, currentDesign)) {
      currentDesign.palette = before.palette;
      return Object.freeze({ changed: false, texture: getTexture() });
    }
    pushUndo(before);
    const texture = commitDesign();
    return Object.freeze({ changed: true, texture });
  }

  function addStamp(stampId, x, y, scale = 2) {
    ensureLoaded();
    const pattern = STAMPS[stampId];
    if (!pattern) throw new RangeError("Unknown coloring stamp: " + stampId);
    if (!Number.isInteger(scale) || scale < 1 || scale > 4) throw new RangeError("Stamp scale must be from 1 to 4.");
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError("Stamp coordinates must be finite.");
    const before = cloneDesign(currentDesign);
    const value = colorIndex();
    const centerX = Math.floor(x);
    const centerY = Math.floor(y);
    const originX = centerX - Math.floor((pattern[0].length * scale) / 2);
    const originY = centerY - Math.floor((pattern.length * scale) / 2);
    let changed = false;
    for (let row = 0; row < pattern.length; row += 1) {
      for (let column = 0; column < pattern[row].length; column += 1) {
        if (pattern[row][column] !== "#") continue;
        for (let dy = 0; dy < scale; dy += 1) {
          for (let dx = 0; dx < scale; dx += 1) {
            const px = originX + column * scale + dx;
            const py = originY + row * scale + dy;
            if (px < 0 || px >= COLORING_TEXTURE_WIDTH || py < 0 || py >= COLORING_TEXTURE_HEIGHT) continue;
            const offset = py * COLORING_TEXTURE_WIDTH + px;
            if (!mask[offset] || currentDesign.pixels[offset] === value) continue;
            currentDesign.pixels[offset] = value;
            changed = true;
          }
        }
      }
    }
    if (!changed) {
      currentDesign.palette = before.palette;
      return Object.freeze({ changed: false, texture: getTexture() });
    }
    pushUndo(before);
    return Object.freeze({ changed: true, texture: commitDesign() });
  }

  function applyHistory(direction) {
    ensureLoaded();
    if (activeStroke) endStroke();
    const stacks = currentHistory();
    const source = direction === "undo" ? stacks.undo : stacks.redo;
    const destination = direction === "undo" ? stacks.redo : stacks.undo;
    if (source.length === 0) return Object.freeze({ changed: false });
    destination.push(cloneDesign(currentDesign));
    if (destination.length > historyLimit) destination.splice(0, destination.length - historyLimit);
    currentDesign = source.pop();
    commitDesign();
    return Object.freeze({ changed: true, texture: getTexture() });
  }

  function resetDesign({ confirmed = false } = {}) {
    ensureLoaded();
    if (activeStroke) endStroke();
    if (!confirmed) return Object.freeze({ reset: false, requiresConfirmation: true });
    const before = cloneDesign(currentDesign);
    const blank = decodeColorTexture(encodeColorTexture(new Uint8Array(COLORING_TEXTURE_WIDTH * COLORING_TEXTURE_HEIGHT), []));
    if (designsEqual(before, { pixels: blank.pixels, palette: blank.palette })) {
      return Object.freeze({ reset: false, requiresConfirmation: false, reason: "already-blank" });
    }
    pushUndo(before);
    currentDesign = { pixels: new Uint8Array(blank.pixels), palette: [] };
    commitDesign();
    return Object.freeze({ reset: true, requiresConfirmation: false, texture: getTexture() });
  }

  function getTexture() {
    ensureLoaded();
    return encodeColorTexture(currentDesign.pixels, currentDesign.palette);
  }

  function getSnapshot() {
    ensureLoaded();
    const stacks = currentHistory();
    return Object.freeze({
      template: currentTemplate,
      pixels: new Uint8Array(currentDesign.pixels),
      palette: Object.freeze(currentDesign.palette.slice()),
      selectedColor,
      selectedTool,
      brushSize,
      canUndo: stacks.undo.length > 0,
      canRedo: stacks.redo.length > 0
    });
  }

  function selectTemplate(templateId) {
    ensureActive();
    if (!templateRegistry.has(templateId)) throw new RangeError("Unknown garment template: " + templateId);
    if (activeStroke) endStroke();
    if (currentTemplateId !== templateId) loadDesign(templateId);
    store.dispatch({ type: "coloring/template-selected", payload: { templateId } });
    return getSnapshot();
  }

  function setColor(color) {
    ensureLoaded();
    if (typeof color !== "string" || !COLOR_PATTERN.test(color)) throw new TypeError("Color must be a six-digit hex value.");
    selectedColor = color.toLowerCase();
    return selectedColor;
  }

  function setTool(tool) {
    ensureLoaded();
    if (!["brush", "eraser"].includes(tool)) throw new TypeError('Tool must be "brush" or "eraser".');
    if (activeStroke) endStroke();
    selectedTool = tool;
    return selectedTool;
  }

  function setBrushSize(size) {
    ensureLoaded();
    if (!Number.isInteger(size) || size < 1 || size > 12) throw new RangeError("Brush size must be an integer from 1 to 12.");
    brushSize = size;
    return brushSize;
  }

  function undo() { return applyHistory("undo"); }
  function redo() { return applyHistory("redo"); }

  function restoreFromStore() {
    ensureActive();
    const selection = selectColoring(store.getState(), templateRegistry);
    history.clear();
    loadDesign(selection.activeTemplateId);
  }

  const initial = selectColoring(store.getState(), templateRegistry);
  loadDesign(initial.activeTemplateId);

  function dispose() {
    if (disposed) return;
    if (activeStroke) endStroke();
    disposed = true;
  }

  return Object.freeze({
    getSnapshot,
    getTexture,
    selectTemplate,
    setColor,
    setTool,
    setBrushSize,
    beginStroke,
    continueStroke,
    endStroke,
    addStamp,
    undo,
    redo,
    resetDesign,
    restoreFromStore,
    dispose
  });
}

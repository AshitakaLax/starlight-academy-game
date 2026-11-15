import { COLORING_PIXEL_COUNT, COLORING_TEXTURE_HEIGHT, COLORING_TEXTURE_WIDTH } from "./garmentTemplates.js";

export const COLORING_TEXTURE_VERSION = 1;
export const COLORING_MAX_PALETTE_COLORS = 32;
export const COLORING_MAX_RUNS = COLORING_PIXEL_COUNT;
export const COLORING_MAX_ENCODED_CHARS = 40_000;

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function hasOnlyKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).every((key) => keys.includes(key));
}

/** Compact run-length encoding for a fixed-size indexed RGBA texture. */
export function encodeColorTexture(pixelIndices, palette = []) {
  if ((!Array.isArray(pixelIndices) && !(pixelIndices instanceof Uint8Array))
      || pixelIndices.length !== COLORING_PIXEL_COUNT) {
    throw new TypeError("Color texture pixels must contain exactly " + COLORING_PIXEL_COUNT + " indices.");
  }
  if (!Array.isArray(palette) || palette.length > COLORING_MAX_PALETTE_COLORS
      || palette.some((color) => !isHexColor(color))) {
    throw new TypeError("Color texture palette must contain at most " + COLORING_MAX_PALETTE_COLORS + " hex colors.");
  }
  const normalizedPalette = palette.map((color) => color.toLowerCase());
  if (new Set(normalizedPalette).size !== normalizedPalette.length) {
    throw new TypeError("Color texture palette colors must be unique.");
  }
  const maximumIndex = normalizedPalette.length;
  let current = pixelIndices[0];
  if (!Number.isInteger(current) || current < 0 || current > maximumIndex) {
    throw new RangeError("Color texture contains an invalid palette index.");
  }
  let count = 1;
  const runs = [];
  for (let index = 1; index < pixelIndices.length; index += 1) {
    const value = pixelIndices[index];
    if (!Number.isInteger(value) || value < 0 || value > maximumIndex) {
      throw new RangeError("Color texture contains an invalid palette index.");
    }
    if (value === current && count < COLORING_PIXEL_COUNT) count += 1;
    else {
      runs.push(current.toString(36) + "." + count.toString(36));
      current = value;
      count = 1;
    }
  }
  runs.push(current.toString(36) + "." + count.toString(36));
  const encodedRuns = runs.join(",");
  if (runs.length > COLORING_MAX_RUNS || encodedRuns.length > COLORING_MAX_ENCODED_CHARS) {
    throw new RangeError("Color texture exceeds the compressed storage limit.");
  }
  return Object.freeze({
    version: COLORING_TEXTURE_VERSION,
    width: COLORING_TEXTURE_WIDTH,
    height: COLORING_TEXTURE_HEIGHT,
    palette: Object.freeze(normalizedPalette),
    runs: encodedRuns
  });
}

/** Strictly decode bounded RLE data; malformed or oversized imports are rejected. */
export function decodeColorTexture(input) {
  if (!hasOnlyKeys(input, ["version", "width", "height", "palette", "runs"])
      || Object.keys(input).length !== 5) {
    throw new TypeError("Color texture must contain version, width, height, palette, and runs only.");
  }
  if (input.version !== COLORING_TEXTURE_VERSION
      || input.width !== COLORING_TEXTURE_WIDTH || input.height !== COLORING_TEXTURE_HEIGHT) {
    throw new RangeError("Color texture dimensions or version are not supported.");
  }
  if (!Array.isArray(input.palette) || input.palette.length > COLORING_MAX_PALETTE_COLORS
      || input.palette.some((color) => !isHexColor(color))) {
    throw new TypeError("Color texture palette is invalid.");
  }
  const palette = input.palette.map((color) => color.toLowerCase());
  if (new Set(palette).size !== palette.length) throw new TypeError("Color texture palette colors must be unique.");
  if (typeof input.runs !== "string" || input.runs.length < 3
      || input.runs.length > COLORING_MAX_ENCODED_CHARS) {
    throw new RangeError("Color texture RLE data is missing or exceeds the storage limit.");
  }
  const tokens = input.runs.split(",");
  if (tokens.length > COLORING_MAX_RUNS) throw new RangeError("Color texture has too many RLE runs.");
  const pixels = new Uint8Array(COLORING_PIXEL_COUNT);
  let offset = 0;
  for (const token of tokens) {
    const match = /^([0-9a-z])\.([0-9a-z]+)$/.exec(token);
    if (!match) throw new TypeError("Color texture contains a malformed RLE run.");
    const value = Number.parseInt(match[1], 36);
    const count = Number.parseInt(match[2], 36);
    if (!Number.isSafeInteger(value) || value < 0 || value > palette.length
        || !Number.isSafeInteger(count) || count < 1 || count > COLORING_PIXEL_COUNT
        || offset + count > COLORING_PIXEL_COUNT) {
      throw new RangeError("Color texture RLE run is outside its supported bounds.");
    }
    pixels.fill(value, offset, offset + count);
    offset += count;
  }
  if (offset !== COLORING_PIXEL_COUNT) throw new RangeError("Color texture RLE data does not fill the garment texture.");
  return Object.freeze({ width: input.width, height: input.height, palette: Object.freeze(palette), pixels });
}

export function createBlankColorTexture() {
  return encodeColorTexture(new Uint8Array(COLORING_PIXEL_COUNT), []);
}

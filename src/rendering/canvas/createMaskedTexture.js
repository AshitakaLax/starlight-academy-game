const MAX_DIMENSION = 4096;
const MAX_PIXELS = 16_777_216;

/** Compose a texture with a bounded alpha mask using destination-in. */
export function createMaskedTexture({
  width, height, drawTexture, drawMask,
  OffscreenCanvasCtor = globalThis.OffscreenCanvas,
  documentRef = globalThis.document,
  maxDimension = MAX_DIMENSION, maxPixels = MAX_PIXELS
} = {}) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1
      || width > maxDimension || height > maxDimension || width * height > maxPixels) {
    throw new RangeError("Masked texture dimensions are invalid or exceed the configured limit.");
  }
  if (typeof drawTexture !== "function" || typeof drawMask !== "function") {
    throw new TypeError("createMaskedTexture requires drawTexture and drawMask callbacks.");
  }
  let surface;
  if (typeof OffscreenCanvasCtor === "function") surface = new OffscreenCanvasCtor(width, height);
  else if (typeof documentRef?.createElement === "function") {
    surface = documentRef.createElement("canvas");
    surface.width = width;
    surface.height = height;
  } else throw new Error("Offscreen canvas is unavailable in this browser.");

  const context = surface.getContext("2d");
  if (!context) throw new Error("A 2D context is not available for the masked texture.");
  context.clearRect(0, 0, width, height);
  drawTexture(context, surface);
  context.save();
  try {
    context.globalCompositeOperation = "destination-in";
    drawMask(context, surface);
  } finally { context.restore(); }
  return surface;
}

import { COLORING_TEXTURE_HEIGHT, COLORING_TEXTURE_WIDTH, createGarmentMask } from "./garmentTemplates.js";

function colorChannels(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ];
}

function tracePolygon(context, points, scaleX, scaleY) {
  context.beginPath();
  points.forEach(([x, y], index) => {
    const px = x * scaleX;
    const py = y * scaleY;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  });
  context.closePath();
}

/** Draw the garment silhouette and its clipped indexed-color texture into a preview canvas. */
export function renderColoringCanvas(canvas, snapshot, { documentRef = globalThis.document } = {}) {
  if (!canvas || typeof canvas.getContext !== "function") throw new TypeError("A coloring preview canvas is required.");
  if (!snapshot?.template || !Array.isArray(snapshot.palette)
      || !snapshot.pixels || snapshot.pixels.length !== COLORING_TEXTURE_WIDTH * COLORING_TEXTURE_HEIGHT) {
    throw new TypeError("A valid garment coloring snapshot is required.");
  }
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("A document reference is required to render the garment texture.");
  }
  const template = snapshot.template;
  const surface = documentRef.createElement("canvas");
  surface.width = COLORING_TEXTURE_WIDTH;
  surface.height = COLORING_TEXTURE_HEIGHT;
  const textureContext = surface.getContext("2d", { willReadFrequently: true });
  const context = canvas.getContext("2d");
  if (!textureContext || !context) throw new Error("A 2D canvas context is unavailable.");

  const mask = createGarmentMask(template);
  const image = textureContext.createImageData(COLORING_TEXTURE_WIDTH, COLORING_TEXTURE_HEIGHT);
  const base = colorChannels(template.baseColor);
  const colors = snapshot.palette.map(colorChannels);
  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index]) continue;
    const paletteIndex = snapshot.pixels[index];
    const color = paletteIndex > 0 && paletteIndex <= colors.length ? colors[paletteIndex - 1] : base;
    const offset = index * 4;
    image.data[offset] = color[0];
    image.data[offset + 1] = color[1];
    image.data[offset + 2] = color[2];
    image.data[offset + 3] = 255;
  }
  textureContext.putImageData(image, 0, 0);

  const width = 256;
  const height = 320;
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.save();
  try {
    context.shadowColor = "rgba(72, 52, 94, .16)";
    context.shadowBlur = 16;
    context.shadowOffsetY = 6;
    tracePolygon(context, template.points, width / COLORING_TEXTURE_WIDTH, height / COLORING_TEXTURE_HEIGHT);
    context.fillStyle = "#fff";
    context.fill();
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.save();
    tracePolygon(context, template.points, width / COLORING_TEXTURE_WIDTH, height / COLORING_TEXTURE_HEIGHT);
    context.clip();
    context.imageSmoothingEnabled = false;
    context.drawImage(surface, 0, 0, width, height);
    context.restore();

    context.strokeStyle = "#8d76a3";
    context.lineWidth = 2;
    context.lineJoin = "round";
    tracePolygon(context, template.points, width / COLORING_TEXTURE_WIDTH, height / COLORING_TEXTURE_HEIGHT);
    context.stroke();

    context.strokeStyle = "rgba(112, 87, 137, .48)";
    context.lineWidth = 1.5;
    for (const line of template.accentLines ?? []) {
      context.beginPath();
      line.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x * width / COLORING_TEXTURE_WIDTH, y * height / COLORING_TEXTURE_HEIGHT);
        else context.lineTo(x * width / COLORING_TEXTURE_WIDTH, y * height / COLORING_TEXTURE_HEIGHT);
      });
      context.stroke();
    }
  } finally {
    context.restore();
  }
  return Object.freeze({ width, height, pixelWidth: COLORING_TEXTURE_WIDTH, pixelHeight: COLORING_TEXTURE_HEIGHT });
}

import { createBlankColorTexture, decodeColorTexture } from "./textureCodec.js";

export function createInitialColoringState(templateRegistry) {
  if (!templateRegistry || typeof templateRegistry.list !== "function") {
    throw new TypeError("createInitialColoringState requires a garment template registry.");
  }
  const first = templateRegistry.list()[0];
  if (!first) throw new Error("At least one garment template must be registered.");
  return {
    activeTemplateId: first.id,
    designs: {}
  };
}

export function selectColoring(state, templateRegistry) {
  const coloring = state?.coloring;
  const fallback = templateRegistry?.list?.()[0] ?? null;
  const activeTemplateId = templateRegistry?.has?.(coloring?.activeTemplateId)
    ? coloring.activeTemplateId
    : fallback?.id ?? null;
  const designs = coloring?.designs && typeof coloring.designs === "object"
    ? coloring.designs
    : Object.freeze({});
  return Object.freeze({ activeTemplateId, designs });
}

export function selectGarmentDesign(state, templateId) {
  const encoded = state?.coloring?.designs?.[templateId]?.texture;
  if (!encoded) return createBlankColorTexture();
  try {
    decodeColorTexture(encoded);
    return encoded;
  } catch {
    return createBlankColorTexture();
  }
}

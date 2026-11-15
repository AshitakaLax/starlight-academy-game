import { isPlainObject } from "../../core/state/stateUtils.js";
import { decodeColorTexture } from "./textureCodec.js";
import { createInitialColoringState, selectColoring } from "./coloringState.js";

function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.includes(key));
}

export function createColoringActionDefinitions({ templateRegistry } = {}) {
  if (!templateRegistry || typeof templateRegistry.has !== "function" || typeof templateRegistry.list !== "function") {
    throw new TypeError("createColoringActionDefinitions requires a garment template registry.");
  }

  return Object.freeze({
    "coloring/template-selected": Object.freeze({
      validate(payload) {
        return isPlainObject(payload) && Object.keys(payload).length === 1
          && hasOnlyKeys(payload, ["templateId"])
          && typeof payload.templateId === "string"
          && templateRegistry.has(payload.templateId)
          ? true : "coloring/template-selected expects a registered templateId.";
      },
      reduce(state, payload) {
        const current = selectColoring(state, templateRegistry);
        if (current.activeTemplateId === payload.templateId) return state;
        const coloring = isPlainObject(state.coloring)
          ? state.coloring
          : createInitialColoringState(templateRegistry);
        return { ...state, coloring: { ...coloring, activeTemplateId: payload.templateId } };
      }
    }),

    "coloring/design-saved": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 2
            || !hasOnlyKeys(payload, ["templateId", "texture"])
            || typeof payload.templateId !== "string" || !templateRegistry.has(payload.templateId)) {
          return "coloring/design-saved expects a registered templateId and encoded texture.";
        }
        try {
          decodeColorTexture(payload.texture);
        } catch (error) {
          return error?.message || "Coloring design texture is invalid.";
        }
        return true;
      },
      reduce(state, payload) {
        const coloring = isPlainObject(state.coloring)
          ? state.coloring
          : createInitialColoringState(templateRegistry);
        const designs = isPlainObject(coloring.designs) ? coloring.designs : {};
        const previous = designs[payload.templateId];
        const nextDesign = { texture: payload.texture };
        if (previous?.texture?.runs === payload.texture.runs
            && previous?.texture?.palette?.length === payload.texture.palette.length
            && previous.texture.palette.every((color, index) => color === payload.texture.palette[index])) {
          return state;
        }
        return {
          ...state,
          coloring: {
            ...coloring,
            designs: { ...designs, [payload.templateId]: nextDesign }
          }
        };
      }
    })
  });
}

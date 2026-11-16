import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import {
  COLORING_TEXTURE_HEIGHT,
  COLORING_TEXTURE_WIDTH,
  COLORING_MAX_ENCODED_CHARS,
  createBlankColorTexture,
  encodeColorTexture,
  decodeColorTexture
} from "../src/gameplay/coloring/textureCodec.js";
import {
  COLORING_PIXEL_COUNT,
  createGarmentTemplate,
  createGarmentMask,
  createGarmentTemplateRegistry,
  defaultGarmentTemplates,
  isPointInGarmentMask
} from "../src/gameplay/coloring/garmentTemplates.js";
import { createInitialColoringState, selectColoring, selectGarmentDesign } from "../src/gameplay/coloring/coloringState.js";
import { createColoringActionDefinitions } from "../src/gameplay/coloring/coloringActions.js";
import { createColoringService } from "../src/gameplay/coloring/createColoringService.js";
import { renderColoringCanvas } from "../src/gameplay/coloring/renderColoringCanvas.js";

function createHarness({ historyLimit = 12 } = {}) {
  const templateRegistry = createGarmentTemplateRegistry(defaultGarmentTemplates);
  const coloringState = createInitialColoringState(templateRegistry);
  const actions = createColoringActionDefinitions({ templateRegistry });
  const store = createGameStore({
    initialState: { ...createInitialGameState(), coloring: coloringState },
    actions
  });
  const service = createColoringService({ store, templateRegistry, historyLimit });
  return { templateRegistry, store, service };
}

function countPainted(texture) {
  return decodeColorTexture(texture).pixels.reduce((count, value) => count + (value > 0 ? 1 : 0), 0);
}

function assertPixelsStayInsideMask(snapshot, template) {
  const mask = createGarmentMask(template);
  for (let index = 0; index < snapshot.pixels.length; index += 1) {
    if (snapshot.pixels[index] > 0) assert.equal(mask[index], 1, "paint must remain inside the garment mask");
  }
}

test("default garment catalog validates three templates and exposes unique stable IDs", () => {
  const registry = createGarmentTemplateRegistry(defaultGarmentTemplates);
  assert.equal(registry.list().length, 3);
  assert.deepEqual(registry.list().map((item) => item.id).sort(), [
    "garment.academy-tunic",
    "garment.comet-dress",
    "garment.starlight-cape"
  ]);
  assert.ok(Object.isFrozen(registry.get("garment.academy-tunic")));
  assert.ok(Object.isFrozen(registry.get("garment.academy-tunic").points));
  assert.throws(() => registry.register(defaultGarmentTemplates[0]), /already registered/);
});

test("garment template validation enforces stable IDs, bounded polygons, and valid seam paths", () => {
  assert.throws(() => createGarmentTemplate({
    ...defaultGarmentTemplates[0], id: "tunic"
  }), /garment namespace/);
  assert.throws(() => createGarmentTemplate({
    ...defaultGarmentTemplates[0], points: [[0, 0], [1, 1]]
  }), /polygon with 6 to 40/);
  assert.throws(() => createGarmentTemplate({
    ...defaultGarmentTemplates[0], accentLines: [[[70, 2], [3, 4]]]
  }), /accentLines/);
  const valid = createGarmentTemplate({
    ...defaultGarmentTemplates[0],
    accentLines: [[[8, 8], [20, 20]]]
  });
  assert.equal(valid.accentLines[0].length, 2);
});

test("polygon point checks and raster masks identify inside and outside garment pixels", () => {
  const template = createGarmentTemplateRegistry(defaultGarmentTemplates).get("garment.academy-tunic");
  assert.equal(isPointInGarmentMask(32, 30, template.points), true);
  assert.equal(isPointInGarmentMask(0, 0, template.points), false);
  const mask = createGarmentMask(template);
  assert.equal(mask.length, COLORING_PIXEL_COUNT);
  assert.ok(mask.some((value) => value === 1));
  assert.ok(mask.some((value) => value === 0));
});

test("blank textures and encoded color textures round-trip using bounded run-length data", () => {
  const blank = createBlankColorTexture();
  assert.equal(blank.version, 1);
  assert.equal(blank.width, COLORING_TEXTURE_WIDTH);
  assert.equal(blank.height, COLORING_TEXTURE_HEIGHT);
  assert.equal(countPainted(blank), 0);

  const pixels = new Uint8Array(COLORING_PIXEL_COUNT);
  pixels.fill(1, 90, 180);
  pixels.fill(2, 180, 220);
  const encoded = encodeColorTexture(pixels, ["#B78BD2", "#E89CBE"]);
  const decoded = decodeColorTexture(encoded);
  assert.deepEqual(decoded.palette, ["#b78bd2", "#e89cbe"]);
  assert.deepEqual(decoded.pixels, pixels);
  assert.ok(encoded.runs.length < pixels.length);
  assert.ok(Object.isFrozen(encoded));
});

test("texture decoder rejects malformed, truncated, excessive, and incompatible imports", () => {
  const blank = createBlankColorTexture();
  assert.throws(() => decodeColorTexture({ ...blank, version: 9 }), /version/);
  assert.throws(() => decodeColorTexture({ ...blank, width: 32 }), /dimensions/);
  assert.throws(() => decodeColorTexture({ ...blank, runs: "not-rle" }), /malformed RLE/);
  assert.throws(() => decodeColorTexture({ ...blank, runs: "0.1" }), /does not fill/);
  assert.throws(() => decodeColorTexture({ ...blank, runs: "0.1" }), /does not fill/);
  assert.throws(() => decodeColorTexture({ ...blank, runs: "0.2,0.z" }), /outside|malformed|does not fill/);
  assert.throws(() => decodeColorTexture({ ...blank, runs: "0.1", surprise: true }), /contain version/);
  assert.throws(() => decodeColorTexture({ ...blank, runs: "0".repeat(COLORING_MAX_ENCODED_CHARS + 1) }), /storage limit/);
  assert.throws(() => encodeColorTexture(new Uint8Array(3), []), /exactly/);
  assert.throws(() => encodeColorTexture(new Uint8Array(COLORING_PIXEL_COUNT), ["red"]), /hex colors/);
});

test("initial coloring state chooses an available garment and retains empty designs", () => {
  const { templateRegistry, store } = createHarness();
  const selection = selectColoring(store.getState(), templateRegistry);
  assert.equal(selection.activeTemplateId, "garment.academy-tunic");
  assert.deepEqual(selection.designs, {});
  assert.equal(selectGarmentDesign(store.getState(), selection.activeTemplateId).runs, createBlankColorTexture().runs);
});

test("the brush never paints outside the garment mask, including off-garment pointer starts", () => {
  const { service, templateRegistry, store } = createHarness();
  service.setColor("#E89CBE");
  service.beginStroke({ x: 0, y: 0 });
  const emptyEnd = service.endStroke();
  assert.equal(emptyEnd.changed, false);
  assert.deepEqual(service.getSnapshot().palette, []);
  assert.equal(store.getState().coloring.designs["garment.academy-tunic"], undefined);

  service.beginStroke({ x: 32, y: 30 });
  service.continueStroke({ x: 37, y: 33 });
  assert.equal(service.endStroke().changed, true);
  const snapshot = service.getSnapshot();
  assert.ok(snapshot.palette.includes("#e89cbe"));
  assert.ok(countPainted(service.getTexture()) > 0);
  assertPixelsStayInsideMask(snapshot, templateRegistry.get(snapshot.template.id));
});

test("long brush drags interpolate between pointer samples without leaving the clipping mask", () => {
  const { service, templateRegistry } = createHarness();
  service.setBrushSize(1);
  service.beginStroke({ x: 23, y: 32 });
  service.continueStroke({ x: 42, y: 32 });
  service.endStroke();
  const snapshot = service.getSnapshot();
  assert.ok(countPainted(service.getTexture()) >= 12);
  assertPixelsStayInsideMask(snapshot, templateRegistry.get(snapshot.template.id));
});

test("eraser removes existing color while keeping all remaining pixels inside the mask", () => {
  const { service, templateRegistry } = createHarness();
  service.setBrushSize(5);
  service.beginStroke({ x: 32, y: 30 });
  service.endStroke();
  const before = countPainted(service.getTexture());
  assert.ok(before > 0);
  service.setTool("eraser");
  service.beginStroke({ x: 32, y: 30 });
  service.endStroke();
  assert.ok(countPainted(service.getTexture()) < before);
  assertPixelsStayInsideMask(service.getSnapshot(), templateRegistry.get(service.getSnapshot().template.id));
});

test("star, heart, and flower stamps add clipped patterns as single undoable changes", () => {
  const { service, templateRegistry } = createHarness();
  for (const [stamp, x] of [["star", 24], ["heart", 32], ["flower", 40]]) {
    const result = service.addStamp(stamp, x, 35, 2);
    assert.equal(result.changed, true);
    assertPixelsStayInsideMask(service.getSnapshot(), templateRegistry.get(service.getSnapshot().template.id));
  }
  assert.ok(countPainted(service.getTexture()) > 0);
  const beforeUndo = countPainted(service.getTexture());
  assert.equal(service.undo().changed, true);
  assert.ok(countPainted(service.getTexture()) < beforeUndo);
  assert.equal(service.redo().changed, true);
});

test("undo and redo restore exact texture data and do not exceed the configured history bound", () => {
  const { service } = createHarness({ historyLimit: 3 });
  service.setBrushSize(1);
  const blankRuns = service.getTexture().runs;
  for (let x = 26; x <= 31; x += 1) {
    service.beginStroke({ x, y: 32 });
    service.endStroke();
  }
  const paintedRuns = service.getTexture().runs;
  assert.notEqual(paintedRuns, blankRuns);
  assert.equal(service.getSnapshot().canUndo, true);
  for (let index = 0; index < 3; index += 1) service.undo();
  assert.equal(service.undo().changed, false);
  assert.ok(countPainted(service.getTexture()) > 0, "only the most recent three changes remain undoable");
  assert.equal(service.redo().changed, true);
  assert.notEqual(service.getTexture().runs, blankRuns);
});

test("reset asks for confirmation, preserves undo, and clears only the selected garment design", () => {
  const { service } = createHarness();
  service.beginStroke({ x: 32, y: 30 });
  service.endStroke();
  const before = service.getTexture().runs;
  const request = service.resetDesign();
  assert.deepEqual(request, { reset: false, requiresConfirmation: true });
  assert.equal(service.getTexture().runs, before);
  assert.equal(service.resetDesign({ confirmed: true }).reset, true);
  assert.equal(countPainted(service.getTexture()), 0);
  assert.equal(service.undo().changed, true);
  assert.equal(service.getTexture().runs, before);
});

test("designs remain independent by garment template and restore when switching back", () => {
  const { service, templateRegistry } = createHarness();
  service.beginStroke({ x: 32, y: 30 });
  service.endStroke();
  const tunicRuns = service.getTexture().runs;
  service.selectTemplate("garment.comet-dress");
  assert.equal(countPainted(service.getTexture()), 0);
  service.beginStroke({ x: 32, y: 44 });
  service.endStroke();
  const dressRuns = service.getTexture().runs;
  assert.notEqual(dressRuns, tunicRuns);
  service.selectTemplate("garment.academy-tunic");
  assert.equal(service.getTexture().runs, tunicRuns);
  service.selectTemplate("garment.comet-dress");
  assert.equal(service.getTexture().runs, dressRuns);
  assert.equal(templateRegistry.get(service.getSnapshot().template.id).id, "garment.comet-dress");
});

test("encoded coloring designs persist through a fresh store and a state-restored import", () => {
  const harness = createHarness();
  harness.service.setColor("#86ABC9");
  harness.service.beginStroke({ x: 32, y: 30 });
  harness.service.endStroke();
  const savedState = JSON.parse(JSON.stringify(harness.store.getState()));
  const savedTexture = savedState.coloring.designs["garment.academy-tunic"].texture;
  assert.ok(savedTexture.runs.length > 0);

  const restoredActions = createColoringActionDefinitions({ templateRegistry: harness.templateRegistry });
  const restoredStore = createGameStore({ initialState: savedState, actions: restoredActions });
  const restoredService = createColoringService({
    store: restoredStore,
    templateRegistry: harness.templateRegistry
  });
  assert.deepEqual(restoredService.getTexture(), savedTexture);
  assert.ok(restoredService.getSnapshot().palette.includes("#86abc9"));

  const replacementState = { ...savedState, coloring: createInitialColoringState(harness.templateRegistry) };
  restoredStore.dispatch({ type: "app/state-restored", payload: { state: replacementState } });
  restoredService.restoreFromStore();
  assert.equal(countPainted(restoredService.getTexture()), 0);
});

test("template selection and design save actions validate IDs and encoded data", () => {
  const { store, service } = createHarness();
  assert.throws(() => service.selectTemplate("garment.unknown"), /Unknown garment template/);
  assert.throws(() => store.dispatch({
    type: "coloring/template-selected",
    payload: { templateId: "garment.not-registered" }
  }), /registered templateId/);
  assert.throws(() => store.dispatch({
    type: "coloring/design-saved",
    payload: { templateId: "garment.academy-tunic", texture: { version: 1 } }
  }), /version, width, height/);
  assert.equal(store.getState().coloring.designs["garment.academy-tunic"], undefined);
});

test("legacy saves receive a first garment selection and empty design map without losing progress", () => {
  const { templateRegistry } = createHarness();
  const defaults = {
    ...createInitialGameState(),
    coloring: createInitialColoringState(templateRegistry),
    profile: { nickname: "Star Student" }
  };
  const restored = {
    app: { screenId: "academy" },
    profile: { nickname: "Moonbeam" },
    curriculum: { skills: { "math.multiplication": { totalResponses: 3 } } }
  };
  const merged = mergeGameStateDefaults(defaults, restored);
  assert.deepEqual(merged.coloring, defaults.coloring);
  assert.equal(merged.profile.nickname, "Moonbeam");
  assert.equal(merged.curriculum.skills["math.multiplication"].totalResponses, 3);
});

test("service validates dependencies, tools, colors, sizes, stamps, and disposed state", () => {
  const { service, store, templateRegistry } = createHarness();
  assert.throws(() => createColoringService(), /compatible game store/);
  assert.throws(() => service.setTool("spray"), /brush.*eraser/);
  assert.throws(() => service.setColor("pink"), /six-digit hex/);
  assert.throws(() => service.setBrushSize(0), /1 to 12/);
  assert.throws(() => service.addStamp("crown", 30, 30), /Unknown coloring stamp/);
  assert.ok(store.getState().coloring);
  service.dispose();
  assert.throws(() => service.getSnapshot(), /disposed/);
  assert.ok(templateRegistry.has("garment.academy-tunic"));
});


test("rendering helper composes the clipped texture into a scaled garment preview", () => {
  const { service } = createHarness();
  service.beginStroke({ x: 32, y: 30 });
  service.endStroke();
  function context() {
    return {
      createImageData(width, height) { return { data: new Uint8ClampedArray(width * height * 4) }; },
      putImageData() {}, clearRect() {}, save() {}, restore() {}, beginPath() {}, moveTo() {},
      lineTo() {}, closePath() {}, fill() {}, stroke() {}, clip() {}, drawImage() {}
    };
  }
  const canvas = { width: 0, height: 0, getContext: () => context() };
  const documentRef = { createElement: () => ({ width: 0, height: 0, getContext: () => context() }) };
  const result = renderColoringCanvas(canvas, service.getSnapshot(), { documentRef });
  assert.deepEqual(result, { width: 256, height: 320, pixelWidth: 64, pixelHeight: 80 });
  assert.equal(canvas.width, 256);
  assert.equal(canvas.height, 320);
});

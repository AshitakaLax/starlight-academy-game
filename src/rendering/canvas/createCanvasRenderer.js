function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function displaySize(canvas) {
  const rect = canvas.getBoundingClientRect?.() ?? {};
  return { width: Math.max(0, Number(rect.width) || canvas.clientWidth || 0), height: Math.max(0, Number(rect.height) || canvas.clientHeight || 0) };
}

/** Ordered, lifecycle-managed 2D renderer. Layers receive presentation timing only. */
export function createCanvasRenderer({
  canvas, windowRef = globalThis.window, documentRef = globalThis.document,
  ResizeObserverCtor = globalThis.ResizeObserver,
  requestFrame = windowRef?.requestAnimationFrame?.bind(windowRef),
  cancelFrame = windowRef?.cancelAnimationFrame?.bind(windowRef),
  maxPixelRatio = 2, onError = () => {}
} = {}) {
  if (!canvas || typeof canvas.getContext !== "function") throw new TypeError("A canvas element is required.");
  if (typeof requestFrame !== "function" || typeof cancelFrame !== "function") throw new TypeError("Animation frame APIs are required.");
  if (!Number.isFinite(maxPixelRatio) || maxPixelRatio < 1 || maxPixelRatio > 4) throw new TypeError("maxPixelRatio must be between 1 and 4.");
  if (typeof onError !== "function") throw new TypeError("onError must be a function.");
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("A 2D canvas context is unavailable.");

  let layers = [], running = false, active = false, reducedMotion = false, destroyed = false;
  let raf = null, frameCount = 0, previousTime = null, elapsed = 0, width = 0, height = 0, dpr = 1;
  let resizeObserver = null, observersAttached = false;

  function report(error, source) { try { onError(error, source); } catch {} }
  function visible() { return documentRef?.visibilityState !== "hidden"; }
  function timeNow() {
    const n = windowRef?.performance?.now?.();
    return Number.isFinite(n) ? n : Date.now();
  }
  function cancelScheduled() { if (raf !== null) { cancelFrame(raf); raf = null; } }
  function paint(timestamp, force = false) {
    if (destroyed || (!force && (!active || !visible())) || width <= 0 || height <= 0) return;
    const now = Number.isFinite(timestamp) ? timestamp : timeNow();
    const delta = previousTime === null ? 0 : clamp(now - previousTime, 0, 50);
    if (!force) elapsed += delta;
    previousTime = now;
    const frame = Object.freeze({ width, height, pixelRatio: dpr, deltaMs: force ? 0 : delta, elapsedMs: elapsed, timestamp: now, frameNumber: frameCount + 1 });
    try { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); }
    catch (error) { report(error, "canvas:clear"); return; }
    for (const layer of layers) {
      try { ctx.save(); layer.draw(ctx, frame); }
      catch (error) { report(error, "layer:" + layer.id); }
      finally { try { ctx.restore(); } catch (error) { report(error, "canvas:restore"); } }
    }
    frameCount += 1;
  }
  function schedule() {
    if (!running || !active || reducedMotion || !visible() || raf !== null || destroyed) return;
    raf = requestFrame((timestamp) => {
      raf = null;
      if (!running || !active || reducedMotion || !visible() || destroyed) return;
      paint(timestamp);
      schedule();
    });
  }
  function resize() {
    if (destroyed) return Object.freeze({ width, height, pixelRatio: dpr });
    const size = displaySize(canvas);
    width = size.width; height = size.height;
    dpr = clamp(Number(windowRef?.devicePixelRatio) || 1, 1, maxPixelRatio);
    const backingW = Math.max(1, Math.round(width * dpr));
    const backingH = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== backingW) canvas.width = backingW;
    if (canvas.height !== backingH) canvas.height = backingH;
    if (active && visible()) paint(timeNow(), true);
    return Object.freeze({ width, height, pixelRatio: dpr });
  }
  function onVisibilityChange() {
    if (!visible()) { cancelScheduled(); previousTime = null; return; }
    if (running && active) { previousTime = null; resize(); schedule(); }
  }
  function attachObservers() {
    if (observersAttached) return;
    observersAttached = true;
    if (typeof ResizeObserverCtor === "function") {
      resizeObserver = new ResizeObserverCtor(() => resize());
      resizeObserver.observe(canvas.parentElement ?? canvas);
    } else windowRef?.addEventListener?.("resize", resize);
    documentRef?.addEventListener?.("visibilitychange", onVisibilityChange);
  }
  function detachObservers() {
    if (!observersAttached) return;
    observersAttached = false;
    resizeObserver?.disconnect(); resizeObserver = null;
    windowRef?.removeEventListener?.("resize", resize);
    documentRef?.removeEventListener?.("visibilitychange", onVisibilityChange);
  }
  function start() {
    if (destroyed) throw new Error("The canvas renderer has been destroyed.");
    if (running) return;
    running = true;
    active = true;
    attachObservers();
    previousTime = null;
    resize();
    if (visible()) schedule();
  }
  function stop() {
    if (!running) return;
    running = false; active = false; cancelScheduled(); previousTime = null; detachObservers();
  }
  function setActive(value) {
    if (destroyed) return;
    const next = value === true;
    if (active === next) return;
    active = next; previousTime = null;
    if (!running) return;
    if (!active) { cancelScheduled(); return; }
    if (visible()) { resize(); schedule(); }
  }
  function setReducedMotion(value) {
    if (destroyed) return;
    const next = value === true;
    if (next === reducedMotion) return;
    reducedMotion = next; previousTime = null;
    if (!running || !active || !visible()) return;
    cancelScheduled(); paint(timeNow(), true); schedule();
  }
  function addLayer({ id, draw, order = 0 } = {}) {
    if (destroyed) throw new Error("The canvas renderer has been destroyed.");
    if (typeof id !== "string" || !id.trim() || typeof draw !== "function" || !Number.isFinite(order)) throw new TypeError("A layer requires a non-empty ID, draw function and finite order.");
    if (layers.some((entry) => entry.id === id)) throw new Error("Render layer already exists: " + id);
    layers = [...layers, Object.freeze({ id, draw, order })].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    return () => removeLayer(id);
  }
  function removeLayer(id) {
    const before = layers.length; layers = layers.filter((layer) => layer.id !== id);
    if (before !== layers.length && running && active && reducedMotion) paint(timeNow(), true);
    return before !== layers.length;
  }
  function destroy() { if (destroyed) return; stop(); cancelScheduled(); layers = []; destroyed = true; }

  return Object.freeze({
    start, stop, destroy, resize, setActive, setReducedMotion, addLayer, removeLayer,
    renderOnce() { if (!destroyed && visible()) { resize(); paint(timeNow(), true); } },
    getDiagnostics() { return Object.freeze({ running, active, reducedMotion, destroyed, width, height, pixelRatio: dpr, frameCount, layerIds: Object.freeze(layers.map((l) => l.id)), frameScheduled: raf !== null }); }
  });
}

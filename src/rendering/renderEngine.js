/**
 * Rendering engine: stage canvas, layered draw calls, offscreen masks,
 * animation lifecycle, and resize handling. Gameplay timing uses elapsed
 * deltas, not frame counts.
 */
export class RenderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext("2d") : null;
    this.layers = new Map(); // name -> (ctx, dt, t) => void
    this.masks = new Map();
    this.raf = null;
    this.running = false;
    this.lastTime = 0;
    this.dpr = (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1;
    this.resizeObserver = null;
  }

  registerLayer(name, drawFn, zIndex = 0) {
    this.layers.set(name, { drawFn, zIndex });
  }

  removeLayer(name) {
    this.layers.delete(name);
  }

  createMask(name, width, height) {
    let c;
    if (typeof document !== "undefined") {
      c = document.createElement("canvas");
    } else {
      c = { width, height, getContext: () => null };
    }
    c.width = width;
    c.height = height;
    this.masks.set(name, c);
    return c;
  }

  getMask(name) {
    return this.masks.get(name) || null;
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
    if (this.ctx) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.resize();
    if (typeof ResizeObserver !== "undefined" && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
    }
    const loop = (t) => {
      if (!this.running) return;
      const dt = this.lastTime ? (t - this.lastTime) : 0;
      this.lastTime = t;
      this.render(dt, t);
      this.raf = (typeof requestAnimationFrame === "function") ? requestAnimationFrame(loop) : null;
    };
    this.raf = (typeof requestAnimationFrame === "function") ? requestAnimationFrame(loop) : null;
  }

  stop() {
    this.running = false;
    if (this.raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this.raf);
    this.raf = null;
    this.lastTime = 0;
  }

  render(dt, t) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    this.ctx.clearRect(0, 0, w, h);
    const ordered = [...this.layers.entries()].sort((a, b) => a[1].zIndex - b[1].zIndex);
    for (const [, layer] of ordered) {
      try { layer.drawFn(this.ctx, dt, t); } catch (err) { console.error("layer draw error", err); }
    }
  }

  destroy() {
    this.stop();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.layers.clear();
    this.masks.clear();
  }
}
export default RenderEngine;

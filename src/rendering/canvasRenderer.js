/**
 * Stage canvas renderer with animation lifecycle and resize handling.
 */
export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext("2d");
    this.raf = null;
    this.running = false;
    this.lastTime = 0;
    this.drawFn = null;
    this.resizeObserver = null;
  }

  setDraw(fn) {
    this.drawFn = fn;
  }

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.resize();
    if (!this.resizeObserver && "ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
    }
    const loop = (t) => {
      if (!this.running) return;
      const dt = this.lastTime ? t - this.lastTime : 0;
      this.lastTime = t;
      if (this.drawFn) this.drawFn(this.ctx, dt, t);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }
}
export default CanvasRenderer;

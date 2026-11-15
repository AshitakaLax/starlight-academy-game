/**
 * Coloring studio: brush/eraser/stamps, undo/redo, reset, mask clipping, persistence.
 */
export class ColoringStudio {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext?.("2d") || null;
    this.history = [];
    this.future = [];
    this.mask = null;
    this.tool = "brush";
    this.color = "#FF69B4";
    this.size = 8;
  }

  setMask(maskCanvas) {
    this.mask = maskCanvas;
  }

  setTool(tool) { this.tool = tool; }
  setColor(color) { this.color = color; }
  setSize(size) { this.size = size; }

  _insideMask(x, y) {
    if (!this.mask) return true;
    const mctx = this.mask.getContext("2d");
    if (!mctx) return true;
    try {
      const px = mctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      return px[3] > 0;
    } catch (e) {
      return true;
    }
  }

  saveSnapshot() {
    if (!this.canvas) return;
    try {
      this.history.push(this.canvas.toDataURL());
      if (this.history.length > 50) this.history.shift();
      this.future = [];
    } catch (e) {}
  }

  undo() {
    if (!this.history.length || !this.canvas || !this.ctx) return false;
    try {
      this.future.push(this.canvas.toDataURL());
      const prev = this.history.pop();
      const img = new Image();
      img.onload = () => this.ctx.drawImage(img, 0, 0);
      img.src = prev;
      return true;
    } catch (e) {
      return false;
    }
  }

  redo() {
    if (!this.future.length || !this.canvas || !this.ctx) return false;
    try {
      this.history.push(this.canvas.toDataURL());
      const next = this.future.pop();
      const img = new Image();
      img.onload = () => this.ctx.drawImage(img, 0, 0);
      img.src = next;
      return true;
    } catch (e) {
      return false;
    }
  }

  reset(confirmed = false) {
    if (!confirmed) return { ok: false, error: "confirmation required" };
    if (!this.canvas || !this.ctx) return { ok: false, error: "no canvas" };
    this.saveSnapshot();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return { ok: true };
  }

  paint(x, y) {
    if (!this.ctx) return false;
    if (!this._insideMask(x, y)) return false;
    if (this.tool === "eraser") {
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.fillStyle = this.color;
    }
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = "source-over";
    return true;
  }

  stamp(x, y, stampCanvas) {
    if (!this.ctx || !stampCanvas) return false;
    if (!this._insideMask(x, y)) return false;
    this.ctx.drawImage(stampCanvas, x - stampCanvas.width / 2, y - stampCanvas.height / 2);
    return true;
  }

  exportDataUrl() {
    if (!this.canvas) return null;
    try { return this.canvas.toDataURL("image/png"); } catch (e) { return null; }
  }

  static validateTexture(dataUrl) {
    if (typeof dataUrl !== "string") return { ok: false, error: "invalid data url" };
    if (!dataUrl.startsWith("data:image/png;base64,")) return { ok: false, error: "invalid format" };
    if (dataUrl.length > 2_000_000) return { ok: false, error: "texture too large" };
    return { ok: true };
  }
}
export default ColoringStudio;

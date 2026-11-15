/**
 * App lifecycle: boot, pause/resume (visibility), teardown.
 */
export class Lifecycle {
  constructor({ onBoot, onPause, onResume }) {
    this.onBoot = onBoot;
    this.onPause = onPause;
    this.onResume = onResume;
    this.started = false;
  }

  async boot() {
    if (this.started) return;
    this.started = true;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.onPause?.();
      else this.onResume?.();
    });
    await this.onBoot?.();
  }
}
export default Lifecycle;

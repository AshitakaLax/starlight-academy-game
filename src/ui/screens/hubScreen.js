/**
 * Academy hub screen: central navigation.
 */
import { globalBus } from "../../core/state/events.js";
import { selectors } from "../../core/state/selectors.js";

export const hubScreen = {
  async mount(root, params, scope, store) {
    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen hub";
    container.innerHTML = `
      <h1>Starlight Academy</h1>
      <p>Welcome, student! Choose a destination.</p>
      <nav class="hub-dock" aria-label="Hub navigation">
        <button data-dock="1" data-screen="chapter1">Chapter 1</button>
        <button data-dock="6" data-screen="chapter2">Chapter 2</button>
        <button data-dock="2" data-screen="wardrobe">Wardrobe</button>
        <button data-dock="3" data-screen="pets">Pets</button>
        <button data-dock="4" data-screen="shop">Shop</button>
        <button data-dock="5" data-screen="settings">Settings</button>
        <button data-dock="7" data-screen="sidequest">Side Quest</button>
      </nav>
      <section class="hud">
        <span id="gems">Gems: 0</span>
        <span id="sparkles">Sparkles: 0</span>
        <span id="save-status" role="status" aria-live="polite">Save healthy</span>
      </section>
    `;
    root.appendChild(container);

    const updateHud = () => {
      if (!store) return;
      const s = store.getState();
      const g = container.querySelector("#gems");
      const sp = container.querySelector("#sparkles");
      if (g) g.textContent = `Gems: ${selectors.gems(s)}`;
      if (sp) sp.textContent = `Sparkles: ${selectors.sparkles(s)}`;
    };
    updateHud();
    if (scope && store) scope.subscribe(store, updateHud);

    container.querySelectorAll("[data-screen]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const screen = btn.dataset.screen;
        if (store) store.dispatch("screen/change", { screen });
      });
    });

    const status = container.querySelector("#save-status");
    const onError = (p) => { if (status) status.textContent = p?.message || "Save error"; };
    const onOk = () => { if (status) status.textContent = "Save healthy"; };
    globalBus.on("save:error", onError);
    globalBus.on("save:ok", onOk);
    container._saveUnsubs = [() => globalBus.off("save:error", onError), () => globalBus.off("save:ok", onOk)];
  },
  unmount(root) {
    const container = root.querySelector(".hub");
    if (container && container._saveUnsubs) {
      container._saveUnsubs.forEach((fn) => { try { fn(); } catch (e) {} });
    }
  },
};
export default hubScreen;

/**
 * Settings screen: text scale, reduced motion, volumes, narration toggle.
 */
import { applySettings } from "../shell.js";

export const settingsScreen = {
  async mount(root, params, scope, store) {
    const settings = store ? store.getState().settings : {};
    root.innerHTML = "";
    const container = document.createElement("div");
    container.className = "screen settings";
    container.innerHTML = `
      <h1>Settings</h1>
      <label>Text scale
        <input type="range" min="0.8" max="1.4" step="0.1" value="${settings.textScale ?? 1}" data-key="textScale" />
      </label>
      <label>
        <input type="checkbox" data-key="reducedMotion" ${settings.reducedMotion ? "checked" : ""} /> Reduced motion
      </label>
      <label>Master volume
        <input type="range" min="0" max="1" step="0.05" value="${settings.masterVolume ?? 0.8}" data-key="masterVolume" />
      </label>
      <label>Music volume
        <input type="range" min="0" max="1" step="0.05" value="${settings.musicVolume ?? 0.6}" data-key="musicVolume" />
      </label>
      <label>SFX volume
        <input type="range" min="0" max="1" step="0.05" value="${settings.sfxVolume ?? 0.8}" data-key="sfxVolume" />
      </label>
      <label>
        <input type="checkbox" data-key="narrationEnabled" ${settings.narrationEnabled ? "checked" : ""} /> Narration
      </label>
      <button data-action="back">Back</button>
    `;
    root.appendChild(container);

    const audio = (typeof window !== "undefined") ? window.__starlightAudio : null;
    const narration = (typeof window !== "undefined") ? window.__starlightNarration : null;
    const update = (key, value) => {
      if (!store) return;
      store.dispatch("settings/update", { [key]: value });
      applySettings(store.getState().settings, audio);
      if (key === "narrationEnabled" && narration) narration.setEnabled(value);
    };
    if (narration && settings.narrationEnabled !== undefined) narration.setEnabled(settings.narrationEnabled);

    container.querySelectorAll("input").forEach((input) => {
      const key = input.dataset.key;
      const handler = () => {
        const val = input.type === "checkbox" ? input.checked : Number(input.value);
        update(key, val);
      };
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    });

    const back = container.querySelector('[data-action="back"]');
    if (back) back.addEventListener("click", () => {
      if (store) store.dispatch("screen/change", { screen: "hub" });
    });
  },
  unmount() {},
};
export default settingsScreen;

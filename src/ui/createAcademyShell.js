import { selectUiPreferences } from "./uiPreferences.js";
import { selectAudioSettings } from "../systems/audio/audioSettings.js";
import { selectNarrationSettings } from "../systems/narration/narrationSettings.js";
import { selectEconomy } from "../systems/economy/economyState.js";
import { renderColoringCanvas } from "../gameplay/coloring/renderColoringCanvas.js";
import { createAcademyScene } from "../rendering/scenes/createAcademyScene.js";

const DESTINATIONS = Object.freeze({
  chapters: Object.freeze({
    kicker: "YOUR LEARNING JOURNEY",
    title: "A world of wonder is waiting.",
    description: "Explore ten magical chapters filled with curious discoveries, creative challenges, and room to grow at your own pace.",
    heroTitle: "Every great adventure begins with a little wonder.",
    heroDescription: "Your chapter path is taking shape. Each adventure will bring a new story, a fresh idea to explore, and a chance to let your talents shine.",
    button: "Explore the chapter path"
  }),
  gymnastics: Object.freeze({
    kicker: "MOVEMENT & MUSIC",
    title: "Find your rhythm. Make it shine.",
    description: "A playful studio for movement, timing, and graceful tracing is part of the academy adventure.",
    heroTitle: "Move to the beat of your own magic.",
    heroDescription: "The gymnastics studio will pair visual movement paths with musical beats. Practice, keep going, and celebrate your progress.",
    button: "Return to the chapter path"
  }),
  pets: Object.freeze({
    kicker: "MAGICAL COMPANIONS",
    title: "A little friendship goes a long way.",
    description: "Meet three extraordinary companions, each with its own personality, progress, and special spark.",
    heroTitle: "Your magical companions are on their way.",
    heroDescription: "The academy is preparing a Pegasus, a Phoenix, and a Nymph Kitten. Caring for a companion will always be optional and full of positive moments.",
    button: "Return to the chapter path"
  }),
  wardrobe: Object.freeze({
    kicker: "YOUR CREATIVE STUDIO",
    title: "Dream up a look that feels like you.",
    description: "A place for color, personal style, and creative touches is waiting in the academy.",
    heroTitle: "Make something wonderfully yours.",
    heroDescription: "The wardrobe studio will bring together outfit choices and creative customization, with special pieces to discover along your journey.",
    button: "Return to the chapter path"
  }),
  quests: Object.freeze({
    kicker: "LITTLE EXTRA ADVENTURES",
    title: "There is always more to discover.",
    description: "Optional side quests add playful ways to practice, experiment, and explore beyond the main chapter path.",
    heroTitle: "Follow a curious little side path.",
    heroDescription: "Twenty side quests are planned across the academy. They will offer extra challenges and discoveries without ever blocking the main adventure.",
    button: "Return to the chapter path"
  })
});

const MARKUP = String.raw`<div class="academy-shell" data-text-scale="normal" data-reduced-motion="false">
<a class="skip-link" href="#academy-main">Skip to academy content</a>
<div class="academy-frame" data-application-view>
<header class="academy-topbar">
  <div class="academy-brand"><div class="academy-brand-emblem" data-academy-emblem aria-hidden="true"></div><div>
    <p class="academy-overline">A PLACE TO LEARN, MOVE &amp; IMAGINE</p><p class="academy-brand-name">Starlight Academy</p><p class="academy-brand-subtitle">Studio of Magic &amp; Motion</p>
  </div></div>
  <div class="academy-topbar-actions">
    <div class="academy-currency-chip" aria-label="Star Gems are spendable rewards"><span class="currency-glyph gems" aria-hidden="true">✦</span><span><strong>Star Gems <span data-currency-balance="starGems">0</span></strong><small>Spendable rewards</small></span></div>
    <div class="academy-currency-chip sparkle-chip" aria-label="Starlight Sparkles track mastery and achievements"><span class="currency-glyph sparkles" aria-hidden="true">✧</span><span><strong>Starlight Sparkles <span data-currency-balance="starlightSparkles">0</span></strong><small>Mastery &amp; achievements</small></span></div>
    <button class="settings-trigger" type="button" data-game-action="ui/overlay-opened" data-game-payload='{"overlayId":"settings"}' aria-haspopup="dialog" aria-controls="academy-settings"><span aria-hidden="true">⚙</span><span>Settings</span></button>
  </div>
</header>
<div class="academy-workspace">
  <nav class="academy-dock" aria-label="Academy destinations">
    <p class="dock-heading">YOUR STUDIO</p>
    <button class="dock-item" type="button" data-dock-id="chapters" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"chapters"}' aria-current="page"><span class="dock-icon" aria-hidden="true">✦</span><span>Chapters</span><kbd>1</kbd></button>
    <button class="dock-item" type="button" data-dock-id="gymnastics" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"gymnastics"}'><span class="dock-icon" aria-hidden="true">✧</span><span>Gymnastics</span><kbd>2</kbd></button>
    <button class="dock-item" type="button" data-dock-id="pets" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"pets"}'><span class="dock-icon" aria-hidden="true">♡</span><span>Pets</span><kbd>3</kbd></button>
    <button class="dock-item" type="button" data-dock-id="wardrobe" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"wardrobe"}'><span class="dock-icon" aria-hidden="true">❀</span><span>Wardrobe</span><kbd>4</kbd></button>
    <button class="dock-item" type="button" data-dock-id="quests" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"quests"}'><span class="dock-icon" aria-hidden="true">✧</span><span>Quests</span><kbd>5</kbd></button>
    <div class="dock-bottom-note"><span aria-hidden="true">✦</span><p>Your pace.<br><strong>Your own kind of magic.</strong></p></div>
  </nav>
  <main class="academy-main" id="academy-main" tabindex="-1" aria-labelledby="screen-title">
    <div class="academy-main-scroll">
      <div class="academy-welcome-row"><div><p class="academy-overline" data-screen-kicker>YOUR LEARNING JOURNEY</p><h1 id="screen-title" data-screen-title>A world of wonder is waiting.</h1><p class="screen-description" data-screen-description>Explore, practice, create, and grow at your own pace.</p></div>
        <div class="welcome-seal" aria-label="A new day of discovery"><span aria-hidden="true">☼</span><small>READY TO<br>EXPLORE</small></div>
      </div>
      <section class="academy-hero" aria-labelledby="hero-title">
        <div class="hero-copy"><p class="hero-overline"><span aria-hidden="true">✦</span> LET YOUR CURIOSITY SHINE</p><h2 id="hero-title" data-hero-title>Every great adventure begins with a little wonder.</h2><p data-hero-description>Your chapter path is taking shape. New discoveries and creative challenges are waiting.</p>
          <button class="primary-action" type="button" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"chapters"}'><span data-hero-button>Explore the chapter path</span><span aria-hidden="true">↗</span></button>
        </div>
        <div class="hero-art" aria-hidden="true"><canvas class="academy-scene-canvas" data-academy-scene aria-hidden="true"></canvas><div class="hero-moon"></div><span class="hero-star star-one">✦</span><span class="hero-star star-two">✧</span><span class="hero-star star-three">✦</span><span class="hero-star star-four">✧</span><div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div><div class="hero-crest" data-hero-crest></div><div class="hero-caption">DREAM • DISCOVER • SHINE</div></div>
      </section>
      <section class="quick-paths" aria-labelledby="quick-paths-title">
        <div class="section-heading-row"><div><p class="academy-overline">CHOOSE YOUR NEXT STEP</p><h2 id="quick-paths-title">Explore the academy</h2></div><span aria-hidden="true">✧</span></div>
        <div class="path-card-grid">
          <button class="path-card path-chapters" type="button" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"chapters"}'><span class="path-card-icon" aria-hidden="true">✦</span><span class="path-card-title">Chapter adventures</span><span class="path-card-note">Stories &amp; discoveries</span><span class="path-card-arrow" aria-hidden="true">↗</span></button>
          <button class="path-card path-gymnastics" type="button" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"gymnastics"}'><span class="path-card-icon" aria-hidden="true">✧</span><span class="path-card-title">Gymnastics studio</span><span class="path-card-note">Movement &amp; music</span><span class="path-card-arrow" aria-hidden="true">↗</span></button>
          <button class="path-card path-pets" type="button" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"pets"}'><span class="path-card-icon" aria-hidden="true">♡</span><span class="path-card-title">Magical companions</span><span class="path-card-note">Three friends to meet</span><span class="path-card-arrow" aria-hidden="true">↗</span></button>
          <button class="path-card path-wardrobe" type="button" data-game-action="hub/dock-selected" data-game-payload='{"dockId":"wardrobe"}'><span class="path-card-icon" aria-hidden="true">❀</span><span class="path-card-title">Creative wardrobe</span><span class="path-card-note">Style &amp; imagination</span><span class="path-card-arrow" aria-hidden="true">↗</span></button>
        </div>
      </section>
      <section class="wardrobe-panel" data-wardrobe-panel hidden aria-labelledby="wardrobe-panel-title">
        <div class="wardrobe-panel-heading">
          <div><p class="academy-overline">YOUR PERSONAL STYLE</p><h2 id="wardrobe-panel-title">Your wardrobe</h2><p>Choose an item you own, save your favorite look, or collect a new piece on your adventures.</p></div>
          <div class="wardrobe-heading-actions">
            <span class="wardrobe-heading-star" aria-hidden="true">✧</span>
            <button class="wardrobe-primary-action" type="button" data-coloring-action="open">Open Coloring Studio</button>
          </div>
        </div>
        <div class="wardrobe-equipped-wrap"><h3>Currently wearing</h3><div class="wardrobe-equipped" data-wardrobe-equipped></div></div>
        <div class="wardrobe-inventory-wrap"><div class="wardrobe-items-heading"><div><h3>Clothing &amp; accessories</h3><p>Starter pieces are ready to wear. Chapter rewards and optional shop pieces unlock as you play.</p></div></div><div class="wardrobe-inventory" data-wardrobe-inventory></div></div>
        <p class="wardrobe-status" data-wardrobe-status role="status" aria-live="polite">Your starter outfit is ready.</p>
      </section>
      <section class="coloring-panel" data-coloring-panel hidden aria-labelledby="coloring-panel-title">
        <div class="coloring-panel-heading">
          <button class="wardrobe-secondary-action" type="button" data-coloring-action="back">← Back to wardrobe</button>
          <div><p class="academy-overline">YOUR CREATIVE STUDIO</p><h2 id="coloring-panel-title">Coloring Studio</h2><p>Paint inside the garment, add little stamps, and save a look that is wonderfully yours.</p></div>
        </div>
        <div class="coloring-studio-layout">
          <div class="coloring-preview-column">
            <label class="coloring-template-choice">Garment template
              <select data-coloring-template aria-label="Choose a garment template"></select>
            </label>
            <div class="coloring-canvas-frame">
              <canvas class="coloring-canvas" data-coloring-canvas width="256" height="320" aria-label="Garment painting canvas" role="img"></canvas>
            </div>
            <p class="coloring-canvas-help">Use your mouse to paint. Your color stays inside the garment shape.</p>
          </div>
          <div class="coloring-tools">
            <section class="coloring-tool-group" aria-labelledby="coloring-colors-title">
              <h3 id="coloring-colors-title">Choose a color</h3>
              <div class="coloring-palette" data-coloring-palette>
                <button type="button" data-coloring-color="#b78bd2" aria-label="Lavender" aria-pressed="true" style="--swatch:#b78bd2"></button>
                <button type="button" data-coloring-color="#e89cbe" aria-label="Rose pink" aria-pressed="false" style="--swatch:#e89cbe"></button>
                <button type="button" data-coloring-color="#86abc9" aria-label="Sky blue" aria-pressed="false" style="--swatch:#86abc9"></button>
                <button type="button" data-coloring-color="#8ebca7" aria-label="Sage green" aria-pressed="false" style="--swatch:#8ebca7"></button>
                <button type="button" data-coloring-color="#e7bd72" aria-label="Golden yellow" aria-pressed="false" style="--swatch:#e7bd72"></button>
                <button type="button" data-coloring-color="#d98975" aria-label="Coral" aria-pressed="false" style="--swatch:#d98975"></button>
                <button type="button" data-coloring-color="#8178b6" aria-label="Periwinkle" aria-pressed="false" style="--swatch:#8178b6"></button>
                <button type="button" data-coloring-color="#4e4560" aria-label="Deep plum" aria-pressed="false" style="--swatch:#4e4560"></button>
              </div>
            </section>
            <section class="coloring-tool-group" aria-labelledby="coloring-tools-title">
              <h3 id="coloring-tools-title">Tools</h3>
              <div class="coloring-tool-buttons">
                <button type="button" data-coloring-tool="brush" aria-pressed="true">✎ Brush</button>
                <button type="button" data-coloring-tool="eraser" aria-pressed="false">⌫ Eraser</button>
              </div>
              <label class="coloring-size-choice">Brush size
                <select data-coloring-brush-size>
                  <option value="1">Fine</option>
                  <option value="3" selected>Medium</option>
                  <option value="6">Wide</option>
                  <option value="9">Extra wide</option>
                </select>
              </label>
            </section>
            <section class="coloring-tool-group" aria-labelledby="coloring-stamps-title">
              <h3 id="coloring-stamps-title">Stamps</h3>
              <div class="coloring-stamp-buttons">
                <button type="button" data-coloring-stamp="star">✦ Star</button>
                <button type="button" data-coloring-stamp="heart">♡ Heart</button>
                <button type="button" data-coloring-stamp="flower">✿ Flower</button>
              </div>
            </section>
            <section class="coloring-tool-group" aria-label="Design history">
              <h3>Make it just right</h3>
              <div class="coloring-history-buttons">
                <button type="button" data-coloring-action="undo" disabled>↶ Undo</button>
                <button type="button" data-coloring-action="redo" disabled>↷ Redo</button>
                <button type="button" data-coloring-action="reset-request">Reset design</button>
              </div>
              <div class="coloring-reset-confirm" data-coloring-reset-confirm hidden role="group" aria-label="Confirm design reset">
                <p>Clear this design and start again?</p>
                <button type="button" data-coloring-action="reset-confirm">Yes, reset</button>
                <button type="button" data-coloring-action="reset-cancel">Keep my design</button>
              </div>
            </section>
            <p class="coloring-status" data-coloring-status role="status" aria-live="polite">Your design saves automatically as you paint.</p>
          </div>
        </div>
      </section>
      <p class="narration-caption" data-narration-text-slot hidden role="status" aria-live="polite"></p>
    </div>
  </main>
  <aside class="academy-rail" aria-label="Academy overview">
    <section class="rail-card journey-card"><p class="academy-overline">YOUR ADVENTURE</p><h2>A constellation of possibilities</h2>
      <div class="journey-stat"><span class="stat-dot" aria-hidden="true"></span><span>Chapter adventures</span><strong>10</strong></div>
      <div class="journey-stat"><span class="stat-dot quest-dot" aria-hidden="true"></span><span>Optional side quests</span><strong>20</strong></div>
      <div class="rail-divider"></div><p class="rail-footnote">Every chapter brings something new to discover. Side quests are always optional.</p>
    </section>
    <section class="rail-card companion-card"><div class="companion-stars" aria-hidden="true">✦　✧　✦</div><p class="academy-overline">FRIENDS TO MEET</p><h2>Magic is better together.</h2>
      <div class="companion-row"><span class="companion-symbol" aria-hidden="true">♞</span><span>Pegasus</span></div>
      <div class="companion-row"><span class="companion-symbol phoenix" aria-hidden="true">✹</span><span>Phoenix</span></div>
      <div class="companion-row"><span class="companion-symbol nymph" aria-hidden="true">♡</span><span>Nymph Kitten</span></div>
      <p class="companion-note">Each companion will have its own story and progress.</p>
    </section>
  </aside>
</div>
<footer class="academy-footer"><span>✧ STAY CURIOUS ✧</span><div data-save-health-slot></div><span>Made for learning, movement &amp; imagination</span></footer>
</div>
<div class="settings-backdrop" data-settings-backdrop hidden>
  <section class="settings-dialog" id="academy-settings" role="dialog" aria-modal="true" aria-labelledby="settings-title" aria-describedby="settings-description" tabindex="-1" data-settings-dialog>
    <header class="settings-header"><div><p class="academy-overline">MAKE YOUR STUDIO COMFORTABLE</p><h2 id="settings-title">Academy settings</h2><p id="settings-description">Adjust the way Starlight Academy looks and feels.</p></div>
      <button class="icon-close" type="button" aria-label="Close settings" data-game-context="settings" data-game-action="ui/overlay-closed" data-game-payload='{"overlayId":"settings"}'>×</button>
    </header>
    <div class="settings-content">
      <section class="setting-card" aria-labelledby="text-size-heading"><div><h3 id="text-size-heading">Text size</h3><p>Choose a comfortable reading size.</p></div>
        <div class="setting-options" role="group" aria-label="Text size">
          <button type="button" data-text-scale-choice="small" data-game-context="settings" data-game-action="settings/preferences-updated" data-game-payload='{"textScale":"small"}'>Small</button>
          <button type="button" data-text-scale-choice="normal" data-game-context="settings" data-game-action="settings/preferences-updated" data-game-payload='{"textScale":"normal"}'>Regular</button>
          <button type="button" data-text-scale-choice="large" data-game-context="settings" data-game-action="settings/preferences-updated" data-game-payload='{"textScale":"large"}'>Large</button>
        </div>
      </section>
      <section class="setting-card" aria-labelledby="motion-heading"><div><h3 id="motion-heading">Reduced motion</h3><p>Use gentler transitions and fewer decorative movements.</p></div>
        <button class="toggle-setting" type="button" data-motion-toggle data-game-context="settings" data-game-action="settings/preferences-updated" data-game-payload='{"reducedMotion":true}' aria-pressed="false">Off</button>
      </section>
      <section class="setting-card audio-settings" aria-labelledby="audio-heading">
        <div class="audio-settings-heading"><h3 id="audio-heading">Sounds &amp; music</h3><p>Choose how much music and magic you hear.</p></div>
        <div class="audio-mixer">
          <label class="audio-level"><span>Master volume</span><output data-audio-value="masterVolume">70%</output><input type="range" min="0" max="100" step="1" value="70" data-audio-slider="masterVolume" aria-label="Master volume"></label>
          <label class="audio-level"><span>Background music</span><output data-audio-value="musicVolume">24%</output><input type="range" min="0" max="100" step="1" value="24" data-audio-slider="musicVolume" aria-label="Background music volume"></label>
          <label class="audio-level"><span>Sound effects</span><output data-audio-value="sfxVolume">55%</output><input type="range" min="0" max="100" step="1" value="55" data-audio-slider="sfxVolume" aria-label="Sound effects volume"></label>
          <button class="toggle-setting audio-mute" type="button" data-ui-action="toggle-audio-mute" data-audio-mute aria-pressed="false">Mute sound</button>
        </div>
        <p class="audio-status" data-audio-status-slot role="status" aria-live="polite">Audio begins after your first interaction.</p>
      </section>
      <section class="setting-card narration-settings" aria-labelledby="narration-heading">
        <div class="narration-settings-heading"><h3 id="narration-heading">Read-aloud narration</h3><p>Optional spoken guidance. Every instruction is also shown on screen.</p></div>
        <div class="narration-controls">
          <button class="toggle-setting narration-toggle" type="button" data-ui-action="toggle-narration" data-narration-toggle aria-pressed="false">Off</button>
          <label class="narration-choice">Voice
            <select data-narration-voice aria-label="Narration voice"><option value="">Default browser voice</option></select>
          </label>
          <label class="narration-choice">Speaking speed <output data-narration-rate-value>1.00×</output>
            <input type="range" min="0.8" max="1.2" step="0.05" value="1" data-narration-rate aria-label="Narration speaking speed">
          </label>
          <button class="primary-action narration-preview" type="button" data-ui-action="preview-narration" data-narration-preview disabled>Hear welcome sample</button>
        </div>
        <p class="narration-status" data-narration-status-slot role="status" aria-live="polite">Narration is optional and turned off.</p>
      </section>
      <section class="setting-card save-tools" aria-labelledby="save-tools-heading"><div><h3 id="save-tools-heading">Progress &amp; backups</h3><p>Keep a backup of your academy progress or restore one from a JSON save file.</p></div>
        <div class="save-tool-actions"><button type="button" data-ui-action="export-save">Export progress</button><button type="button" data-ui-action="choose-import">Choose import file</button>
          <input type="file" accept=".json,application/json" data-save-import-input hidden aria-label="Choose a Starlight Academy save file">
          <button type="button" class="confirm-import" data-ui-action="confirm-import" hidden>Confirm import</button>
        </div>
        <p class="settings-message" role="status" aria-live="polite" data-settings-message>Importing a backup will never happen without your confirmation.</p>
      </section>
    </div>
    <footer class="settings-footer"><span>Changes are saved with your academy progress.</span><button class="primary-action compact-action" type="button" data-game-context="settings" data-game-action="ui/overlay-closed" data-game-payload='{"overlayId":"settings"}'>Done</button></footer>
  </section>
</div>
</div>`;

function requireElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error("Academy UI is missing required element: " + selector);
  return element;
}

/** Compose the semantic academy hub and accessible settings dialog. */
export function createAcademyShell({
  root, store, saveService, saveStatusElement = null, audioStatusElement = null, narrationService = null,
  narrationStatusElement = null, narrationTextElement = null, wardrobeService = null,
  coloringService = null, garmentTemplateRegistry = null, emblemSvg = "",
  documentRef = globalThis.document, windowRef = globalThis.window
} = {}) {
  if (!root || typeof root.querySelector !== "function" || typeof root.addEventListener !== "function") {
    throw new TypeError("createAcademyShell requires a DOM root element.");
  }
  if (!store || typeof store.getState !== "function" || typeof store.subscribe !== "function") {
    throw new TypeError("createAcademyShell requires a game store.");
  }
  if (!saveService || typeof saveService.export !== "function"
      || typeof saveService.previewImport !== "function" || typeof saveService.import !== "function") {
    throw new TypeError("createAcademyShell requires the save service.");
  }
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new TypeError("createAcademyShell requires a document reference.");
  }

  root.innerHTML = MARKUP;
  const shell = requireElement(root, ".academy-shell");
  const applicationView = requireElement(root, "[data-application-view]");
  const settingsBackdrop = requireElement(root, "[data-settings-backdrop]");
  const settingsDialog = requireElement(root, "[data-settings-dialog]");
  const importInput = requireElement(root, "[data-save-import-input]");
  const importConfirm = requireElement(root, '[data-ui-action="confirm-import"]');
  const settingsMessage = requireElement(root, "[data-settings-message]");
  const saveHealthSlot = requireElement(root, "[data-save-health-slot]");
  if (emblemSvg) {
    requireElement(root, "[data-academy-emblem]").innerHTML = emblemSvg;
    requireElement(root, "[data-hero-crest]").innerHTML = emblemSvg;
  }
  if (saveStatusElement) saveHealthSlot.append(saveStatusElement);
  const audioStatusSlot = requireElement(root, "[data-audio-status-slot]");
  if (audioStatusElement) audioStatusSlot.replaceWith(audioStatusElement);
  const narrationStatusSlot = requireElement(root, "[data-narration-status-slot]");
  if (narrationStatusElement) narrationStatusSlot.replaceWith(narrationStatusElement);
  const narrationTextSlot = requireElement(root, "[data-narration-text-slot]");
  if (narrationTextElement) {
    narrationTextElement.dataset.narrationTextSlot = "";
    narrationTextSlot.replaceWith(narrationTextElement);
  }

  const panel = {
    kicker: requireElement(root, "[data-screen-kicker]"),
    title: requireElement(root, "[data-screen-title]"),
    description: requireElement(root, "[data-screen-description]"),
    heroTitle: requireElement(root, "[data-hero-title]"),
    heroDescription: requireElement(root, "[data-hero-description]"),
    heroButton: requireElement(root, "[data-hero-button]"),
    hero: requireElement(root, ".academy-hero"),
    quickPaths: requireElement(root, ".quick-paths"),
    wardrobePanel: requireElement(root, "[data-wardrobe-panel]"),
    wardrobeEquipped: requireElement(root, "[data-wardrobe-equipped]"),
    wardrobeInventory: requireElement(root, "[data-wardrobe-inventory]"),
    wardrobeStatus: requireElement(root, "[data-wardrobe-status]"),
    coloringPanel: requireElement(root, "[data-coloring-panel]"),
    coloringCanvas: requireElement(root, "[data-coloring-canvas]"),
    coloringTemplate: requireElement(root, "[data-coloring-template]"),
    coloringPalette: requireElement(root, "[data-coloring-palette]"),
    coloringBrushSize: requireElement(root, "[data-coloring-brush-size]"),
    coloringResetConfirm: requireElement(root, "[data-coloring-reset-confirm]"),
    coloringStatus: requireElement(root, "[data-coloring-status]")
  };
  if (wardrobeService !== null
      && (typeof wardrobeService.getPreview !== "function"
        || typeof wardrobeService.purchaseItem !== "function"
        || typeof wardrobeService.equipItem !== "function"
        || typeof wardrobeService.unequipSlot !== "function")) {
    throw new TypeError("wardrobeService must expose wardrobe inventory and equipment operations.");
  }
  if (coloringService !== null
      && (typeof coloringService.getSnapshot !== "function"
        || typeof coloringService.selectTemplate !== "function"
        || typeof coloringService.beginStroke !== "function"
        || typeof coloringService.continueStroke !== "function"
        || typeof coloringService.endStroke !== "function"
        || typeof coloringService.addStamp !== "function"
        || typeof coloringService.undo !== "function"
        || typeof coloringService.redo !== "function"
        || typeof coloringService.resetDesign !== "function")) {
    throw new TypeError("coloringService must expose the garment editor operations.");
  }
  if (garmentTemplateRegistry !== null && typeof garmentTemplateRegistry.list !== "function") {
    throw new TypeError("garmentTemplateRegistry must expose list().");
  }
  const settingsTrigger = requireElement(root, ".settings-trigger");
  const narrationVoiceSelect = requireElement(root, "[data-narration-voice]");
  const academyScene = createAcademyScene({ canvas: requireElement(root, "[data-academy-scene]"), documentRef, windowRef });
  let pendingImportText = null;
  let previousFocus = null;
  let lastOverlayId = store.getState()?.ui?.activeOverlayId ?? null;
  let disposed = false;
  let coloringOpen = false;
  let selectedStamp = null;
  let activePointerId = null;
  let coloringStatusMessage = "Your design saves automatically as you paint.";

  function setSettingsMessage(message, kind = "info") {
    settingsMessage.textContent = message;
    settingsMessage.dataset.kind = kind;
  }

  function focusableElements() {
    return [...settingsDialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
  }

  function renderNarrationVoices(voices = narrationService?.getVoices?.() ?? []) {
    const settings = selectNarrationSettings(store.getState());
    const options = [];
    const defaultOption = documentRef.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Default browser voice";
    options.push(defaultOption);
    const seen = new Set([""]);
    for (const voice of voices) {
      if (!voice || typeof voice.voiceURI !== "string" || seen.has(voice.voiceURI)) continue;
      seen.add(voice.voiceURI);
      const option = documentRef.createElement("option");
      option.value = voice.voiceURI;
      const voiceName = voice.name || voice.voiceURI;
      option.textContent = voiceName + (voice.lang ? " (" + voice.lang + ")" : "") + (voice.default ? " — default" : "");
      options.push(option);
    }
    if (settings.voiceURI && !seen.has(settings.voiceURI)) {
      const missingOption = documentRef.createElement("option");
      missingOption.value = settings.voiceURI;
      missingOption.textContent = "Saved voice unavailable (using browser default)";
      options.push(missingOption);
    }
    narrationVoiceSelect.replaceChildren(...options);
    narrationVoiceSelect.value = settings.voiceURI;
  }

  function renderWardrobe(statusMessage = null) {
    if (!wardrobeService) {
      panel.wardrobeEquipped.replaceChildren();
      panel.wardrobeInventory.replaceChildren();
      panel.wardrobeStatus.textContent = "Wardrobe inventory will be available when the wardrobe service is connected.";
      return;
    }
    const preview = wardrobeService.getPreview();
    const fragment = documentRef.createDocumentFragment();
    const slotLabels = {
      head: "Headwear",
      outfit: "Outfit",
      footwear: "Footwear",
      accessory: "Accessory"
    };
    for (const entry of preview.equipped) {
      const card = documentRef.createElement("div");
      card.className = "wardrobe-slot-card";
      const label = documentRef.createElement("span");
      label.className = "wardrobe-slot-label";
      label.textContent = slotLabels[entry.slot] ?? entry.slot;
      const itemName = documentRef.createElement("strong");
      itemName.textContent = entry.item?.title ?? "Nothing equipped";
      const symbol = documentRef.createElement("span");
      symbol.className = "wardrobe-slot-symbol";
      symbol.textContent = entry.item?.symbol ?? "—";
      card.append(symbol, label, itemName);
      if (entry.item) {
        const remove = documentRef.createElement("button");
        remove.type = "button";
        remove.className = "wardrobe-secondary-action";
        remove.dataset.wardrobeAction = "unequip";
        remove.dataset.slot = entry.slot;
        remove.textContent = "Take off";
        card.append(remove);
      }
      fragment.append(card);
    }
    panel.wardrobeEquipped.replaceChildren(fragment);

    const inventoryFragment = documentRef.createDocumentFragment();
    for (const item of preview.inventory) {
      const card = documentRef.createElement("article");
      card.className = "wardrobe-item-card";
      card.dataset.itemState = item.status;
      card.dataset.itemTheme = item.theme;
      const symbol = documentRef.createElement("span");
      symbol.className = "wardrobe-item-symbol";
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = item.symbol;
      const slot = documentRef.createElement("span");
      slot.className = "wardrobe-item-slot";
      slot.textContent = slotLabels[item.slot] ?? item.slot;
      const title = documentRef.createElement("h4");
      title.textContent = item.title;
      const description = documentRef.createElement("p");
      description.textContent = item.description;
      card.append(symbol, slot, title, description);

      const action = documentRef.createElement("button");
      action.type = "button";
      if (item.owned && item.equipped) {
        action.className = "wardrobe-secondary-action";
        action.disabled = true;
        action.textContent = "Wearing";
      } else if (item.owned) {
        action.className = "wardrobe-primary-action";
        action.dataset.wardrobeAction = "equip";
        action.dataset.itemId = item.id;
        action.textContent = "Wear item";
      } else if (item.acquisition.type === "purchase") {
        action.className = "wardrobe-primary-action";
        action.dataset.wardrobeAction = "purchase";
        action.dataset.itemId = item.id;
        action.disabled = !item.available;
        action.textContent = "Buy · " + item.acquisition.priceStarGems + " Star Gems";
      } else {
        action.className = "wardrobe-secondary-action";
        action.disabled = true;
        const sourceId = item.acquisition.sourceId ?? "";
        const sourceName = item.acquisition.type === "chapter"
          ? sourceId.replace(/^chapter-/, "Chapter ")
          : sourceId.replace(/^quest-/, "Quest ");
        action.textContent = "Earn in " + sourceName;
      }
      card.append(action);
      inventoryFragment.append(card);
    }
    panel.wardrobeInventory.replaceChildren(inventoryFragment);

    const gems = preview.inventory.find((item) => item.acquisition.type === "purchase")?.available;
    panel.wardrobeStatus.textContent = statusMessage ?? (gems === false
      ? "Collect Star Gems through academy rewards to shop for optional cosmetics."
      : "Your starter outfit is ready. Select any owned item to wear it.");
  }

  function renderColoring() {
    if (!coloringService) {
      panel.coloringStatus.textContent = "The Coloring Studio is not connected.";
      return;
    }
    const snapshot = coloringService.getSnapshot();
    if (garmentTemplateRegistry) {
      if (panel.coloringTemplate.options.length !== garmentTemplateRegistry.list().length) {
        const options = garmentTemplateRegistry.list().map((template) => {
          const option = documentRef.createElement("option");
          option.value = template.id;
          option.textContent = template.title;
          return option;
        });
        panel.coloringTemplate.replaceChildren(...options);
      }
    }
    panel.coloringTemplate.value = snapshot.template.id;
    panel.coloringTemplate.disabled = !garmentTemplateRegistry;
    renderColoringCanvas(panel.coloringCanvas, snapshot, { documentRef });
    for (const button of panel.coloringPalette.querySelectorAll("[data-coloring-color]")) {
      button.setAttribute("aria-pressed", String(button.dataset.coloringColor === snapshot.selectedColor));
    }
    for (const button of root.querySelectorAll("[data-coloring-tool]")) {
      button.setAttribute("aria-pressed", String(button.dataset.coloringTool === snapshot.selectedTool));
    }
    panel.coloringBrushSize.value = String(snapshot.brushSize);
    const undo = root.querySelector('[data-coloring-action="undo"]');
    const redo = root.querySelector('[data-coloring-action="redo"]');
    if (undo) undo.disabled = !snapshot.canUndo;
    if (redo) redo.disabled = !snapshot.canRedo;
    panel.coloringStatus.textContent = selectedStamp
      ? "Click or tap the garment to place your " + selectedStamp + " stamp."
      : coloringStatusMessage;
  }

  function handleColoringAction(event) {
    const actionElement = event.target?.closest?.(
      "[data-coloring-action], [data-coloring-tool], [data-coloring-color], [data-coloring-stamp]"
    );
    if (!actionElement || !root.contains(actionElement) || !coloringService) return false;
    try {
      if (actionElement.dataset.coloringAction === "open") {
        coloringOpen = true;
        selectedStamp = null;
        render();
        panel.coloringCanvas.focus?.();
      } else if (actionElement.dataset.coloringAction === "back") {
        coloringOpen = false;
        selectedStamp = null;
        panel.coloringResetConfirm.hidden = true;
        render();
      } else if (actionElement.dataset.coloringAction === "undo") {
        const result = coloringService.undo();
        coloringStatusMessage = result.changed ? "Last change undone." : "There is nothing to undo yet.";
        renderColoring();
      } else if (actionElement.dataset.coloringAction === "redo") {
        const result = coloringService.redo();
        coloringStatusMessage = result.changed ? "Change restored." : "There is nothing to redo yet.";
        renderColoring();
      } else if (actionElement.dataset.coloringAction === "reset-request") {
        selectedStamp = null;
        panel.coloringResetConfirm.hidden = false;
        panel.coloringStatus.textContent = "This will clear the current garment design. Confirm only when you're ready.";
      } else if (actionElement.dataset.coloringAction === "reset-confirm") {
        const result = coloringService.resetDesign({ confirmed: true });
        panel.coloringResetConfirm.hidden = true;
        coloringStatusMessage = result.reset ? "Design cleared. You can still undo this reset." : "This design is already blank.";
        renderColoring();
      } else if (actionElement.dataset.coloringAction === "reset-cancel") {
        panel.coloringResetConfirm.hidden = true;
        coloringStatusMessage = "Your design has been kept.";
        renderColoring();
      } else if (actionElement.dataset.coloringTool) {
        coloringService.setTool(actionElement.dataset.coloringTool);
        selectedStamp = null;
        coloringStatusMessage = actionElement.dataset.coloringTool === "eraser"
          ? "Eraser selected. Drag over the garment to remove color."
          : "Brush selected. Drag over the garment to paint.";
        renderColoring();
      } else if (actionElement.dataset.coloringColor) {
        coloringService.setColor(actionElement.dataset.coloringColor);
        selectedStamp = null;
        coloringStatusMessage = "Color selected. Paint or place a stamp on the garment.";
        renderColoring();
      } else if (actionElement.dataset.coloringStamp) {
        coloringService.setTool("brush");
        selectedStamp = actionElement.dataset.coloringStamp;
        coloringStatusMessage = "Choose a place on the garment for your stamp.";
        renderColoring();
      }
    } catch (error) {
      coloringStatusMessage = error?.message || "The design could not be updated.";
      renderColoring();
    }
    return true;
  }

  function getColoringPoint(event) {
    const rect = panel.coloringCanvas.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0
        || event.clientX < rect.left || event.clientX >= rect.right
        || event.clientY < rect.top || event.clientY >= rect.bottom) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * 64,
      y: ((event.clientY - rect.top) / rect.height) * 80
    };
  }

  function handleColoringPointerDown(event) {
    if (!coloringOpen || !coloringService || event.button !== 0 || activePointerId !== null) return;
    const point = getColoringPoint(event);
    if (!point) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    if (selectedStamp) {
      try {
        coloringService.addStamp(selectedStamp, point.x, point.y, 2);
        coloringStatusMessage = "Your " + selectedStamp + " stamp has been added.";
      } catch (error) {
        coloringStatusMessage = error?.message || "The stamp could not be added.";
      }
      selectedStamp = null;
      activePointerId = null;
      renderColoring();
      return;
    }
    try {
      panel.coloringCanvas.setPointerCapture?.(event.pointerId);
      coloringService.beginStroke(point);
      coloringStatusMessage = "Painting saves automatically.";
      renderColoring();
    } catch (error) {
      activePointerId = null;
      coloringStatusMessage = error?.message || "The brush could not start.";
      renderColoring();
    }
  }

  function handleColoringPointerMove(event) {
    if (event.pointerId !== activePointerId || !coloringService) return;
    const point = getColoringPoint(event);
    if (!point) return;
    event.preventDefault();
    try {
      if (coloringService.continueStroke(point)) renderColoring();
    } catch (error) {
      coloringStatusMessage = error?.message || "The brush could not continue.";
    }
  }

  function handleColoringPointerEnd(event) {
    if (event.pointerId !== activePointerId || !coloringService) return;
    activePointerId = null;
    try {
      const result = coloringService.endStroke();
      if (result.changed) coloringStatusMessage = "Your design has been saved.";
    } catch (error) {
      coloringStatusMessage = error?.message || "Your design could not be saved.";
    }
    renderColoring();
  }

  function handleWardrobeAction(event) {
    const actionElement = event.target?.closest?.("[data-wardrobe-action]");
    if (!actionElement || !root.contains(actionElement) || !wardrobeService) return false;
    const action = actionElement.dataset.wardrobeAction;
    let statusMessage = "The wardrobe has been updated.";
    try {
      if (action === "purchase") {
        const result = wardrobeService.purchaseItem(actionElement.dataset.itemId);
        statusMessage = result.purchased
          ? "Added " + result.itemId.replace(/^wardrobe\./, "").replaceAll("-", " ") + " to your wardrobe."
          : result.reason === "insufficient-star-gems"
            ? "You need more Star Gems for that item."
            : result.reason === "already-owned"
              ? "You already own that item."
              : "That item could not be purchased.";
      } else if (action === "equip") {
        const result = wardrobeService.equipItem(actionElement.dataset.itemId);
        statusMessage = result.equipped ? "Your look has been updated." : "That item is still locked.";
      } else if (action === "unequip") {
        wardrobeService.unequipSlot(actionElement.dataset.slot);
        statusMessage = "Equipment updated.";
      }
    } catch (error) {
      statusMessage = error?.message || "The wardrobe could not be updated.";
    }
    renderWardrobe(statusMessage);
    return true;
  }

  function render() {
    if (disposed) return;
    const state = store.getState();
    const selectedDock = state?.app?.activeDockId;
    const dockId = Object.hasOwn(DESTINATIONS, selectedDock) ? selectedDock : "chapters";
    const destination = DESTINATIONS[dockId];
    const preferences = selectUiPreferences(state);
    const economy = selectEconomy(state);
    for (const balanceElement of root.querySelectorAll("[data-currency-balance]")) {
      const currency = balanceElement.dataset.currencyBalance;
      if (currency === "starGems" || currency === "starlightSparkles") {
        balanceElement.textContent = String(economy[currency]);
      }
    }

    shell.dataset.textScale = preferences.textScale;
    if (documentRef.documentElement) documentRef.documentElement.dataset.textScale = preferences.textScale;
    const systemReducedMotion = windowRef?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    shell.dataset.reducedMotion = String(preferences.reducedMotion || systemReducedMotion);
    academyScene.setReducedMotion(preferences.reducedMotion || systemReducedMotion);
    panel.kicker.textContent = destination.kicker;
    panel.title.textContent = destination.title;
    panel.description.textContent = destination.description;
    panel.heroTitle.textContent = destination.heroTitle;
    panel.heroDescription.textContent = destination.heroDescription;
    panel.heroButton.textContent = destination.button;
    const wardrobeMode = dockId === "wardrobe";
    if (!wardrobeMode) coloringOpen = false;
    const coloringMode = wardrobeMode && coloringOpen;
    panel.hero.hidden = wardrobeMode;
    panel.quickPaths.hidden = wardrobeMode;
    panel.wardrobePanel.hidden = !wardrobeMode || coloringMode;
    panel.coloringPanel.hidden = !coloringMode;
    if (coloringMode) renderColoring();
    else if (wardrobeMode) renderWardrobe();

    for (const button of root.querySelectorAll("[data-dock-id]")) {
      if (button.dataset.dockId === dockId) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    for (const button of root.querySelectorAll("[data-text-scale-choice]")) {
      button.setAttribute("aria-pressed", String(button.dataset.textScaleChoice === preferences.textScale));
    }
    const motionToggle = requireElement(root, "[data-motion-toggle]");
    motionToggle.setAttribute("aria-pressed", String(preferences.reducedMotion));
    motionToggle.textContent = preferences.reducedMotion ? "On" : "Off";
    motionToggle.dataset.gamePayload = JSON.stringify({ reducedMotion: !preferences.reducedMotion });

    const audio = selectAudioSettings(state);
    for (const slider of root.querySelectorAll("[data-audio-slider]")) {
      const key = slider.dataset.audioSlider;
      if (["masterVolume", "musicVolume", "sfxVolume"].includes(key)) {
        slider.value = String(audio[key]);
        const output = root.querySelector('[data-audio-value="' + key + '"]');
        if (output) output.textContent = String(audio[key]) + "%";
      }
    }
    const muteButton = requireElement(root, "[data-audio-mute]");
    muteButton.setAttribute("aria-pressed", String(audio.muted));
    muteButton.textContent = audio.muted ? "Unmute sound" : "Mute sound";

    const narration = selectNarrationSettings(state);
    const narrationToggle = requireElement(root, "[data-narration-toggle]");
    narrationToggle.setAttribute("aria-pressed", String(narration.enabled));
    narrationToggle.textContent = narration.enabled ? "On" : "Off";
    const narrationPreview = requireElement(root, "[data-narration-preview]");
    narrationPreview.disabled = !narration.enabled;
    const narrationRate = requireElement(root, "[data-narration-rate]");
    narrationRate.value = String(narration.rate);
    requireElement(root, "[data-narration-rate-value]").textContent = narration.rate.toFixed(2) + "×";
    renderNarrationVoices();

    const overlayId = state?.ui?.activeOverlayId ?? null;
    const settingsOpen = overlayId === "settings";
    academyScene.setActive(state?.app?.screenId === "academy" && overlayId === null && !wardrobeMode);
    const justOpened = settingsOpen && lastOverlayId !== "settings";
    const justClosed = !settingsOpen && lastOverlayId === "settings";
    settingsBackdrop.hidden = !settingsOpen;
    applicationView.inert = settingsOpen;
    if (settingsOpen) applicationView.setAttribute("aria-hidden", "true");
    else applicationView.removeAttribute("aria-hidden");

    if (justOpened) {
      previousFocus = documentRef.activeElement;
      (focusableElements()[0] ?? settingsDialog).focus();
    }
    if (justClosed) {
      if (previousFocus?.isConnected && typeof previousFocus.focus === "function") previousFocus.focus();
      else settingsTrigger.focus();
      previousFocus = null;
      pendingImportText = null;
      importConfirm.hidden = true;
      importInput.value = "";
      setSettingsMessage("Importing a backup will never happen without your confirmation.");
    }
    lastOverlayId = overlayId;
  }

  function handleClick(event) {
    if (handleColoringAction(event)) return;
    if (handleWardrobeAction(event)) return;
    const actionElement = event.target?.closest?.("[data-ui-action]");
    if (!actionElement || !root.contains(actionElement)) return;
    const action = actionElement.dataset.uiAction;
    if (action === "toggle-narration") {
      const current = selectNarrationSettings(store.getState());
      store.dispatch({ type: "narration/settings-updated", payload: { enabled: !current.enabled } });
      return;
    }
    if (action === "preview-narration") {
      const instruction = "Welcome to Starlight Academy. Explore a new idea, move to the music, and celebrate each little discovery.";
      if (narrationService) narrationService.speak(instruction);
      else {
        const caption = requireElement(root, "[data-narration-text-slot]");
        caption.textContent = instruction;
        caption.hidden = false;
      }
      return;
    }
    if (action === "toggle-audio-mute") {
      store.dispatch({ type: "audio/settings-updated", payload: { muted: !selectAudioSettings(store.getState()).muted } });
      return;
    }
    if (action === "choose-import") {
      importInput.click();
      return;
    }
    if (action === "export-save") {
      try {
        const serialized = saveService.export();
        const blob = new Blob([serialized], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const download = documentRef.createElement("a");
        download.href = url;
        download.download = "starlight-academy-save.json";
        download.hidden = true;
        documentRef.body.append(download);
        download.click();
        download.remove();
        windowRef?.setTimeout?.(() => URL.revokeObjectURL(url), 0);
        setSettingsMessage("Your progress backup is ready. Keep the JSON file somewhere safe.", "success");
      } catch (error) {
        setSettingsMessage(error?.message || "Your progress backup could not be created.", "error");
      }
      return;
    }
    if (action === "confirm-import") {
      if (typeof pendingImportText !== "string") return;
      try {
        saveService.import(pendingImportText, { confirmReplace: true });
        pendingImportText = null;
        importConfirm.hidden = true;
        importInput.value = "";
        setSettingsMessage("Your backup was imported and saved on this device.", "success");
      } catch (error) {
        setSettingsMessage(error?.message || "The backup could not be imported.", "error");
      }
    }
  }

  function handleInput(event) {
    const narrationRate = event.target?.closest?.("[data-narration-rate]");
    if (narrationRate && root.contains(narrationRate)) {
      const rate = Number(narrationRate.value);
      if (Number.isFinite(rate)) store.dispatch({ type: "narration/settings-updated", payload: { rate } });
      return;
    }
    const slider = event.target?.closest?.("[data-audio-slider]");
    if (!slider || !root.contains(slider)) return;
    const key = slider.dataset.audioSlider;
    if (!["masterVolume", "musicVolume", "sfxVolume"].includes(key)) return;
    const value = Number(slider.value);
    if (!Number.isFinite(value)) return;
    store.dispatch({ type: "audio/settings-updated", payload: { [key]: value } });
  }

  function handleChange(event) {
    const templateSelect = event.target?.closest?.("[data-coloring-template]");
    if (templateSelect && root.contains(templateSelect) && coloringService) {
      try {
        coloringService.selectTemplate(templateSelect.value);
        selectedStamp = null;
        coloringStatusMessage = "Opened " + templateSelect.selectedOptions?.[0]?.textContent + ".";
        renderColoring();
      } catch (error) {
        coloringStatusMessage = error?.message || "That garment could not be opened.";
        renderColoring();
      }
      return;
    }
    const brushSizeSelect = event.target?.closest?.("[data-coloring-brush-size]");
    if (brushSizeSelect && root.contains(brushSizeSelect) && coloringService) {
      try {
        coloringService.setBrushSize(Number(brushSizeSelect.value));
        coloringStatusMessage = "Brush size updated.";
      } catch (error) {
        coloringStatusMessage = error?.message || "Brush size could not be changed.";
      }
      renderColoring();
      return;
    }
    const voiceSelect = event.target?.closest?.("[data-narration-voice]");
    if (!voiceSelect || !root.contains(voiceSelect)) return;
    store.dispatch({ type: "narration/settings-updated", payload: { voiceURI: voiceSelect.value } });
  }

  async function handleFileChange() {
    const file = importInput.files?.[0];
    if (!file) return;
    pendingImportText = null;
    importConfirm.hidden = true;
    try {
      const serialized = await file.text();
      const preview = saveService.previewImport(serialized);
      pendingImportText = serialized;
      importConfirm.hidden = false;
      importConfirm.textContent = preview.hasExistingSave ? "Confirm replacing progress" : "Confirm import";
      setSettingsMessage(
        preview.hasExistingSave
          ? "This backup is valid. Confirm below to replace the progress currently saved on this device."
          : "This backup is valid. Confirm below to import it.",
        "success"
      );
    } catch (error) {
      setSettingsMessage(error?.message || "This file is not a valid academy backup.", "error");
    }
  }

  function handleDialogKeydown(event) {
    if ((store.getState()?.ui?.activeOverlayId ?? null) !== "settings" || event.key !== "Tab") return;
    const focusable = focusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      settingsDialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (documentRef.activeElement === first || documentRef.activeElement === settingsDialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && documentRef.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  root.addEventListener("click", handleClick);
  root.addEventListener("input", handleInput);
  panel.coloringCanvas.addEventListener("pointerdown", handleColoringPointerDown);
  panel.coloringCanvas.addEventListener("pointermove", handleColoringPointerMove);
  panel.coloringCanvas.addEventListener("pointerup", handleColoringPointerEnd);
  panel.coloringCanvas.addEventListener("pointercancel", handleColoringPointerEnd);
  root.addEventListener("change", handleChange);
  root.addEventListener("keydown", handleDialogKeydown);
  importInput.addEventListener("change", handleFileChange);
  const unsubscribe = store.subscribe((state, action) => {
    if (action.type === "app/state-restored" && coloringService) {
      coloringService.restoreFromStore();
      coloringOpen = false;
      selectedStamp = null;
      coloringStatusMessage = "Your saved designs have been restored.";
    }
    render();
  });
  const unsubscribeVoices = narrationService?.subscribeVoices?.((voices) => renderNarrationVoices(voices)) ?? (() => {});
  renderNarrationVoices();
  render();
  academyScene.start();

  return Object.freeze({
    dispose() {
      if (disposed) return;
      disposed = true;
      academyScene.destroy();
      coloringService?.dispose?.();
      unsubscribe();
      unsubscribeVoices();
      root.removeEventListener("click", handleClick);
      root.removeEventListener("input", handleInput);
      panel.coloringCanvas.removeEventListener("pointerdown", handleColoringPointerDown);
      panel.coloringCanvas.removeEventListener("pointermove", handleColoringPointerMove);
      panel.coloringCanvas.removeEventListener("pointerup", handleColoringPointerEnd);
      panel.coloringCanvas.removeEventListener("pointercancel", handleColoringPointerEnd);
      root.removeEventListener("change", handleChange);
      root.removeEventListener("keydown", handleDialogKeydown);
      importInput.removeEventListener("change", handleFileChange);
    },
    render,
    getDiagnostics() {
      return Object.freeze({
        disposed,
        settingsOpen: (store.getState()?.ui?.activeOverlayId ?? null) === "settings",
        pendingImport: typeof pendingImportText === "string",
        coloringOpen,
        activeGarmentTemplateId: coloringService?.getSnapshot?.().template.id ?? null
      });
    }
  });
}

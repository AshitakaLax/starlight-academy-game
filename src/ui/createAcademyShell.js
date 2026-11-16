import { selectUiPreferences } from "./uiPreferences.js";
import { selectAudioSettings } from "../systems/audio/audioSettings.js";
import { selectNarrationSettings } from "../systems/narration/narrationSettings.js";
import { checkActivityAnswer } from "../systems/curriculum/answerRules.js";
import { selectSupportedSkillTier } from "../systems/curriculum/adaptiveDifficulty.js";
import { createChapterInputController } from "../gameplay/chapter-runtime/chapterInput.js";
import { selectEconomy } from "../systems/economy/economyState.js";
import { buildQuestBoardSnapshot } from "../gameplay/chapter-runtime/questBoard.js";
import { gameConfig } from "../config/gameConfig.js";
import { renderColoringCanvas } from "../gameplay/coloring/renderColoringCanvas.js";
import { createAcademyScene } from "../rendering/scenes/createAcademyScene.js";
import { createPetCharacterMarkup } from "./petCharacter.js";

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
    title: "Your adventures, stars, and discoveries.",
    description: "See every chapter and optional quest in one place, celebrate skill mastery, and replay to improve your personal best.",
    heroTitle: "Every little achievement adds to your constellation.",
    heroDescription: "Your quest board gathers chapter progress, optional adventures, skill records, and your best star ratings.",
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
      <section class="chapter-path-panel" data-chapter-path-panel aria-labelledby="chapter-path-title">
        <div class="chapter-path-heading"><div><p class="academy-overline">YOUR LEARNING JOURNEY</p><h2 id="chapter-path-title">Chapter Adventures</h2>
          <p>Each chapter creates its own path through stories, learning activities, creative challenges, and movement.</p></div><span aria-hidden="true">✦</span></div>
        <div class="chapter-path-list" data-chapter-path-list></div>
        <section class="chapter-session-panel" data-chapter-session hidden aria-label="Active chapter">
          <p class="chapter-session-status" data-chapter-session-status role="status" aria-live="polite">Your adventure is ready.</p>
          <p class="academy-overline" data-chapter-session-progress>ACTIVITY 1</p>
          <h3 data-chapter-session-title>Chapter activity</h3>
          <p data-chapter-session-description>Activity instructions will appear here.</p>
          <p class="chapter-session-type" data-chapter-session-type></p>
          <div class="chapter-activity-body" data-chapter-activity-body aria-live="polite"></div>
          <div class="chapter-session-actions" data-chapter-session-actions>
            <button class="wardrobe-primary-action" type="button" data-chapter-action="complete-activity">Complete activity</button>
            <button class="wardrobe-secondary-action" type="button" data-chapter-action="skip-activity">Skip this activity</button>
            <button class="wardrobe-secondary-action" type="button" data-chapter-action="exit">Save &amp; exit</button>
          </div>
          <section class="chapter-session-completion" data-chapter-session-completion hidden>
            <h4>Chapter complete!</h4>
            <p data-chapter-session-reward>Wonderful work. Your chapter reward has been recorded.</p>
            <button class="wardrobe-primary-action" type="button" data-chapter-action="exit">Back to chapter path</button>
          </section>
        </section>
      </section>
      <section class="quest-board-panel" data-quest-board-panel hidden aria-labelledby="quest-board-title">
        <div class="quest-board-heading">
          <div><p class="academy-overline">YOUR ACADEMY RECORD</p><h2 id="quest-board-title">Quest Board &amp; Stars</h2>
            <p>Track all ten chapter adventures and twenty optional quests. Replay any unlocked adventure to improve its personal-best score without losing earlier achievements.</p></div>
          <span aria-hidden="true">✧</span>
        </div>
        <div class="quest-board-summary" data-quest-board-summary aria-label="Academy progress summary"></div>
        <section class="quest-board-section" aria-labelledby="quest-board-chapters-title">
          <div class="quest-board-section-heading"><h3 id="quest-board-chapters-title">Chapter adventures</h3><span>10 chapters</span></div>
          <div class="quest-board-grid" data-quest-chapter-grid></div>
        </section>
        <section class="quest-board-section quest-board-optional" aria-labelledby="quest-board-quests-title">
          <div class="quest-board-section-heading"><h3 id="quest-board-quests-title">Optional side quests</h3><span>20 quests</span></div>
          <p class="quest-board-note">Side quests are extra practice. They never block the next chapter.</p>
          <div class="quest-board-grid" data-quest-quest-grid></div>
        </section>
      </section>
      <section class="gymnastics-panel" data-gymnastics-panel hidden aria-labelledby="gymnastics-panel-title">
        <div class="gymnastics-panel-heading">
          <div><p class="academy-overline">MOVEMENT &amp; MUSIC</p><h2 id="gymnastics-panel-title">Gymnastics Studio</h2>
            <p>Preview a routine, trace the glowing ribbon, and tap along with the stars. You can take your time, skip a trace, and finish every routine.</p></div>
          <span class="gymnastics-heading-symbol" aria-hidden="true">✧</span>
        </div>
        <article class="gymnastics-routine-card">
          <div class="gymnastics-routine-copy">
            <p class="academy-overline">TODAY'S ROUTINE</p>
            <h3 data-gymnastics-routine-title>Starlight Ribbon Waltz</h3>
            <p data-gymnastics-routine-description>Follow the ribbon, then tap each star as the music reaches its beat.</p>
            <p class="gymnastics-stats" data-gymnastics-stats>Practice records will appear here.</p>
            <button class="wardrobe-primary-action" type="button" data-gymnastics-action="start">Begin practice</button>
          </div>
          <span class="gymnastics-ribbon-art" aria-hidden="true">〰 ✦ 〰</span>
        </article>
        <section class="gymnastics-practice" data-gymnastics-practice hidden aria-label="Routine practice">
          <p class="gymnastics-status" data-gymnastics-status role="status" aria-live="polite">Your routine is ready.</p>
          <div class="gymnastics-canvas-frame">
            <canvas class="gymnastics-canvas" data-gymnastics-canvas width="720" height="360" role="img" aria-label="Trace the glowing ribbon path with your mouse"></canvas>
          </div>
          <p class="gymnastics-canvas-help" data-gymnastics-canvas-help>Preview the glowing ribbon, then trace it with your mouse during practice.</p>
          <div class="gymnastics-practice-actions" data-gymnastics-trace-actions hidden>
            <button class="wardrobe-primary-action" type="button" data-gymnastics-action="finish-trace">Finish tracing and continue</button>
            <span>You may finish whenever you are ready. A skipped trace simply receives its own score.</span>
          </div>
          <div class="gymnastics-practice-actions" data-gymnastics-rhythm-actions hidden>
            <button class="wardrobe-primary-action gymnastics-beat-button" type="button" data-gymnastics-action="tap-beat">✦ Tap the beat</button>
            <span>Each star has a generous timing window. Miss one? Keep going to the next.</span>
          </div>
          <section class="gymnastics-result" data-gymnastics-result hidden aria-labelledby="gymnastics-result-title">
            <h3 id="gymnastics-result-title">Routine complete!</h3>
            <p class="gymnastics-stars" data-gymnastics-stars aria-label="Star rating">☆☆☆</p>
            <div class="gymnastics-score-grid">
              <div><span>Tracing accuracy</span><strong data-gymnastics-trace-score>0%</strong></div>
              <div><span>Rhythm timing</span><strong data-gymnastics-rhythm-score>0%</strong></div>
              <div><span>Combined score</span><strong data-gymnastics-combined-score>0%</strong></div>
            </div>
            <p>Lovely work! Every routine reaches its finish, and you can always practice again.</p>
          </section>
        </section>
      </section>
      <section class="pet-collection-panel" data-pet-collection-panel hidden aria-labelledby="pet-collection-title">
        <div class="wardrobe-panel-heading"><div><p class="academy-overline">MAGICAL COMPANIONS</p><h2 id="pet-collection-title">Your Pet Collection</h2><p>Every companion keeps its own appearance and friendship progress. Choose who joins you today.</p></div><span class="wardrobe-heading-star" aria-hidden="true">♡</span></div>
        <div class="pet-collection-grid" data-pet-collection-grid></div>
        <p class="wardrobe-status" data-pet-collection-status role="status" aria-live="polite">Your Pegasus is ready to explore with you.</p>
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
  coloringService = null, garmentTemplateRegistry = null, petCollectionService = null, petCatalog = null,
  gymnasticsService = null, chapterRuntimeService = null, activityRegistry = null,
  questionGeneratorRegistry = null, hintService = null, audioService = null, emblemSvg = "",
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
    chapterPathPanel: requireElement(root, "[data-chapter-path-panel]"),
    chapterPathList: requireElement(root, "[data-chapter-path-list]"),
    questBoardPanel: requireElement(root, "[data-quest-board-panel]"),
    questBoardSummary: requireElement(root, "[data-quest-board-summary]"),
    questChapterGrid: requireElement(root, "[data-quest-chapter-grid]"),
    questQuestGrid: requireElement(root, "[data-quest-quest-grid]"),
    chapterSession: requireElement(root, "[data-chapter-session]"),
    chapterSessionStatus: requireElement(root, "[data-chapter-session-status]"),
    chapterSessionProgress: requireElement(root, "[data-chapter-session-progress]"),
    chapterSessionTitle: requireElement(root, "[data-chapter-session-title]"),
    chapterSessionDescription: requireElement(root, "[data-chapter-session-description]"),
    chapterSessionType: requireElement(root, "[data-chapter-session-type]"),
    chapterActivityBody: requireElement(root, "[data-chapter-activity-body]"),
    chapterSessionActions: requireElement(root, "[data-chapter-session-actions]"),
    chapterSessionCompletion: requireElement(root, "[data-chapter-session-completion]"),
    chapterSessionReward: requireElement(root, "[data-chapter-session-reward]"),
    gymnasticsPanel: requireElement(root, "[data-gymnastics-panel]"),
    gymnasticsRoutineTitle: requireElement(root, "[data-gymnastics-routine-title]"),
    gymnasticsRoutineDescription: requireElement(root, "[data-gymnastics-routine-description]"),
    gymnasticsStats: requireElement(root, "[data-gymnastics-stats]"),
    gymnasticsPractice: requireElement(root, "[data-gymnastics-practice]"),
    gymnasticsStatus: requireElement(root, "[data-gymnastics-status]"),
    gymnasticsCanvas: requireElement(root, "[data-gymnastics-canvas]"),
    gymnasticsCanvasHelp: requireElement(root, "[data-gymnastics-canvas-help]"),
    gymnasticsStart: requireElement(root, '[data-gymnastics-action="start"]'),
    gymnasticsTraceActions: requireElement(root, "[data-gymnastics-trace-actions]"),
    gymnasticsRhythmActions: requireElement(root, "[data-gymnastics-rhythm-actions]"),
    gymnasticsBeat: requireElement(root, '[data-gymnastics-action="tap-beat"]'),
    gymnasticsResult: requireElement(root, "[data-gymnastics-result]"),
    gymnasticsStars: requireElement(root, "[data-gymnastics-stars]"),
    gymnasticsTraceScore: requireElement(root, "[data-gymnastics-trace-score]"),
    gymnasticsRhythmScore: requireElement(root, "[data-gymnastics-rhythm-score]"),
    gymnasticsCombinedScore: requireElement(root, "[data-gymnastics-combined-score]"),
    wardrobePanel: requireElement(root, "[data-wardrobe-panel]"),
    petCollectionPanel: requireElement(root, "[data-pet-collection-panel]"),
    petCollectionGrid: requireElement(root, "[data-pet-collection-grid]"),
    petCollectionStatus: requireElement(root, "[data-pet-collection-status]"),
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
  if (petCollectionService !== null && typeof petCollectionService.getSnapshot !== "function") {
    throw new TypeError("petCollectionService must expose getSnapshot().");
  }
  if (chapterRuntimeService !== null
      && (typeof chapterRuntimeService.getSnapshot !== "function"
        || typeof chapterRuntimeService.createSession !== "function")) {
    throw new TypeError("chapterRuntimeService must expose chapter snapshots and session creation.");
  }
  if (gymnasticsService !== null
      && (typeof gymnasticsService.getSnapshot !== "function"
        || typeof gymnasticsService.createSession !== "function"
        || typeof gymnasticsService.recordCompletion !== "function")) {
    throw new TypeError("gymnasticsService must expose routine snapshots, sessions, and completion recording.");
  }
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
  let activeChapterSession = null;
  let activeChapterId = null;
  let activeChapterReturnDock = null;
  let chapterQuestion = null;
  let chapterQuestionForActivity = null;
  let chapterQuestionIndex = 0;
  let chapterQuestionAttempts = 0;
  let chapterQuestionSeedSequence = 0;
  let chapterHintPresentation = null;
  let chapterActivityFeedback = "";
  let chapterGymnasticsCompleted = false;
  let gymnasticsSession = null;
  let gymnasticsClock = null;
  let gymnasticsPointerActive = false;
  let gymnasticsRecorded = false;
  let gymnasticsCueRoutine = null;
  let gymnasticsCountInStartAt = null;
  let gymnasticsCountInCueBeat = 0;
  let gymnasticsRhythmStartAt = null;
  let gymnasticsRhythmCueIndex = 0;
  let gymnasticsStatusMessage = "Your routine is ready when you are.";

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

  function renderPetCollection(statusMessage = null, reaction = null) {
    if (!petCollectionService) {
      panel.petCollectionGrid.replaceChildren();
      panel.petCollectionStatus.textContent = "Pet collection is not connected.";
      return;
    }
    const snapshot = petCollectionService.getSnapshot();
    const fragment = documentRef.createDocumentFragment();
    const careLabels = {
      feeding: "Treat feeding",
      grooming: "Sparkle grooming",
      play: "Ribbon-toss play"
    };
    for (const pet of snapshot.pets) {
      const card = documentRef.createElement("article");
      card.className = "pet-collection-card";
      card.dataset.petState = pet.unlocked ? (pet.active ? "active" : "unlocked") : "locked";
      const palette = pet.appearancePalettes.find((entry) => entry.id === pet.appearance.paletteId)
        ?? pet.appearancePalettes[0];
      const character = documentRef.createElement("div");
      character.className = "pet-character-stage";
      character.dataset.species = pet.id.slice("pet.".length);
      character.setAttribute("aria-hidden", "true");
      character.innerHTML = createPetCharacterMarkup({
        species: pet.id.slice("pet.".length),
        palette,
        reaction: reaction?.petId === pet.id ? reaction.careType : "idle"
      });
      const title = documentRef.createElement("h3");
      title.textContent = pet.title;
      const description = documentRef.createElement("p");
      description.textContent = pet.description;
      const appearance = documentRef.createElement("p");
      appearance.className = "pet-collection-detail";
      appearance.textContent = pet.unlocked ? "Look: " + (palette?.label ?? "Classic") : "A new friend to discover";
      card.append(character, title, description, appearance);
      const action = documentRef.createElement("button");
      action.type = "button";
      action.className = pet.active ? "wardrobe-secondary-action" : "wardrobe-primary-action";
      action.disabled = !pet.unlocked || pet.active;
      action.dataset.petAction = "select";
      action.dataset.petId = pet.id;
      action.textContent = pet.active ? "Exploring with you" : pet.unlocked ? "Choose companion" : "Locked";
      card.append(action);
      if (pet.unlocked) {
        if (pet.ability) {
          const ability = documentRef.createElement("section");
          ability.className = "pet-ability-card";
          ability.dataset.abilityState = pet.active ? "active" : "inactive";
          const abilityTitle = documentRef.createElement("strong");
          abilityTitle.textContent = (pet.active ? "ACTIVE ABILITY · " : "ABILITY · ") + pet.ability.title;
          const abilityDescription = documentRef.createElement("p");
          abilityDescription.textContent = pet.ability.description;
          ability.append(abilityTitle, abilityDescription);
          card.append(ability);
        }
        const label = documentRef.createElement("label");
        label.className = "pet-appearance-choice";
        label.textContent = "Appearance";
        const select = documentRef.createElement("select");
        select.dataset.petAction = "appearance";
        select.dataset.petId = pet.id;
        for (const optionData of pet.appearancePalettes) {
          const option = documentRef.createElement("option");
          option.value = optionData.id;
          option.textContent = optionData.label;
          select.append(option);
        }
        select.value = pet.appearance.paletteId;
        label.append(select);
        card.append(label);

        const careHeading = documentRef.createElement("h4");
        careHeading.className = "pet-care-heading";
        careHeading.textContent = "Little ways to care";
        card.append(careHeading);
        const meters = documentRef.createElement("div");
        meters.className = "pet-care-meters";
        for (const careType of ["feeding", "grooming", "play"]) {
          const meterLabel = documentRef.createElement("label");
          meterLabel.className = "pet-care-meter";
          const detail = documentRef.createElement("span");
          detail.textContent = careLabels[careType] + " · " + pet.careProgress[careType] + "%";
          const progress = documentRef.createElement("progress");
          progress.max = gameConfig.petCare.progressMaximum;
          progress.value = pet.careProgress[careType];
          progress.setAttribute("aria-label", pet.title + " " + careLabels[careType] + " progress");
          meterLabel.append(detail, progress);
          meters.append(meterLabel);
        }
        card.append(meters);

        const careActions = documentRef.createElement("div");
        careActions.className = "pet-care-actions";
        for (const [careType, text] of [
          ["feeding", "♡ Give a treat"],
          ["grooming", "✧ Sparkle groom"],
          ["play", "🎀 Toss ribbon"]
        ]) {
          const careButton = documentRef.createElement("button");
          careButton.type = "button";
          careButton.className = "pet-care-action";
          careButton.dataset.petAction = "care";
          careButton.dataset.petId = pet.id;
          careButton.dataset.careType = careType;
          careButton.textContent = text;
          careActions.append(careButton);
        }
        card.append(careActions);
        const bond = documentRef.createElement("p");
        bond.className = "pet-bond-summary";
        bond.textContent = "Friendship " + pet.bondExperience + " · Care moments " + pet.careMoments;
        card.append(bond);
      }
      fragment.append(card);
    }
    panel.petCollectionGrid.replaceChildren(fragment);
    const abilitySummary = snapshot.activeAbility
      ? " " + snapshot.activeAbility.title + " is active: " + snapshot.activeAbility.description
      : "";
    panel.petCollectionStatus.textContent = statusMessage ?? ("Your active companion is " + (snapshot.activePet?.title ?? "ready") + "." + abilitySummary + " Care is always optional, and full meters never stop you from spending another happy moment together.");
  }

  function handlePetAction(event) {
    const control = event.target?.closest?.("[data-pet-action]");
    if (!control || !root.contains(control) || !petCollectionService
        || control.dataset.petAction === "appearance") return false;
    try {
      if (control.dataset.petAction === "select") {
        petCollectionService.selectActivePet(control.dataset.petId);
        renderPetCollection("Your companion is ready for an adventure!");
      } else if (control.dataset.petAction === "care") {
        const result = petCollectionService.performCare(control.dataset.petId, control.dataset.careType);
        const pet = petCollectionService.getPet(control.dataset.petId);
        const petName = pet?.definition?.title ?? control.dataset.petId;
        const careName = {
          feeding: "treat",
          grooming: "sparkle grooming",
          play: "ribbon toss"
        }[result.careType] ?? "care";
        const trackName = {
          feeding: "Feeding",
          grooming: "Grooming",
          play: "Play"
        }[result.careType] ?? "Care";
        const abilityMessage = result.abilityBonus > 0
          ? " Your active companion ability added up to " + result.abilityBonus + " extra care points."
          : "";
        const message = result.meterFull
          ? petName + " loved that " + careName + " moment! The " + trackName.toLowerCase() + " meter is full, and your friendship still grows." + abilityMessage
          : petName + " enjoyed that " + careName + " moment! " + trackName + " progress is now " + result.progressAfter + "%." + abilityMessage;
        renderPetCollection(message, { petId: control.dataset.petId, careType: result.careType });
      }
    } catch (error) {
      renderPetCollection(error?.message || "That companion could not be cared for.");
    }
    return true;
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

  function resetChapterQuestion() {
    chapterQuestion = null;
    chapterQuestionForActivity = null;
    chapterQuestionIndex = 0;
    chapterQuestionAttempts = 0;
    chapterHintPresentation = null;
    chapterActivityFeedback = "";
  }

  function ensureChapterQuestion(activity) {
    if (!activity?.activityId || !activityRegistry || !questionGeneratorRegistry) return null;
    if (chapterQuestion && chapterQuestionForActivity === activity.id) return chapterQuestion;
    const definition = activityRegistry.get(activity.activityId);
    if (!definition) throw new Error("This chapter question is not registered: " + activity.activityId);
    if (chapterQuestionForActivity !== activity.id) {
      chapterQuestionForActivity = activity.id;
      chapterQuestionIndex = 0;
      chapterQuestionAttempts = 0;
      chapterHintPresentation = null;
      chapterActivityFeedback = "";
    }
    const skillId = definition.skillIds[0];
    const tier = selectSupportedSkillTier(store.getState(), skillId, definition.supportedTiers);
    const seed = [activeChapterId, activity.id, String(chapterQuestionIndex), String(chapterQuestionSeedSequence++)].join(":");
    chapterQuestion = questionGeneratorRegistry.generate(definition, { seed, tier });
    return chapterQuestion;
  }

  function appendChapterText(parent, tagName, value, className = "") {
    const element = documentRef.createElement(tagName);
    if (className) element.className = className;
    element.textContent = value;
    parent.append(element);
    return element;
  }

  function renderChapterFractionStimulus(parent, stimulus) {
    if (stimulus?.kind !== "fraction-bars" || !Array.isArray(stimulus.bars)) return;
    const figure = documentRef.createElement("figure");
    figure.className = "chapter-fraction-visual";
    for (const model of stimulus.bars) {
      if (!Number.isInteger(model.numerator) || !Number.isInteger(model.denominator)
          || model.denominator < 2 || model.denominator > 16
          || model.numerator < 0 || model.numerator > model.denominator) continue;
      const group = documentRef.createElement("section");
      group.className = "chapter-fraction-model";
      if (model.label) appendChapterText(group, "p", model.label, "chapter-fraction-label");
      const bar = documentRef.createElement("div");
      bar.className = "chapter-fraction-bar";
      bar.setAttribute("role", "img");
      bar.setAttribute(
        "aria-label",
        model.numerator + " of " + model.denominator + " equal parts are shaded."
      );
      bar.style.gridTemplateColumns = "repeat(" + model.denominator + ", minmax(0, 1fr))";
      for (let index = 0; index < model.denominator; index += 1) {
        const part = documentRef.createElement("span");
        part.className = index < model.numerator
          ? "chapter-fraction-part is-shaded"
          : "chapter-fraction-part";
        part.setAttribute("aria-hidden", "true");
        bar.append(part);
      }
      group.append(bar);
      if (model.showValue) {
        appendChapterText(
          group,
          "figcaption",
          model.numerator + "/" + model.denominator,
          "chapter-fraction-value"
        );
      }
      figure.append(group);
    }
    if (figure.childElementCount) parent.append(figure);
  }

  function renderChapterWordStimulus(parent, stimulus) {
    if (stimulus?.kind === "word-parts" && Array.isArray(stimulus.components)) {
      const figure = documentRef.createElement("figure");
      figure.className = "chapter-word-parts-visual";
      appendChapterText(figure, "h5", stimulus.title ?? "Build a word", "chapter-word-visual-title");
      if (stimulus.instruction) appendChapterText(figure, "p", stimulus.instruction, "chapter-word-visual-copy");
      const parts = documentRef.createElement("div");
      parts.className = "chapter-word-parts";
      for (const component of stimulus.components) {
        if (!component || typeof component.text !== "string" || !component.text.trim()) continue;
        const part = documentRef.createElement("div");
        part.className = "chapter-word-part";
        appendChapterText(part, "span", component.label ?? "Word part", "chapter-word-part-label");
        appendChapterText(part, "strong", component.text, "chapter-word-part-text");
        if (component.meaning) appendChapterText(part, "small", component.meaning, "chapter-word-part-meaning");
        parts.append(part);
      }
      figure.append(parts);
      if (stimulus.meaning) {
        appendChapterText(figure, "figcaption", "Build a word meaning: " + stimulus.meaning, "chapter-word-meaning");
      }
      if (stimulus.spellingNote) {
        appendChapterText(figure, "p", "Spelling note: " + stimulus.spellingNote, "chapter-word-spelling-note");
      }
      if (parts.childElementCount) parent.append(figure);
      return;
    }
    if (stimulus?.kind === "context-potion") {
      const figure = documentRef.createElement("figure");
      figure.className = "chapter-potion-visual";
      appendChapterText(figure, "p", stimulus.title ?? "Potion clue", "chapter-word-visual-title");
      appendChapterText(figure, "h5", stimulus.word, "chapter-potion-word");
      appendChapterText(figure, "p", "Potion note: “" + stimulus.sentence + "”", "chapter-potion-sentence");
      const root = stimulus.root;
      if (root?.text) {
        const rootNote = documentRef.createElement("p");
        rootNote.className = "chapter-potion-root";
        appendChapterText(rootNote, "strong", "Root: " + root.text + " ");
        appendChapterText(rootNote, "span", "(" + (root.meaning ?? "word base") + ")");
        figure.append(rootNote);
      }
      if (Array.isArray(stimulus.components) && stimulus.components.length) {
        const components = documentRef.createElement("ul");
        components.className = "chapter-potion-components";
        for (const component of stimulus.components) {
          const item = documentRef.createElement("li");
          item.textContent = (component.label ?? "Word part") + " " + component.text
            + (component.meaning ? " · " + component.meaning : "");
          components.append(item);
        }
        figure.append(components);
      }
      if (stimulus.spellingNote) {
        appendChapterText(figure, "p", "Spelling note: " + stimulus.spellingNote, "chapter-word-spelling-note");
      }
      parent.append(figure);
    }
  }


  function renderChapterPlantStimulus(parent, stimulus) {
    if (!stimulus || !["plant-lifecycle", "plant-resource-scenario", "photosynthesis-inputs"].includes(stimulus.kind)) return;
    const figure = documentRef.createElement("figure");
    figure.className = "chapter-plant-visual";

    if (stimulus.kind === "plant-lifecycle") {
      appendChapterText(figure, "h5", stimulus.title ?? "Growing plant cycle", "chapter-plant-title");
      const stages = documentRef.createElement("ol");
      stages.className = "chapter-plant-stages";
      stages.setAttribute("aria-label", stimulus.listLabel ?? "Life-cycle stages already completed");
      for (const [index, stage] of (stimulus.completedStages ?? []).entries()) {
        const item = documentRef.createElement("li");
        item.className = "chapter-plant-stage";
        appendChapterText(item, "span", String(index + 1), "chapter-plant-stage-number");
        appendChapterText(item, "strong", stage.label, "chapter-plant-stage-label");
        if (stage.description) appendChapterText(item, "p", stage.description, "chapter-plant-stage-copy");
        stages.append(item);
      }
      figure.append(stages);
      appendChapterText(figure, "figcaption", stimulus.caption ?? "Follow the stages in order. Which one comes next?", "chapter-plant-caption");
    } else if (stimulus.kind === "plant-resource-scenario") {
      appendChapterText(figure, "span", "🌱", "chapter-plant-symbol");
      appendChapterText(figure, "h5", stimulus.title ?? "Greenhouse observation", "chapter-plant-title");
      appendChapterText(figure, "p", "What the plant is experiencing", "chapter-plant-kicker");
      appendChapterText(figure, "p", stimulus.scenario, "chapter-plant-copy");
      appendChapterText(figure, "p", stimulus.caption ?? "Think about what is missing before choosing a resource.", "chapter-plant-caption");
    } else {
      appendChapterText(figure, "span", "☀️", "chapter-plant-symbol");
      appendChapterText(figure, "h5", stimulus.title ?? "Photosynthesis recipe", "chapter-plant-title");
      appendChapterText(figure, "p", stimulus.kicker ?? "Complete the three spaces", "chapter-plant-kicker");
      if (stimulus.scenario) appendChapterText(figure, "p", stimulus.scenario, "chapter-plant-copy");
      const roles = documentRef.createElement("ul");
      roles.className = "chapter-photosynthesis-roles";
      for (const role of (stimulus.roles ?? [])) {
        const item = documentRef.createElement("li");
        item.textContent = role;
        roles.append(item);
      }
      figure.append(roles);
      appendChapterText(figure, "figcaption", stimulus.caption ?? "The plant uses these inputs to make sugars and releases oxygen.", "chapter-plant-caption");
    }

    parent.append(figure);
  }


  function renderChapterLanguageStimulus(parent, stimulus) {
    if (!stimulus || !["grammar-target", "grammar-pair", "reading-passage"].includes(stimulus.kind)) return;
    const figure = documentRef.createElement("figure");
    figure.className = "chapter-language-visual";

    if (stimulus.kind === "grammar-pair") {
      appendChapterText(figure, "h5", stimulus.title ?? "Compare two word clues", "chapter-language-title");
      for (const [index, example] of (stimulus.examples ?? []).entries()) {
        const section = documentRef.createElement("section");
        section.className = "chapter-language-pair-item";
        appendChapterText(section, "p", "Sentence clue " + (index + 1), "chapter-language-caption");
        const sentence = documentRef.createElement("p");
        sentence.className = "chapter-language-sentence";
        const source = String(example.sentence ?? "");
        const target = String(example.targetWord ?? "");
        const start = target ? source.toLocaleLowerCase().indexOf(target.toLocaleLowerCase()) : -1;
        if (start >= 0) {
          sentence.append(documentRef.createTextNode(source.slice(0, start)));
          const mark = documentRef.createElement("mark");
          mark.textContent = source.slice(start, start + target.length);
          sentence.append(mark);
          sentence.append(documentRef.createTextNode(source.slice(start + target.length)));
        } else {
          sentence.textContent = source;
        }
        section.append(sentence);
        figure.append(section);
      }
      appendChapterText(figure, "figcaption", "Compare the highlighted words' jobs in their own sentences.", "chapter-language-caption");
    } else if (stimulus.kind === "grammar-target") {
      appendChapterText(figure, "h5", "Word study", "chapter-language-title");
      const sentence = documentRef.createElement("p");
      sentence.className = "chapter-language-sentence";
      const source = String(stimulus.sentence ?? "");
      const target = String(stimulus.targetWord ?? "");
      const start = target ? source.toLocaleLowerCase().indexOf(target.toLocaleLowerCase()) : -1;
      if (start >= 0) {
        sentence.append(documentRef.createTextNode(source.slice(0, start)));
        const mark = documentRef.createElement("mark");
        mark.textContent = source.slice(start, start + target.length);
        sentence.append(mark);
        sentence.append(documentRef.createTextNode(source.slice(start + target.length)));
      } else {
        sentence.textContent = source;
      }
      figure.append(sentence);
      appendChapterText(figure, "figcaption", "Study the highlighted word in its sentence.", "chapter-language-caption");
    } else {
      appendChapterText(figure, "h5", stimulus.title ?? "Reading passage", "chapter-language-title");
      appendChapterText(figure, "p", stimulus.passage ?? "", "chapter-reading-passage");
      appendChapterText(
        figure,
        "figcaption",
        stimulus.focus === "main-idea"
          ? "Notice how the details connect to one central idea."
          : stimulus.focus === "evidence"
            ? "Look for the detail that best supports the stated conclusion."
            : "Use details from the passage to support your conclusion.",
        "chapter-language-caption"
      );
      if (stimulus.focus === "evidence" && stimulus.claim) {
        appendChapterText(figure, "p", "Conclusion to support: " + stimulus.claim, "chapter-reading-claim");
      }
    }

    parent.append(figure);
  }


  function renderChapterMeasurementStimulus(parent, stimulus) {
    if (!stimulus || ![
      "measurement-beaker", "measurement-balance", "measurement-conversion", "measurement-audit", "measurement-combined-load", "measurement-elapsed-time"
    ].includes(stimulus.kind)) return;

    const figure = documentRef.createElement("figure");
    figure.className = "chapter-measurement-visual";

    if (stimulus.kind === "measurement-beaker") {
      appendChapterText(figure, "h5", "Graduated beaker", "chapter-measurement-title");
      const row = documentRef.createElement("div");
      row.className = "chapter-beaker-row";
      const beaker = documentRef.createElement("div");
      beaker.className = "chapter-measurement-beaker";
      beaker.setAttribute("role", "list");
      beaker.setAttribute("aria-label", "Beaker scale graduations in milliliters");
      const liquid = documentRef.createElement("div");
      liquid.className = "chapter-beaker-liquid";
      liquid.style.height = Math.max(0, Math.min(100, stimulus.fillValueMl / stimulus.capacityMl * 100)) + "%";
      liquid.setAttribute("aria-hidden", "true");
      beaker.append(liquid);
      for (const graduation of (stimulus.graduations ?? [])) {
        const tick = documentRef.createElement("div");
        tick.className = "chapter-beaker-tick" + (graduation.major ? " is-major" : "");
        tick.setAttribute("role", "listitem");
        tick.setAttribute("aria-label", graduation.value + " milliliters" + (graduation.major ? ", major graduation" : ", minor graduation"));
        tick.style.bottom = (graduation.value / stimulus.capacityMl * 100) + "%";
        const line = documentRef.createElement("span");
        line.className = "chapter-beaker-tick-line";
        tick.append(line);
        if (graduation.label !== null && graduation.label !== undefined) {
          const label = documentRef.createElement("span");
          label.className = "chapter-beaker-tick-label";
          label.textContent = graduation.label;
          tick.append(label);
        }
        beaker.append(tick);
      }
      const unit = documentRef.createElement("p");
      unit.className = "chapter-measurement-unit";
      unit.textContent = "Scale: milliliters (mL)";
      row.append(beaker, unit);
      figure.append(row);
      appendChapterText(figure, "figcaption", "Read the graduation that lines up with the top of the liquid.", "chapter-measurement-caption");
    } else if (stimulus.kind === "measurement-balance") {
      appendChapterText(figure, "h5", "A level balance", "chapter-measurement-title");
      appendChapterText(figure, "p", "Both pans have equal mass.", "chapter-measurement-note");
      const balance = documentRef.createElement("div");
      balance.className = "chapter-measurement-balance";
      const objectPan = documentRef.createElement("div");
      objectPan.className = "chapter-balance-pan";
      appendChapterText(objectPan, "span", "Object", "chapter-balance-label");
      appendChapterText(objectPan, "strong", stimulus.object ?? "Unknown object", "chapter-balance-object");
      const weightPan = documentRef.createElement("div");
      weightPan.className = "chapter-balance-pan";
      appendChapterText(weightPan, "span", "Standard weights", "chapter-balance-label");
      const weights = documentRef.createElement("ul");
      weights.className = "chapter-balance-weights";
      for (const value of (stimulus.weights ?? [])) {
        const item = documentRef.createElement("li");
        item.textContent = value;
        weights.append(item);
      }
      weightPan.append(weights);
      const equals = documentRef.createElement("span");
      equals.className = "chapter-balance-equals";
      equals.textContent = "=";
      equals.setAttribute("aria-hidden", "true");
      balance.append(objectPan, equals, weightPan);
      figure.append(balance);
      appendChapterText(figure, "figcaption", "Add the masses on the standard-weight pan to find the object's mass in grams.", "chapter-measurement-caption");
    } else if (stimulus.kind === "measurement-conversion") {
      appendChapterText(figure, "h5", "Metric conversion", "chapter-measurement-title");
      const equation = documentRef.createElement("div");
      equation.className = "chapter-conversion-equation";
      appendChapterText(equation, "strong", stimulus.sourceValue + " " + stimulus.fromUnit, "chapter-conversion-value");
      appendChapterText(equation, "span", "=", "chapter-conversion-equals");
      appendChapterText(equation, "strong", "? " + stimulus.toUnit, "chapter-conversion-target");
      figure.append(equation);
      appendChapterText(figure, "figcaption", "Convert the measurement without changing what it measures.", "chapter-measurement-caption");
    } else if (stimulus.kind === "measurement-audit") {
      appendChapterText(figure, "h5", stimulus.title ?? "Harbor conversion audit", "chapter-measurement-title");
      const cards = documentRef.createElement("ol");
      cards.className = "chapter-measurement-audit";
      for (const card of (stimulus.cards ?? [])) {
        const item = documentRef.createElement("li");
        item.className = "chapter-measurement-audit-card";
        appendChapterText(item, "strong", card.label, "chapter-measurement-note");
        appendChapterText(item, "span", card.sourceValue + " " + card.fromUnit + " = " + card.reportedValue + " " + card.toUnit, "chapter-conversion-value");
        cards.append(item);
      }
      figure.append(cards);
      appendChapterText(figure, "figcaption", "Three cards are correct. Find the one reported conversion that does not match the metric relationship.", "chapter-measurement-caption");
    } else if (stimulus.kind === "measurement-combined-load") {
      appendChapterText(figure, "h5", stimulus.title ?? "Harbor cargo manifest", "chapter-measurement-title");
      const cargo = documentRef.createElement("ul");
      cargo.className = "chapter-cargo-items";
      for (const item of (stimulus.items ?? [])) {
        const row = documentRef.createElement("li");
        appendChapterText(row, "strong", item.object, "chapter-measurement-note");
        appendChapterText(row, "span", item.mass, "chapter-conversion-value");
        cargo.append(row);
      }
      figure.append(cargo);
      appendChapterText(figure, "figcaption", "Add the two measured masses to find the combined cargo total in grams.", "chapter-measurement-caption");
    } else {
      appendChapterText(figure, "h5", "Harbor clock", "chapter-measurement-title");
      const timeline = documentRef.createElement("div");
      timeline.className = "chapter-time-timeline";
      const start = documentRef.createElement("div");
      start.className = "chapter-time-point";
      appendChapterText(start, "span", "START", "chapter-time-label");
      appendChapterText(start, "strong", stimulus.startTime, "chapter-time-value");
      const arrow = documentRef.createElement("span");
      arrow.className = "chapter-time-arrow";
      arrow.textContent = "→";
      arrow.setAttribute("aria-hidden", "true");
      const finish = documentRef.createElement("div");
      finish.className = "chapter-time-point";
      appendChapterText(finish, "span", "FINISH", "chapter-time-label");
      appendChapterText(finish, "strong", stimulus.finishTime, "chapter-time-value");
      timeline.append(start, arrow, finish);
      figure.append(timeline);
      appendChapterText(figure, "figcaption", "Count forward from the start time to the finish time.", "chapter-measurement-caption");
    }

    parent.append(figure);
  }


  function renderChapterChampionshipStimulus(parent, stimulus) {
    if (!stimulus || ![
      "championship-skill-match", "championship-constellation-plan"
    ].includes(stimulus.kind)) return;

    const figure = documentRef.createElement("figure");
    figure.className = "chapter-championship-visual";

    if (stimulus.kind === "championship-skill-match") {
      appendChapterText(figure, "h5", "A skill behind the star", "chapter-championship-title");
      appendChapterText(figure, "p", stimulus.subjectLabel + " · skill clue", "chapter-championship-subject");
      appendChapterText(figure, "p", stimulus.eventDescription, "chapter-championship-clue");
      appendChapterText(figure, "figcaption", "Choose the star whose challenge uses the skill described above.", "chapter-championship-caption");
    } else {
      appendChapterText(figure, "h5", "The balanced constellation", "chapter-championship-title");
      const list = documentRef.createElement("ul");
      list.className = "chapter-championship-counts";
      for (const entry of (stimulus.counts ?? [])) {
        const item = documentRef.createElement("li");
        const label = documentRef.createElement("strong");
        label.textContent = entry.label;
        const tally = documentRef.createElement("span");
        tally.textContent = entry.current + " of " + entry.target + " stars";
        item.append(label, tally);
        list.append(item);
      }
      figure.append(list);
      if (stimulus.mode === "replace-overfilled") {
        appendChapterText(figure, "figcaption", "There are 12 selected stars. Compare each subject with four and count the overfilled selections that must be replaced.", "chapter-championship-caption");
      } else {
        appendChapterText(figure, "figcaption", "Each subject needs four stars. Compare the current counts with the targets above.", "chapter-championship-caption");
      }
    }

    parent.append(figure);
  }


  function renderChapterChimeraStimulus(parent, stimulus) {
    if (!stimulus || ![
      "chimera-division", "chimera-arithmetic", "chimera-multi-step",
      "chimera-operation-blueprint", "chimera-supply-plan"
    ].includes(stimulus.kind)) return;

    const figure = documentRef.createElement("figure");
    figure.className = "chapter-chimera-visual";

    if (stimulus.kind === "chimera-division") {
      appendChapterText(figure, "h5", "Equal groups", "chapter-chimera-title");
      const groups = documentRef.createElement("div");
      groups.className = "chapter-chimera-division";
      const total = documentRef.createElement("div");
      total.className = "chapter-chimera-number";
      appendChapterText(total, "span", "TOTAL", "chapter-chimera-kicker");
      appendChapterText(total, "strong", String(stimulus.total), "chapter-chimera-value");
      appendChapterText(total, "small", stimulus.itemLabel ?? "items", "chapter-chimera-caption");
      const divisor = documentRef.createElement("div");
      divisor.className = "chapter-chimera-number";
      appendChapterText(divisor, "span", "EQUAL GROUPS", "chapter-chimera-kicker");
      appendChapterText(divisor, "strong", String(stimulus.divisor), "chapter-chimera-value");
      appendChapterText(divisor, "small", stimulus.groupLabel ?? "groups", "chapter-chimera-caption");
      const questionMark = documentRef.createElement("div");
      questionMark.className = "chapter-chimera-number is-question";
      appendChapterText(questionMark, "span", "IN EACH", "chapter-chimera-kicker");
      appendChapterText(questionMark, "strong", "?", "chapter-chimera-value");
      groups.append(total, divisor, questionMark);
      figure.append(groups);
      appendChapterText(figure, "figcaption", "Divide the total equally among the groups.", "chapter-chimera-footnote");
    } else if (stimulus.kind === "chimera-arithmetic") {
      appendChapterText(figure, "h5", "The place-value forge", "chapter-chimera-title");
      const equation = documentRef.createElement("div");
      equation.className = "chapter-chimera-equation";
      appendChapterText(equation, "strong", stimulus.left, "chapter-chimera-operand");
      appendChapterText(equation, "span", stimulus.symbol, "chapter-chimera-operation");
      appendChapterText(equation, "strong", stimulus.right, "chapter-chimera-operand");
      appendChapterText(equation, "span", "=", "chapter-chimera-operation");
      appendChapterText(equation, "strong", "?", "chapter-chimera-result");
      equation.setAttribute("aria-label", stimulus.left + " " + stimulus.operation + " " + stimulus.right + " equals question mark");
      figure.append(equation);
      appendChapterText(figure, "figcaption", "Keep the place values organized and check your result.", "chapter-chimera-footnote");
    } else if (stimulus.kind === "chimera-operation-blueprint") {
      appendChapterText(figure, "h5", stimulus.title ?? "Operation blueprints", "chapter-chimera-title");
      appendChapterText(figure, "p", stimulus.story ?? "", "chapter-chimera-story");
      appendChapterText(figure, "p", "Starting amount: " + Number(stimulus.startingValue).toLocaleString("en-US"), "chapter-chimera-question");
      appendChapterText(figure, "p", stimulus.question ?? "", "chapter-chimera-question");
      const plans = documentRef.createElement("ol");
      plans.className = "chapter-chimera-blueprint-plans";
      const operationLabels = { add: "Add", subtract: "Subtract", multiply: "Multiply by", divide: "Divide by" };
      for (const plan of (stimulus.plans ?? [])) {
        const item = documentRef.createElement("li");
        const heading = documentRef.createElement("strong");
        heading.textContent = "Plan " + plan.label;
        const sequence = documentRef.createElement("span");
        sequence.textContent = plan.steps.map((step) =>
          operationLabels[step.operation] + " " + Number(step.operand).toLocaleString("en-US")
        ).join(" → ");
        item.append(heading, sequence);
        plans.append(item);
      }
      figure.append(plans);
      appendChapterText(figure, "figcaption", "Choose the plan that matches every event in the story, in order.", "chapter-chimera-footnote");
    } else if (stimulus.kind === "chimera-supply-plan") {
      appendChapterText(figure, "h5", stimulus.title ?? "Workshop supply order", "chapter-chimera-title");
      appendChapterText(figure, "p", stimulus.story ?? "", "chapter-chimera-story");
      appendChapterText(figure, "p", stimulus.question ?? "", "chapter-chimera-question");
      const clues = documentRef.createElement("ol");
      clues.className = "chapter-chimera-step-prompts";
      clues.setAttribute("aria-label", "Steps for solving the workshop supply problem");
      for (const clue of (stimulus.clues ?? [])) {
        const item = documentRef.createElement("li");
        item.textContent = clue;
        clues.append(item);
      }
      figure.append(clues);
    } else {
      appendChapterText(figure, "h5", stimulus.title ?? "A path through the clues", "chapter-chimera-title");
      appendChapterText(figure, "p", stimulus.story ?? "", "chapter-chimera-story");
      appendChapterText(figure, "p", stimulus.question ?? "", "chapter-chimera-question");
      const steps = documentRef.createElement("ol");
      steps.className = "chapter-chimera-step-prompts";
      steps.setAttribute("aria-label", "A plan for solving the word problem");
      for (const prompt of (stimulus.stepPrompts ?? [])) {
        const item = documentRef.createElement("li");
        item.textContent = prompt;
        steps.append(item);
      }
      figure.append(steps);
    }

    parent.append(figure);
  }


  function renderChapterHabitatStimulus(parent, stimulus) {
    if (!stimulus || !["habitat-creature", "adaptation-clue", "ecosystem-connection", "ecosystem-effect-clue"].includes(stimulus.kind)) return;
    const figure = documentRef.createElement("figure");
    figure.className = "chapter-habitat-visual";
    const symbol = documentRef.createElement("span");
    symbol.className = "chapter-habitat-symbol";
    symbol.textContent = stimulus.symbol ?? "🌿";
    symbol.setAttribute("aria-hidden", "true");
    figure.append(symbol);

    if (stimulus.kind === "habitat-creature") {
      appendChapterText(figure, "h5", stimulus.animal, "chapter-habitat-title");
      appendChapterText(figure, "p", "Climate clue", "chapter-habitat-kicker");
      appendChapterText(figure, "p", stimulus.climateClue, "chapter-habitat-copy");
      appendChapterText(figure, "p", "Food and shelter needs", "chapter-habitat-kicker");
      appendChapterText(figure, "p", stimulus.needsClue, "chapter-habitat-copy");
    } else if (stimulus.kind === "adaptation-clue") {
      appendChapterText(figure, "h5", stimulus.animal, "chapter-habitat-title");
      appendChapterText(figure, "p", "Field observation", "chapter-habitat-kicker");
      appendChapterText(figure, "strong", stimulus.feature, "chapter-habitat-feature");
      appendChapterText(figure, "p", stimulus.description, "chapter-habitat-copy");
    } else if (stimulus.kind === "ecosystem-effect-clue") {
      appendChapterText(figure, "h5", stimulus.title ?? "Habitat monitor", "chapter-habitat-title");
      appendChapterText(figure, "p", "Field location", "chapter-habitat-kicker");
      appendChapterText(figure, "p", stimulus.context, "chapter-habitat-copy");
      appendChapterText(figure, "p", "Observed ecosystem effect", "chapter-habitat-kicker");
      appendChapterText(figure, "strong", stimulus.effect, "chapter-habitat-feature");
    } else {
      appendChapterText(figure, "h5", stimulus.organism, "chapter-habitat-title");
      appendChapterText(figure, "p", "Ecosystem field note", "chapter-habitat-kicker");
      appendChapterText(figure, "strong", stimulus.action, "chapter-habitat-feature");
      appendChapterText(figure, "p", stimulus.context, "chapter-habitat-copy");
    }
    parent.append(figure);
  }


  function renderChapterGeometryStimulus(parent, stimulus) {
    if (!stimulus || !["geometry-shape", "geometry-angle", "geometry-rectangle"].includes(stimulus.kind)) return;
    const figure = documentRef.createElement("figure");
    figure.className = "chapter-geometry-visual";
    const namespace = "http://www.w3.org/2000/svg";
    const svg = documentRef.createElementNS(namespace, "svg");
    svg.classList.add("chapter-geometry-svg");
    svg.setAttribute("viewBox", "0 0 300 220");
    svg.setAttribute("role", "img");
    svg.setAttribute("focusable", "false");
    const addSvg = (name, attributes, value) => {
      const element = documentRef.createElementNS(namespace, name);
      for (const [key, item] of Object.entries(attributes)) element.setAttribute(key, String(item));
      if (value !== undefined) element.textContent = value;
      svg.append(element);
      return element;
    };
    if (stimulus.kind === "geometry-shape") {
      const points = {
        triangle: "150,56 220,177 80,177",
        square: "95,45 205,45 205,155 95,155",
        rectangle: "65,65 235,65 235,135 65,135",
        rhombus: "150,45 240,105 150,165 60,105",
        pentagon: "150,25 225,80 197,170 103,170 75,80",
        hexagon: "150,20 215,58 215,142 150,180 85,142 85,58"
      }[stimulus.shape];
      if (!points) return;
      svg.setAttribute("aria-label", stimulus.label + " diagram. " + (stimulus.properties ?? ""));
      addSvg("polygon", { points, fill: "#f7effd", stroke: "#76539a", "stroke-width": 4, "stroke-linejoin": "round" });
      if (stimulus.focus === "symmetry" && Number.isInteger(stimulus.symmetryLines)) {
        const axes = {
          triangle: { x: 150, y: 137, degrees: [30, 90, 150] },
          square: { x: 150, y: 100, degrees: [0, 45, 90, 135] },
          rectangle: { x: 150, y: 100, degrees: [0, 90] },
          rhombus: { x: 150, y: 105, degrees: [0, 90] },
          pentagon: { x: 150, y: 105, degrees: [18, 54, 90, 126, 162] },
          hexagon: { x: 150, y: 100, degrees: [0, 30, 60, 90, 120, 150] }
        }[stimulus.shape];
        if (axes) {
          const defs = documentRef.createElementNS(namespace, "defs");
          const clip = documentRef.createElementNS(namespace, "clipPath");
          clip.setAttribute("id", "chapter-geometry-symmetry-clip");
          const clipPolygon = documentRef.createElementNS(namespace, "polygon");
          clipPolygon.setAttribute("points", points);
          clip.append(clipPolygon);
          defs.append(clip);
          svg.append(defs);
          for (const degree of axes.degrees) {
            const angle = degree * Math.PI / 180;
            const dx = 140 * Math.cos(angle), dy = 140 * Math.sin(angle);
            addSvg("line", {
              x1: axes.x - dx, y1: axes.y - dy, x2: axes.x + dx, y2: axes.y + dy,
              stroke: "#c18c48", "stroke-width": 2.4, "stroke-dasharray": "6 5",
              "stroke-linecap": "round", "clip-path": "url(#chapter-geometry-symmetry-clip)"
            });
          }
        }
      }
      appendChapterText(figure, "figcaption",
        stimulus.focus === "symmetry"
          ? "Imagine folding the " + stimulus.label + " along each dotted line."
          : stimulus.properties,
        "chapter-geometry-caption");
    } else if (stimulus.kind === "geometry-angle") {
      const degrees = stimulus.degrees;
      if (!Number.isInteger(degrees) || degrees < 1 || degrees > 180) return;
      const cx = 150, cy = 165, length = 108, radius = 27;
      const radians = degrees * Math.PI / 180;
      const endX = cx + length * Math.cos(radians), endY = cy - length * Math.sin(radians);
      const arcX = cx + radius * Math.cos(radians), arcY = cy - radius * Math.sin(radians);
      svg.setAttribute("aria-label", "An angle measuring " + degrees + " degrees.");
      addSvg("line", { x1: cx, y1: cy, x2: cx + length, y2: cy, stroke: "#76539a", "stroke-width": 5, "stroke-linecap": "round" });
      addSvg("line", { x1: cx, y1: cy, x2: endX, y2: endY, stroke: "#76539a", "stroke-width": 5, "stroke-linecap": "round" });
      addSvg("path", {
        d: "M " + (cx + radius) + " " + cy + " A " + radius + " " + radius + " 0 0 0 " + arcX + " " + arcY,
        fill: "none", stroke: "#c18c48", "stroke-width": 3
      });
      addSvg("circle", { cx, cy, r: 5, fill: "#c18c48" });
      addSvg("text", { x: 150, y: 32, "text-anchor": "middle", fill: "#60417f", "font-size": 19, "font-weight": 800 }, degrees + "°");
      appendChapterText(figure, "figcaption", "Compare the opening with a 90° right angle.", "chapter-geometry-caption");
    } else if (stimulus.kind === "geometry-rectangle") {
      const width = stimulus.width, height = stimulus.height;
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 20 || height > 20) return;
      if (stimulus.storyTitle) {
        appendChapterText(figure, "h5", stimulus.storyTitle, "chapter-geometry-story-title");
      }
      if (stimulus.storyText) {
        appendChapterText(figure, "p", stimulus.storyText, "chapter-geometry-story-copy");
      }
      const cell = 14, x = 55, y = 45, rectangleWidth = width * cell, rectangleHeight = height * cell;
      svg.setAttribute("viewBox", "0 0 " + (rectangleWidth + 118) + " " + (rectangleHeight + 100));
      svg.setAttribute("aria-label", "A rectangle " + width + " centimeters wide and " + height + " centimeters tall.");
      addSvg("rect", { x, y, width: rectangleWidth, height: rectangleHeight, fill: "#f5edf9", stroke: "#76539a", "stroke-width": 3 });
      for (let index = 1; index < width; index += 1) {
        addSvg("line", { x1: x + index * cell, y1: y, x2: x + index * cell, y2: y + rectangleHeight, stroke: "#c6b4d7", "stroke-width": 1 });
      }
      for (let index = 1; index < height; index += 1) {
        addSvg("line", { x1: x, y1: y + index * cell, x2: x + rectangleWidth, y2: y + index * cell, stroke: "#c6b4d7", "stroke-width": 1 });
      }
      addSvg("text", { x: x + rectangleWidth / 2, y: y - 15, "text-anchor": "middle", fill: "#60417f", "font-size": 13, "font-weight": 800 }, width + " cm");
      addSvg("text", { x: x + rectangleWidth + 12, y: y + rectangleHeight / 2, "text-anchor": "start", fill: "#60417f", "font-size": 13, "font-weight": 800 }, height + " cm");
      appendChapterText(figure, "figcaption",
        stimulus.focus === "perimeter"
          ? "Trace the four outside edges to measure around the rectangle."
          : "Each small tile is one square centimeter. Count the tiles inside.",
        "chapter-geometry-caption");
    }
    figure.append(svg);
    parent.append(figure);
  }

  function renderGrandStarlightShowcase(parent, routineId) {
    const showcase = documentRef.createElement("section");
    showcase.className = "chapter-showcase";
    showcase.setAttribute("aria-label", "Your academy progress showcase");
    appendChapterText(showcase, "h3", "Your championship keepsakes", "chapter-showcase-title");
    const grid = documentRef.createElement("div");
    grid.className = "chapter-showcase-grid";

    function addCard(title, value, detail) {
      const card = documentRef.createElement("article");
      card.className = "chapter-showcase-card";
      appendChapterText(card, "h4", title);
      appendChapterText(card, "p", value, "chapter-showcase-value");
      appendChapterText(card, "p", detail, "chapter-showcase-detail");
      grid.append(card);
    }

    const completedChapters = chapterRuntimeService?.getSnapshot?.().chapters
      ?.filter((chapter) => chapter.id.startsWith("chapter-") && chapter.id !== "chapter-10" && chapter.progress?.status === "completed").length ?? 0;
    addCard(
      "Your academy character",
      "The Starlight Explorer",
      "Your character has completed " + completedChapters + " earlier chapters and reached the Grand Starlight Championship."
    );

    const equipped = wardrobeService?.getPreview?.().equipped ?? [];
    const outfit = equipped
      .filter((entry) => entry.item)
      .map((entry) => entry.slot.charAt(0).toUpperCase() + entry.slot.slice(1) + ": " + entry.item.title);
    addCard(
      "Your chosen outfit",
      outfit.length ? outfit.join(" · ") : "Ready for a new look",
      outfit.length ? "These are the pieces currently equipped in your Wardrobe Studio." : "Visit the Wardrobe Studio whenever you would like to choose an outfit."
    );

    const activePet = petCollectionService?.getSnapshot?.().activePet ?? null;
    if (activePet) {
      const palette = activePet.appearancePalettes?.find((entry) => entry.id === activePet.appearance?.paletteId);
      addCard(
        "Your companion",
        (activePet.symbol ? activePet.symbol + " " : "") + activePet.title,
        (palette ? palette.label + " palette · " : "")
          + activePet.careMoments + " care moments · " + activePet.bondExperience + " bond experience"
      );
    } else {
      addCard("Your companion", "A friend is waiting", "Companions are optional. Visit Pets whenever you are ready.");
    }

    const routine = gymnasticsService?.getSnapshot?.().routines
      ?.find((entry) => entry.id === routineId) ?? null;
    const progress = routine?.progress;
    const gymnasticsDetail = progress?.completedRuns
      ? progress.completedRuns + " completed practice" + (progress.completedRuns === 1 ? "" : "s")
        + " · best score " + progress.personalBest.combinedScore + "% · "
        + "★".repeat(progress.personalBest.starRating) + "☆".repeat(3 - progress.personalBest.starRating)
      : "No saved score yet. Your first routine can be just for exploring.";
    addCard("Your ribbon progress", routine?.title ?? "Starlight Ribbon Waltz", gymnasticsDetail);

    showcase.append(grid);
    parent.append(showcase);
  }

  function renderChapterActivity(snapshot, activity) {
    const body = panel.chapterActivityBody;
    body.replaceChildren();
    if (!activity) return;
    const metadata = activity.metadata ?? {};
    if (activity.type === "story" || activity.type === "reflection") {
      const scene = documentRef.createElement("div");
      scene.className = "chapter-story-scene";
      for (const paragraph of Array.isArray(metadata.paragraphs) ? metadata.paragraphs : [activity.description]) {
        appendChapterText(scene, "p", paragraph);
      }
      if (metadata.showcase === "grand-starlight") {
        renderGrandStarlightShowcase(scene, metadata.routineId);
      }
      if (narrationService && metadata.paragraphs?.length) {
        const readButton = documentRef.createElement("button");
        readButton.type = "button";
        readButton.className = "wardrobe-secondary-action";
        readButton.dataset.chapterAction = "read-aloud";
        readButton.textContent = "Read this scene aloud";
        scene.append(readButton);
      }
      body.append(scene);
      return;
    }
    if (activity.type === "learning" || activity.type === "challenge") {
      const question = ensureChapterQuestion(activity);
      if (!question) {
        appendChapterText(body, "p", "This learning activity is not connected yet.");
        return;
      }
      const definition = activityRegistry.get(activity.activityId);
      const questionCount = Math.max(1, Number.isInteger(metadata.questionCount) ? metadata.questionCount : 1);
      const card = documentRef.createElement("section");
      card.className = "chapter-question-card";
      card.setAttribute(
        "aria-label",
        activity.type === "challenge" ? activity.title + " question" : activity.title + " learning question"
      );
      if (activity.type === "challenge") {
        appendChapterText(card, "p", (metadata.challengeLabel ?? "Challenge progress") + ": " + (chapterQuestionIndex + 1) + " of " + questionCount);
      } else if (metadata.lessonLabel) {
        appendChapterText(card, "p", metadata.lessonLabel, "chapter-question-kicker");
      }
      appendChapterText(card, "h4", question.prompt, "chapter-question-prompt");
      renderChapterFractionStimulus(card, question.stimulus);
      renderChapterWordStimulus(card, question.stimulus);
      renderChapterGeometryStimulus(card, question.stimulus);
      renderChapterHabitatStimulus(card, question.stimulus);
      renderChapterPlantStimulus(card, question.stimulus);
      renderChapterLanguageStimulus(card, question.stimulus);
      renderChapterMeasurementStimulus(card, question.stimulus);
      renderChapterChimeraStimulus(card, question.stimulus);
      renderChapterChampionshipStimulus(card, question.stimulus);
      appendChapterText(card, "p", "Choose with the mouse or press 1–4. Press H whenever you would like a hint.", "chapter-question-help");
      const choices = documentRef.createElement("div");
      choices.className = "chapter-answer-grid";
      choices.setAttribute("role", "group");
      choices.setAttribute("aria-label", "Choose an answer");
      for (const [choiceIndex, choice] of (question.choices ?? []).entries()) {
        const button = documentRef.createElement("button");
        button.type = "button";
        button.className = "chapter-answer-choice";
        button.dataset.chapterAnswer = String(choice);
        button.textContent = (choiceIndex + 1) + ". " + String(choice);
        button.setAttribute("aria-label", "Choice " + (choiceIndex + 1) + ", answer " + choice);
        choices.append(button);
      }
      card.append(choices);
      const feedback = documentRef.createElement("p");
      feedback.className = "chapter-question-feedback";
      feedback.setAttribute("role", "status");
      feedback.setAttribute("aria-live", "polite");
      feedback.textContent = chapterActivityFeedback || "Choose an answer. You can retry or ask Professor Hoot for a clue.";
      card.append(feedback);
      const tools = documentRef.createElement("div");
      tools.className = "chapter-question-tools";
      const hintButton = documentRef.createElement("button");
      hintButton.type = "button";
      hintButton.className = "wardrobe-secondary-action";
      hintButton.dataset.chapterAction = "request-hint";
      hintButton.textContent = "Ask Professor Hoot for a hint";
      tools.append(hintButton);
      if (chapterQuestionAttempts > 0) {
        const parallelButton = documentRef.createElement("button");
        parallelButton.type = "button";
        parallelButton.className = "wardrobe-secondary-action";
        parallelButton.dataset.chapterAction = "parallel-question";
        parallelButton.textContent = "Try a fresh example";
        tools.append(parallelButton);
      }
      card.append(tools);
      if (chapterHintPresentation?.available) {
        const hint = documentRef.createElement("aside");
        hint.className = "chapter-hint-card";
        appendChapterText(hint, "h5", chapterHintPresentation.title + " · Clue " + chapterHintPresentation.stage);
        appendChapterText(hint, "p", chapterHintPresentation.visibleTextEquivalent ?? chapterHintPresentation.message);
        const demonstration = chapterHintPresentation.demonstration;
        if (demonstration) {
          appendChapterText(hint, "h6", demonstration.title);
          appendChapterText(hint, "p", demonstration.introduction);
          const list = documentRef.createElement("ol");
          for (const step of demonstration.steps) {
            const item = documentRef.createElement("li");
            const strong = documentRef.createElement("strong");
            strong.textContent = step.label + ": ";
            item.append(strong, documentRef.createTextNode(step.explanation + " (" + step.visual.content + ")"));
            list.append(item);
          }
          hint.append(list);
          appendChapterText(hint, "p", demonstration.summary);
        }
        card.append(hint);
      }
      body.append(card);
      return;
    }
    if (activity.type === "gymnastics") {
      const card = documentRef.createElement("div");
      card.className = "chapter-story-scene";
      appendChapterText(card, "p", "Your movement studio is ready below. Start the ribbon routine, trace at your own pace, then tap along with each star. A missed beat never stops the routine.");
      appendChapterText(card, "p", "The activity is saved when the routine reaches its finish. You may also skip this step and return to it on a replay.");
      body.append(card);
      return;
    }
    appendChapterText(body, "p", activity.description);
  }

  function recordChapterEvidence(question, correct, hintLevel) {
    if (!question?.skillIds?.length) return;
    store.dispatch({
      type: "curriculum/evidence-recorded",
      payload: {
        skillId: question.skillIds[0],
        activityId: question.activityId,
        tier: question.tier,
        correct,
        hintLevel: Math.max(0, Math.min(3, hintLevel)),
        attempts: 1
      }
    });
  }

  function submitChapterAnswer(answer) {
    if (!activeChapterSession || !chapterQuestion) return;
    const question = chapterQuestion;
    const correct = checkActivityAnswer(answer, question.correctAnswer, question.answerRules);
    chapterQuestionAttempts += 1;
    if (correct) {
      const hintLevel = hintService?.getSession?.(question.id)?.lastHintStage ?? 0;
      recordChapterEvidence(question, true, hintLevel);
      hintService?.complete?.(question.id);
      const snapshot = activeChapterSession.getSnapshot();
      const activity = snapshot.currentActivity;
      const questionCount = Math.max(1, Number.isInteger(activity?.metadata?.questionCount) ? activity.metadata.questionCount : 1);
      if (chapterQuestionIndex + 1 >= questionCount) {
        chapterActivityFeedback = activity?.metadata?.successText ?? "Lovely work. You completed this activity.";
        activeChapterSession.completeActivity();
        resetChapterQuestion();
      } else {
        chapterQuestionIndex += 1;
        chapterQuestion = null;
        chapterQuestionAttempts = 0;
        chapterHintPresentation = null;
        chapterActivityFeedback = "Lantern lit! One more puzzle is waiting.";
      }
      renderChapters();
      focusChapterStep();
      return;
    }
    const presentation = hintService?.recordIncorrect?.(question) ?? null;
    const hintLevel = presentation?.stage ?? hintService?.getSession?.(question.id)?.lastHintStage ?? 0;
    recordChapterEvidence(question, false, hintLevel);
    chapterHintPresentation = presentation;
    chapterActivityFeedback = "Good try. Take another look, use a clue, and try again. There is no penalty for taking your time.";
    renderChapters();
    focusChapterStep();
  }

  function focusChapterStep() {
    if (activeChapterSession?.getSnapshot?.().isComplete) {
      const completionButton = panel.chapterSessionCompletion.querySelector("button");
      completionButton?.focus?.();
      return;
    }
    const firstAnswer = panel.chapterActivityBody.querySelector("[data-chapter-answer]");
    if (firstAnswer && typeof firstAnswer.focus === "function") {
      firstAnswer.focus();
      return;
    }
    const continueButton = panel.chapterSessionActions.querySelector(
      '[data-chapter-action="complete-activity"]:not([hidden])'
    );
    if (activeChapterSession && continueButton && typeof continueButton.focus === "function") {
      continueButton.focus();
      return;
    }
    if (activeChapterSession?.getSnapshot?.().currentActivity?.type === "gymnastics"
        && !panel.gymnasticsPanel.hidden && typeof panel.gymnasticsStart.focus === "function") {
      panel.gymnasticsStart.focus();
      return;
    }
    const pathAction = panel.chapterPathList.querySelector('[data-chapter-action="start"]:not([disabled])');
    pathAction?.focus?.();
  }

  const chapterInputController = createChapterInputController({
    getCurrentActivity: () => (store.getState()?.ui?.activeOverlayId ?? null) === null
      ? activeChapterSession?.getSnapshot?.().currentActivity ?? null
      : null,
    getCurrentQuestion: () => chapterQuestion,
    onAnswer: (answer) => submitChapterAnswer(answer),
    onHint: (question) => {
      chapterHintPresentation = hintService?.requestHint?.(question) ?? null;
      chapterActivityFeedback = "A clue is ready. Read it, then try the same question again.";
      renderChapters();
      focusChapterStep();
    }
  });

  function handleChapterKeydown(event) {
    chapterInputController.handleKeydown(event);
  }

  function renderChapters() {
    if (!chapterRuntimeService) {
      panel.chapterPathList.textContent = "The chapter runtime is not connected.";
      panel.chapterSession.hidden = true;
      return;
    }
    const runtimeEntries = chapterRuntimeService.getSnapshot().chapters;
    const chapters = runtimeEntries.filter((entry) => entry.id.startsWith("chapter-"));
    const quests = runtimeEntries.filter((entry) => entry.id.startsWith("quest-"));
    if (!activeChapterSession) {
      panel.chapterSession.hidden = true;
      panel.chapterPathList.hidden = false;
      if (chapters.length === 0) {
        const empty = documentRef.createElement("article");
        empty.className = "chapter-path-empty";
        const title = documentRef.createElement("h3");
        title.textContent = "The academy stories are being prepared";
        const description = documentRef.createElement("p");
        description.textContent = "Your chapter runtime is ready. The first complete adventure is ready. Follow the fireflies and bring the Lantern Tree back to life.";
        empty.append(title, description);
        panel.chapterPathList.replaceChildren(empty);
        return;
      }
      const fragment = documentRef.createDocumentFragment();
      for (const chapter of chapters) {
        const card = documentRef.createElement("article");
        card.className = "chapter-path-card";
        card.dataset.chapterState = chapter.progress.status;
        const number = documentRef.createElement("span");
        number.className = "chapter-path-number";
        number.textContent = chapter.id.replace("chapter-", "CHAPTER ");
        const title = documentRef.createElement("h3");
        title.textContent = chapter.title;
        const description = documentRef.createElement("p");
        description.textContent = chapter.description;
        const objectives = documentRef.createElement("p");
        objectives.className = "chapter-path-objectives";
        objectives.textContent = "Goals: " + chapter.objectives.join(" · ");
        const details = documentRef.createElement("p");
        details.className = "chapter-path-details";
        details.textContent = chapter.activities.length + " activities · "
          + (chapter.progress.status === "completed"
            ? "Completed " + chapter.progress.completedRuns + (chapter.progress.completedRuns === 1 ? " time" : " times")
            : chapter.progress.status === "in-progress"
              ? "Step " + (chapter.progress.currentActivityIndex + 1) + " of " + chapter.activities.length
              : "Ready to explore");
        const action = documentRef.createElement("button");
        action.type = "button";
        action.className = "wardrobe-primary-action";
        action.dataset.chapterAction = "start";
        action.dataset.chapterId = chapter.id;
        action.disabled = !chapter.prerequisitesMet;
        action.textContent = !chapter.prerequisitesMet ? "Complete earlier chapters first"
          : chapter.progress.status === "completed" ? "Replay chapter"
            : chapter.progress.status === "in-progress" ? "Continue adventure" : "Begin adventure";
        card.append(number, title, description, objectives, details, action);
        fragment.append(card);
      }
      if (quests.length > 0) {
        const questSection = documentRef.createElement("section");
        questSection.className = "chapter-optional-quests";
        questSection.setAttribute("aria-label", "Optional side quests");
        appendChapterText(questSection, "h3", "Optional Side Quests", "chapter-optional-quests-title");
        appendChapterText(
          questSection,
          "p",
          "Extra adventures are always optional. They add practice and rewards, but never stand between you and the next chapter.",
          "chapter-optional-quests-description"
        );
        const questGrid = documentRef.createElement("div");
        questGrid.className = "chapter-optional-quests-grid";
        for (const quest of quests) {
          const card = documentRef.createElement("article");
          card.className = "chapter-path-card chapter-optional-quest-card";
          card.dataset.chapterState = quest.progress.status;
          const number = documentRef.createElement("span");
          number.className = "chapter-path-number";
          number.textContent = "OPTIONAL QUEST " + quest.id.slice(-2);
          const title = documentRef.createElement("h3");
          title.textContent = quest.title;
          const description = documentRef.createElement("p");
          description.textContent = quest.description;
          const objectives = documentRef.createElement("p");
          objectives.className = "chapter-path-objectives";
          objectives.textContent = "Goals: " + quest.objectives.join(" · ");
          const details = documentRef.createElement("p");
          details.className = "chapter-path-details";
          details.textContent = quest.activities.length + " activities · "
            + (quest.progress.status === "completed"
              ? "Completed " + quest.progress.completedRuns + (quest.progress.completedRuns === 1 ? " time" : " times")
              : quest.progress.status === "in-progress"
                ? "Step " + (quest.progress.currentActivityIndex + 1) + " of " + quest.activities.length
                : "Ready when Chapter 1 is complete");
          const action = documentRef.createElement("button");
          action.type = "button";
          action.className = "wardrobe-primary-action";
          action.dataset.chapterAction = "start";
          action.dataset.chapterId = quest.id;
          action.disabled = !quest.prerequisitesMet;
          action.textContent = !quest.prerequisitesMet ? "Complete Chapter 1 to unlock"
            : quest.progress.status === "completed" ? "Replay optional quest"
              : quest.progress.status === "in-progress" ? "Continue optional quest" : "Start optional quest";
          card.append(number, title, description, objectives, details, action);
          questGrid.append(card);
        }
        questSection.append(questGrid);
        fragment.append(questSection);
      }
      panel.chapterPathList.replaceChildren(fragment);
      return;
    }

    panel.chapterPathList.hidden = true;
    panel.chapterSession.hidden = false;
    const snapshot = activeChapterSession.getSnapshot();
    const activity = snapshot.currentActivity;
    if (snapshot.isComplete) {
      const isOptionalQuest = snapshot.chapterId.startsWith("quest-");
      panel.chapterActivityBody.replaceChildren();
      panel.chapterActivityBody.hidden = true;
      panel.chapterSessionStatus.textContent = isOptionalQuest
        ? "Optional quest complete! You finished all " + snapshot.activityCount + " activities."
        : "Chapter complete! You finished all " + snapshot.activityCount + " activities.";
      panel.chapterSessionProgress.textContent = isOptionalQuest ? "OPTIONAL QUEST COMPLETE" : "ADVENTURE COMPLETE";
      const completionTitle = panel.chapterSessionCompletion.querySelector("h4");
      if (completionTitle) completionTitle.textContent = isOptionalQuest ? "Quest complete!" : "Chapter complete!";
      panel.chapterSessionTitle.textContent = snapshot.title;
      panel.chapterSessionDescription.textContent = snapshot.description;
      const currentRun = snapshot.completionReceipt?.currentRun;
      const personalBest = snapshot.completionReceipt?.personalBest;
      panel.chapterSessionType.textContent = snapshot.completedActivityCount + " completed · "
        + snapshot.skippedActivityCount + " skipped · "
        + (currentRun?.scorePercent ?? 0) + "% this run · "
        + (currentRun?.starRating ?? 0) + " stars · "
        + "Personal best " + (personalBest?.scorePercent ?? 0) + "% · "
        + (snapshot.completionReceipt?.rewards?.filter((reward) => reward.granted).length ?? 0) + " new rewards";
      panel.chapterSessionActions.hidden = true;
      panel.chapterSessionCompletion.hidden = false;
      const granted = snapshot.completionReceipt?.rewards?.filter((reward) => reward.granted).length ?? 0;
      const wardrobeReceipt = snapshot.completionReceipt?.wardrobe;
      const wardrobeTitles = (wardrobeReceipt?.unlockedItemIds ?? [])
        .map((itemId) => wardrobeService?.getInventory?.().find((item) => item.id === itemId)?.title ?? itemId);
      const wardrobeMessage = wardrobeTitles.length
        ? " You also unlocked " + wardrobeTitles.join(", ") + " in your Wardrobe."
        : wardrobeReceipt?.alreadyOwnedItemIds?.length
          ? " Your chapter outfit is already waiting in your Wardrobe."
          : "";
      const bestMessage = snapshot.completionReceipt?.personalBestImproved
        ? " You earned a new personal best!"
        : " Your previous personal best remains saved.";
      panel.chapterSessionReward.textContent = (granted > 0
        ? (isOptionalQuest
          ? "Your optional quest reward has been added to your academy progress. These extra adventures are separate from chapter completion."
          : "Your major chapter reward has been added to your academy progress. Replay is always welcome, but rewards are one-time.")
        : "Wonderful work. This replay kept your progress and did not duplicate any one-time rewards.")
        + bestMessage + wardrobeMessage;
      return;
    }
    panel.chapterSessionStatus.textContent = "Your place is saved automatically after each activity. You can safely exit at any time.";
    panel.chapterSessionProgress.textContent = "ACTIVITY " + (snapshot.currentActivityIndex + 1) + " OF " + snapshot.activityCount;
    panel.chapterSessionTitle.textContent = activity?.title ?? snapshot.title;
    panel.chapterSessionDescription.textContent = activity?.description ?? snapshot.description;
    panel.chapterSessionType.textContent = activity
      ? activity.type.toUpperCase().replaceAll("-", " ") + " · " + snapshot.completedActivityCount + " completed · " + snapshot.skippedActivityCount + " skipped"
      : "Ready to begin";
    panel.chapterActivityBody.hidden = !activity;
    renderChapterActivity(snapshot, activity);
    panel.chapterSessionActions.hidden = !activity;
    const completeButton = panel.chapterSessionActions.querySelector('[data-chapter-action="complete-activity"]');
    if (completeButton) {
      completeButton.hidden = Boolean(activity && ["learning", "challenge", "gymnastics"].includes(activity.type));
      completeButton.textContent = activity?.type === "story" ? "Continue the story" : "Complete activity";
    }
    panel.chapterSessionCompletion.hidden = true;
  }

  function renderQuestBoard() {
    if (!chapterRuntimeService) {
      panel.questBoardSummary.textContent = "The chapter and quest runtime is not connected.";
      panel.questChapterGrid.replaceChildren();
      panel.questQuestGrid.replaceChildren();
      return;
    }

    const board = buildQuestBoardSnapshot({
      progressionEntries: chapterRuntimeService.getSnapshot().chapters,
      state: store.getState()
    });
    const summaryCards = [
      ["Completed", board.summary.completed + " of " + board.summary.totalCount],
      ["In progress", String(board.summary.inProgress)],
      ["Ready to begin", String(board.summary.available)],
      ["Waiting to unlock", String(board.summary.locked)],
      ["Stars earned", board.summary.starsEarned + " of " + board.summary.starsPossible],
      ["Skills mastered", String(board.summary.masteredSkillCount)]
    ];
    const summaryFragment = documentRef.createDocumentFragment();
    for (const [label, value] of summaryCards) {
      const card = documentRef.createElement("article");
      card.className = "quest-board-summary-card";
      appendChapterText(card, "span", label, "quest-board-summary-label");
      appendChapterText(card, "strong", value, "quest-board-summary-value");
      summaryFragment.append(card);
    }
    panel.questBoardSummary.replaceChildren(summaryFragment);

    function createBoardCard(entry) {
      const card = documentRef.createElement("article");
      card.className = "quest-board-card";
      card.dataset.boardState = entry.status;
      appendChapterText(
        card,
        "span",
        entry.type === "quest" ? "OPTIONAL QUEST " + entry.id.slice(-2) : "CHAPTER " + entry.id.slice(-2),
        "quest-board-number"
      );
      appendChapterText(card, "h4", entry.title, "quest-board-card-title");
      appendChapterText(card, "p", entry.description, "quest-board-description");

      const statusLabel = entry.status === "completed" ? "Completed"
        : entry.status === "in-progress" ? "In progress · Activity " + Math.min(entry.currentActivityIndex + 1, entry.activityCount) + " of " + entry.activityCount
          : entry.status === "locked" ? "Locked" : "Ready to begin";
      appendChapterText(card, "p", statusLabel, "quest-board-status");

      const starLine = documentRef.createElement("p");
      starLine.className = "quest-board-stars";
      starLine.setAttribute("aria-label", "Personal best: " + entry.stars + " of 3 stars");
      starLine.textContent = entry.starsLabel + "  " + (entry.personalBestScore === null
        ? "No personal best yet" : "Personal best " + entry.personalBestScore + "%");
      card.append(starLine);

      const mastery = entry.mastery.skillCount
        ? "Mastery: " + entry.mastery.masteredSkillCount + " of " + entry.mastery.skillCount
          + " skills demonstrated" + (entry.mastery.practicedSkillCount
            ? " · " + entry.mastery.practicedSkillCount + " in practice" : "")
        : "No curriculum skill record is attached to these activities.";
      appendChapterText(card, "p", mastery, "quest-board-mastery");

      if (entry.skills.length) {
        const details = documentRef.createElement("details");
        details.className = "quest-board-skill-details";
        const summary = documentRef.createElement("summary");
        summary.textContent = "View skill record";
        const list = documentRef.createElement("ul");
        for (const skill of entry.skills) {
          const status = skill.masteryStatus === "demonstrated" ? "mastered"
            : skill.masteryStatus === "in-progress" ? "in practice" : "not started";
          appendChapterText(list, "li", skill.title + " — " + status);
        }
        details.append(summary, list);
        card.append(details);
      }

      const action = documentRef.createElement("button");
      action.type = "button";
      action.className = "wardrobe-primary-action";
      action.dataset.chapterAction = "start";
      action.dataset.chapterId = entry.id;
      if (entry.type === "quest") action.dataset.returnDock = "quests";
      action.disabled = entry.status === "locked";
      const sourceChapter = entry.prerequisiteChapterId
        ? "Chapter " + entry.prerequisiteChapterId.slice(-2) : "an earlier chapter";
      action.textContent = entry.status === "locked" ? "Complete " + sourceChapter + " to unlock"
        : entry.status === "completed" ? (entry.type === "quest" ? "Replay optional quest" : "Replay chapter")
          : entry.status === "in-progress" ? (entry.type === "quest" ? "Continue optional quest" : "Continue chapter")
            : (entry.type === "quest" ? "Begin optional quest" : "Begin chapter");
      card.append(action);
      if (entry.completedRuns > 0) {
        appendChapterText(card, "p", entry.completedRuns + " completed run" + (entry.completedRuns === 1 ? "" : "s")
          + " · replay keeps your best stars and once-only rewards", "quest-board-run-history");
      }
      return card;
    }

    panel.questChapterGrid.replaceChildren(...board.chapters.map(createBoardCard));
    panel.questQuestGrid.replaceChildren(...board.quests.map(createBoardCard));
  }

  function handleChapterAction(event) {
    const answerControl = event.target?.closest?.("[data-chapter-answer]");
    if (answerControl && root.contains(answerControl)) {
      try {
        const value = Number(answerControl.dataset.chapterAnswer);
        submitChapterAnswer(Number.isFinite(value) ? value : answerControl.dataset.chapterAnswer);
      } catch (error) {
        chapterActivityFeedback = error?.message || "That answer could not be checked. Please try again.";
        renderChapters();
      }
      return true;
    }
    const control = event.target?.closest?.("[data-chapter-action]");
    if (!control || !root.contains(control) || !chapterRuntimeService) return false;
    const action = control.dataset.chapterAction;
    try {
      if (action === "start") {
        activeChapterReturnDock = control.dataset.returnDock === "quests" ? "quests" : null;
        if (store.getState()?.app?.activeDockId !== "chapters") {
          store.dispatch({ type: "hub/dock-selected", payload: { dockId: "chapters" } });
        }
        activeChapterId = control.dataset.chapterId;
        resetChapterQuestion();
        activeChapterSession = chapterRuntimeService.createSession(activeChapterId);
        activeChapterSession.start();
      } else if (action === "complete-activity" && activeChapterSession) {
        activeChapterSession.completeActivity();
        resetChapterQuestion();
      } else if (action === "skip-activity" && activeChapterSession) {
        if (activeChapterSession.getSnapshot().currentActivity?.type === "gymnastics") {
          stopGymnasticsClock();
          gymnasticsSession = null;
          gymnasticsPointerActive = false;
          gymnasticsCueRoutine = null;
          chapterGymnasticsCompleted = false;
        }
        activeChapterSession.skipActivity();
        resetChapterQuestion();
      } else if (action === "request-hint" && activeChapterSession && chapterQuestion) {
        chapterHintPresentation = hintService?.requestHint?.(chapterQuestion) ?? null;
        chapterActivityFeedback = "A clue is ready. Read it, then try the same question again.";
      } else if (action === "parallel-question" && activeChapterSession && chapterQuestion) {
        const result = hintService?.solveParallel?.(chapterQuestion.id);
        if (result?.question) {
          chapterQuestion = result.question;
          chapterQuestionAttempts = 0;
          chapterHintPresentation = null;
          chapterActivityFeedback = "Here is a fresh example with the same skill. You can do it!";
        }
      } else if (action === "read-aloud" && activeChapterSession && narrationService) {
        const activity = activeChapterSession.getSnapshot().currentActivity;
        const paragraphs = activity?.metadata?.paragraphs ?? [];
        if (paragraphs.length) narrationService.speak(paragraphs.join(" "));
      } else if (action === "exit" && activeChapterSession) {
        activeChapterSession.exit();
        activeChapterSession = null;
        activeChapterId = null;
        resetChapterQuestion();
        const returnDock = activeChapterReturnDock;
        activeChapterReturnDock = null;
        if (returnDock) store.dispatch({ type: "hub/dock-selected", payload: { dockId: returnDock } });
        if (gymnasticsSession && gymnasticsSession.getSnapshot().stage !== "completed") {
          stopGymnasticsClock();
          gymnasticsSession = null;
          gymnasticsPointerActive = false;
          gymnasticsCueRoutine = null;
          chapterGymnasticsCompleted = false;
        }
      }
      renderChapters();
      focusChapterStep();
    } catch (error) {
      panel.chapterSession.hidden = false;
      panel.chapterSessionStatus.textContent = error?.message || "The chapter action could not be completed.";
    }
    return true;
  }

  function gymnasticsNow() {
    return windowRef?.performance?.now?.() ?? globalThis.performance?.now?.() ?? Date.now();
  }

  function stopGymnasticsClock() {
    if (gymnasticsClock === null) return;
    const clear = windowRef?.clearInterval?.bind(windowRef) ?? globalThis.clearInterval;
    clear(gymnasticsClock);
    gymnasticsClock = null;
  }

  function drawGymnasticsCanvas(snapshot = gymnasticsSession?.getSnapshot?.() ?? null) {
    const canvas = panel.gymnasticsCanvas;
    const context = canvas.getContext?.("2d");
    const routine = gymnasticsService?.getSnapshot?.().routines?.[0];
    if (!context || !routine) return;
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#fbf8fd";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "rgba(137, 111, 165, .12)";
    for (let x = 24; x < width; x += 36) {
      for (let y = 24; y < height; y += 36) {
        context.beginPath();
        context.arc(x, y, 1.5, 0, Math.PI * 2);
        context.fill();
      }
    }
    const path = routine.tracePath;
    const px = (point) => ({ x: point.x * width, y: point.y * height });
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    path.forEach((point, index) => {
      const position = px(point);
      if (index === 0) context.moveTo(position.x, position.y);
      else context.lineTo(position.x, position.y);
    });
    context.strokeStyle = "rgba(151, 120, 182, .23)";
    context.lineWidth = 28;
    context.stroke();
    context.setLineDash([9, 10]);
    context.strokeStyle = "#a98cc3";
    context.lineWidth = 6;
    context.stroke();
    context.setLineDash([]);
    for (let index = 0; index < path.length; index += 1) {
      const position = px(path[index]);
      context.beginPath();
      context.arc(position.x, position.y, index === 0 ? 10 : 5, 0, Math.PI * 2);
      context.fillStyle = index === 0 ? "#8e6db1" : "#c6b2d8";
      context.fill();
    }
    if (snapshot?.tracePoints?.length) {
      context.beginPath();
      snapshot.tracePoints.forEach((point, index) => {
        const position = px(point);
        if (index === 0) context.moveTo(position.x, position.y);
        else context.lineTo(position.x, position.y);
      });
      context.strokeStyle = "#e18bb6";
      context.lineWidth = 9;
      context.shadowColor = "rgba(225, 139, 182, .35)";
      context.shadowBlur = 8;
      context.stroke();
      context.shadowBlur = 0;
    }
    if (snapshot?.stage === "rhythm" && snapshot.nextCheckpointId) {
      const index = snapshot.checkpoints.findIndex((checkpoint) => checkpoint.id === snapshot.nextCheckpointId);
      const progress = Math.max(0, index) / Math.max(1, snapshot.checkpoints.length - 1);
      const segmentPosition = progress * (path.length - 1);
      const segmentIndex = Math.min(path.length - 2, Math.floor(segmentPosition));
      const amount = segmentPosition - segmentIndex;
      const a = path[segmentIndex], b = path[segmentIndex + 1];
      const marker = px({ x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount });
      context.beginPath();
      context.arc(marker.x, marker.y, 17, 0, Math.PI * 2);
      context.fillStyle = "#f4c86b";
      context.shadowColor = "rgba(244, 200, 107, .8)";
      context.shadowBlur = 18;
      context.fill();
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(marker.x, marker.y, 6, 0, Math.PI * 2);
      context.fillStyle = "#fff";
      context.fill();
    }
    context.restore();
  }

  function renderGymnastics(statusMessage = null) {
    if (!gymnasticsService) {
      panel.gymnasticsRoutineTitle.textContent = "Gymnastics is not connected";
      panel.gymnasticsRoutineDescription.textContent = "The routine engine will be available when its service is connected.";
      panel.gymnasticsStats.textContent = "";
      return;
    }
    const routine = gymnasticsService.getSnapshot().routines[0];
    if (!routine) return;
    panel.gymnasticsRoutineTitle.textContent = routine.title;
    panel.gymnasticsRoutineDescription.textContent = routine.description;
    const progress = routine.progress;
    panel.gymnasticsStats.textContent = progress.completedRuns > 0
      ? "Completed practices: " + progress.completedRuns + " · Best combined score: " + progress.personalBest.combinedScore + "% · Best stars: " + "★".repeat(progress.personalBest.starRating) + "☆".repeat(3 - progress.personalBest.starRating)
      : "No practice records yet. Your first try is just for exploring.";
    if (!gymnasticsSession) {
      panel.gymnasticsPractice.hidden = false;
      panel.gymnasticsStart.hidden = false;
      panel.gymnasticsStart.textContent = "Begin practice";
      panel.gymnasticsTraceActions.hidden = true;
      panel.gymnasticsRhythmActions.hidden = true;
      panel.gymnasticsResult.hidden = true;
      panel.gymnasticsBeat.disabled = true;
      panel.gymnasticsCanvasHelp.textContent = "Preview the glowing ribbon, then trace it with your mouse during practice. You can skip tracing whenever you like.";
      panel.gymnasticsStatus.textContent = statusMessage ?? gymnasticsStatusMessage;
      drawGymnasticsCanvas(null);
      return;
    }
    const snapshot = gymnasticsSession.getSnapshot();
    panel.gymnasticsPractice.hidden = false;
    panel.gymnasticsStart.hidden = snapshot.stage !== "completed";
    panel.gymnasticsStart.textContent = "Practice again";
    panel.gymnasticsTraceActions.hidden = snapshot.stage !== "tracing";
    panel.gymnasticsRhythmActions.hidden = snapshot.stage !== "rhythm";
    panel.gymnasticsResult.hidden = snapshot.stage !== "completed";
    panel.gymnasticsBeat.disabled = snapshot.stage !== "rhythm";
    panel.gymnasticsCanvasHelp.textContent = snapshot.stage === "rhythm"
      ? "Listen for the soft tick and tap the star. You can use the button or press Space when it is focused."
      : "During tracing, drag your mouse along the glowing ribbon, then continue to the rhythm.";
    panel.gymnasticsStatus.textContent = statusMessage ?? (
      snapshot.stage === "count-in" ? "Get ready! Count-in: " + snapshot.countInBeat
        : snapshot.stage === "tracing" ? "Trace the glowing ribbon. Move along the path, then choose Continue when you are ready."
          : snapshot.stage === "rhythm" ? "Star " + (snapshot.checkpoints.length - snapshot.checkpoints.filter((checkpoint) => checkpoint.status !== "pending").length + 1)
            + " of " + snapshot.checkpoints.length + " is waiting. Tap with the beat; a missed star never ends your routine."
            : snapshot.stage === "completed" ? "Routine complete! Your tracing and rhythm scores are saved separately. Lovely work!"
              : "Your routine is ready.");
    if (snapshot.stage === "completed") {
      panel.gymnasticsStars.textContent = "★".repeat(snapshot.starRating) + "☆".repeat(3 - snapshot.starRating);
      panel.gymnasticsStars.setAttribute("aria-label", snapshot.starRating + " out of 3 stars");
      panel.gymnasticsTraceScore.textContent = snapshot.traceAccuracyScore + "%";
      panel.gymnasticsRhythmScore.textContent = snapshot.rhythmTimingScore + "%";
      panel.gymnasticsCombinedScore.textContent = snapshot.combinedScore + "%";
      if (!gymnasticsRecorded) {
        gymnasticsRecorded = true;
        try {
          gymnasticsService.recordCompletion(gymnasticsSession);
        } catch (error) {
          gymnasticsRecorded = false;
          gymnasticsStatusMessage = error?.message || "The routine result could not be saved.";
        }
      }
    }
    drawGymnasticsCanvas(snapshot);
  }

  function startGymnasticsClock() {
    stopGymnasticsClock();
    const schedule = windowRef?.setInterval?.bind(windowRef) ?? globalThis.setInterval;
    gymnasticsClock = schedule(() => {
      if (!gymnasticsSession) { stopGymnasticsClock(); return; }
      try {
        const now = gymnasticsNow();
        const snapshot = gymnasticsSession.update(now);
        if (snapshot.stage === "count-in" && gymnasticsCueRoutine && gymnasticsCountInStartAt !== null) {
          const interval = 60000 / gymnasticsCueRoutine.bpm;
          let cueDue = false;
          while (gymnasticsCountInCueBeat < gymnasticsCueRoutine.countInBeats
              && now >= gymnasticsCountInStartAt + gymnasticsCountInCueBeat * interval) {
            gymnasticsCountInCueBeat += 1;
            cueDue = true;
          }
          if (cueDue) audioService?.playSfx?.("beat");
        }
        if (snapshot.stage === "rhythm" && gymnasticsCueRoutine && gymnasticsRhythmStartAt !== null) {
          const interval = 60000 / gymnasticsCueRoutine.bpm;
          let cueDue = false;
          while (gymnasticsRhythmCueIndex < gymnasticsCueRoutine.beatCheckpoints.length
              && now >= gymnasticsRhythmStartAt + gymnasticsCueRoutine.beatCheckpoints[gymnasticsRhythmCueIndex] * interval) {
            gymnasticsRhythmCueIndex += 1;
            cueDue = true;
          }
          if (cueDue) audioService?.playSfx?.("beat");
        }
        if (snapshot.stage === "tracing") {
          stopGymnasticsClock();
          gymnasticsCountInStartAt = null;
        }
        if (snapshot.stage === "completed") stopGymnasticsClock();
        renderGymnastics();
        if (snapshot.stage === "completed" && !chapterGymnasticsCompleted
            && activeChapterSession?.getSnapshot?.().currentActivity?.type === "gymnastics") {
          chapterGymnasticsCompleted = true;
          activeChapterSession.completeActivity();
          resetChapterQuestion();
          renderChapters();
          focusChapterStep();
        }
      } catch (error) {
        stopGymnasticsClock();
        gymnasticsStatusMessage = error?.message || "The routine clock could not continue.";
        renderGymnastics(gymnasticsStatusMessage);
      }
    }, 50);
  }

  function startGymnasticsPractice() {
    if (!gymnasticsService) return;
    const routine = gymnasticsService.getSnapshot().routines[0];
    if (!routine) return;
    stopGymnasticsClock();
    gymnasticsSession = gymnasticsService.createSession(routine.id);
    gymnasticsCueRoutine = routine;
    gymnasticsRecorded = false;
    chapterGymnasticsCompleted = false;
    gymnasticsRhythmStartAt = null;
    gymnasticsRhythmCueIndex = 0;
    gymnasticsStatusMessage = "Your count-in is beginning.";
    gymnasticsCountInStartAt = gymnasticsNow();
    gymnasticsCountInCueBeat = 1;
    gymnasticsSession.start(gymnasticsCountInStartAt);
    audioService?.playSfx?.("open");
    audioService?.playSfx?.("beat");
    renderGymnastics();
    startGymnasticsClock();
  }

  function handleGymnasticsAction(event) {
    const control = event.target?.closest?.("[data-gymnastics-action]");
    if (!control || !root.contains(control) || !gymnasticsService) return false;
    const action = control.dataset.gymnasticsAction;
    try {
      if (action === "start") {
        startGymnasticsPractice();
      } else if (action === "finish-trace" && gymnasticsSession) {
        const rhythmStartAt = gymnasticsNow();
        gymnasticsSession.finishTrace(rhythmStartAt);
        gymnasticsRhythmStartAt = rhythmStartAt;
        gymnasticsRhythmCueIndex = 0;
        if (gymnasticsCueRoutine?.beatCheckpoints?.[0] === 0) {
          audioService?.playSfx?.("beat");
          gymnasticsRhythmCueIndex = 1;
        }
        gymnasticsStatusMessage = "Now listen for the soft beat ticks and tap each star.";
        renderGymnastics();
        startGymnasticsClock();
      } else if (action === "tap-beat" && gymnasticsSession) {
        const result = gymnasticsSession.tapBeat(gymnasticsNow());
        if (result.accepted) audioService?.playSfx?.("correct");
        gymnasticsStatusMessage = result.accepted ? "Beat caught! Keep going." : "That one was a little early or late. The next star is waiting.";
        renderGymnastics(gymnasticsStatusMessage);
      }
    } catch (error) {
      gymnasticsStatusMessage = error?.message || "That routine action could not be completed.";
      renderGymnastics(gymnasticsStatusMessage);
    }
    return true;
  }

  function getGymnasticsPoint(event) {
    const rect = panel.gymnasticsCanvas.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0
        || event.clientX < rect.left || event.clientX >= rect.right
        || event.clientY < rect.top || event.clientY >= rect.bottom) return null;
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    };
  }

  function handleGymnasticsPointerDown(event) {
    if (!gymnasticsSession || gymnasticsSession.getSnapshot().stage !== "tracing"
        || event.button !== 0 || gymnasticsPointerActive) return;
    const point = getGymnasticsPoint(event);
    if (!point) return;
    event.preventDefault();
    gymnasticsPointerActive = true;
    panel.gymnasticsCanvas.setPointerCapture?.(event.pointerId);
    try {
      gymnasticsSession.recordTracePoint(point);
      drawGymnasticsCanvas();
    } catch (error) {
      gymnasticsPointerActive = false;
      renderGymnastics(error?.message || "The trace could not start.");
    }
  }

  function handleGymnasticsPointerMove(event) {
    if (!gymnasticsPointerActive || !gymnasticsSession) return;
    const point = getGymnasticsPoint(event);
    if (!point) return;
    event.preventDefault();
    try {
      gymnasticsSession.recordTracePoint(point);
      drawGymnasticsCanvas();
    } catch (error) {
      gymnasticsStatusMessage = error?.message || "The trace could not continue.";
    }
  }

  function handleGymnasticsPointerEnd() {
    if (!gymnasticsPointerActive) return;
    gymnasticsPointerActive = false;
    renderGymnastics("Trace paused. Continue tracing or finish whenever you are ready.");
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
    const chaptersMode = dockId === "chapters";
    const questsMode = dockId === "quests";
    panel.chapterPathPanel.hidden = !chaptersMode;
    panel.questBoardPanel.hidden = !questsMode;
    if (chaptersMode) renderChapters();
    else if (activeChapterSession) {
      const exitingSession = activeChapterSession;
      activeChapterSession = null;
      activeChapterId = null;
      activeChapterReturnDock = null;
      exitingSession.exit();
    }
    if (questsMode) renderQuestBoard();
    const petsMode = dockId === "pets";
    panel.petCollectionPanel.hidden = !petsMode;
    if (petsMode) renderPetCollection();
    const gymnasticsMode = dockId === "gymnastics";
    const chapterGymnasticsActive = chaptersMode
      && activeChapterSession?.getSnapshot?.().currentActivity?.type === "gymnastics";
    const gymnasticsVisible = gymnasticsMode || chapterGymnasticsActive;
    panel.gymnasticsPanel.hidden = !gymnasticsVisible;
    if (gymnasticsVisible) renderGymnastics();
    else if (gymnasticsSession && gymnasticsSession.getSnapshot().stage !== "completed") {
      stopGymnasticsClock();
      gymnasticsSession = null;
      gymnasticsPointerActive = false;
      gymnasticsCueRoutine = null;
      gymnasticsCountInStartAt = null;
      gymnasticsRhythmStartAt = null;
    }
    const wardrobeMode = dockId === "wardrobe";
    if (!wardrobeMode) coloringOpen = false;
    const coloringMode = wardrobeMode && coloringOpen;
    panel.hero.hidden = wardrobeMode || petsMode || gymnasticsMode || questsMode;
    panel.quickPaths.hidden = wardrobeMode || petsMode || gymnasticsMode || questsMode;
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
    if (handleChapterAction(event)) return;
    if (handleGymnasticsAction(event)) return;
    if (handleColoringAction(event)) return;
    if (handlePetAction(event)) return;
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
    const petAppearance = event.target?.closest?.('[data-pet-action="appearance"]');
    if (petAppearance && root.contains(petAppearance) && petCollectionService) {
      try {
        petCollectionService.setAppearancePalette(petAppearance.dataset.petId, petAppearance.value);
        renderPetCollection("A fresh look! Your companion's appearance has been saved.");
      } catch (error) {
        renderPetCollection(error?.message || "That appearance could not be saved.");
      }
      return;
    }
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
  root.addEventListener("keydown", handleChapterKeydown);
  panel.gymnasticsCanvas.addEventListener("pointerdown", handleGymnasticsPointerDown);
  panel.gymnasticsCanvas.addEventListener("pointermove", handleGymnasticsPointerMove);
  panel.gymnasticsCanvas.addEventListener("pointerup", handleGymnasticsPointerEnd);
  panel.gymnasticsCanvas.addEventListener("pointercancel", handleGymnasticsPointerEnd);
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
      stopGymnasticsClock();
      coloringService?.dispose?.();
      unsubscribe();
      unsubscribeVoices();
      root.removeEventListener("click", handleClick);
      root.removeEventListener("input", handleInput);
      root.removeEventListener("keydown", handleChapterKeydown);
      panel.gymnasticsCanvas.removeEventListener("pointerdown", handleGymnasticsPointerDown);
      panel.gymnasticsCanvas.removeEventListener("pointermove", handleGymnasticsPointerMove);
      panel.gymnasticsCanvas.removeEventListener("pointerup", handleGymnasticsPointerEnd);
      panel.gymnasticsCanvas.removeEventListener("pointercancel", handleGymnasticsPointerEnd);
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
        gymnasticsStage: gymnasticsSession?.getSnapshot?.().stage ?? "preview",
        activeGarmentTemplateId: coloringService?.getSnapshot?.().template.id ?? null
      });
    }
  });
}

# User interface boundary

The UI layer owns semantic DOM screens, dialogs, menus, settings, accessible feedback, and focus management. It displays state and sends user intents as named actions. It does not contain curriculum answer keys, reward formulas, pet ability rules, or rendering loops. Canvas is reserved for decorative visuals; essential instructions and feedback remain readable DOM content.

## Design system and academy shell (STEP-06)

- createAcademyShell composes the responsive academy hub, destination dock, overview rail, and settings dialog.
- Destination selection is presentation state in app.activeDockId; the five destinations are Chapters, Gymnastics, Pets, Wardrobe, and Quests.
- Essential content, controls, labels, save feedback, and dialog content are semantic DOM. Decorative SVG and visual flourishes are hidden from assistive technology.
- Settings preferences are validated store actions under settings/preferences-updated. Text size and reduced-motion preferences are part of serialized game state and survive save/restore.
- The settings dialog uses dialog semantics, a labelled heading, focus placement, Tab focus trapping, background inertness, and focus restoration after close. Escape behavior is supplied by the shared input router.
- Import previews are validated before the player is asked to confirm. Confirming replacement is a separate action. Export creates a portable JSON backup through a local browser download.
- The frame uses a 16:9 desktop composition and adapts to narrower layouts. Text controls and focus indicators use consistent minimum sizes and visible keyboard focus.

UI components dispatch named actions or use injected services for browser file operations. They must not write directly to progression state or implement gameplay rules.


## Quest board

The Quests destination uses the chapter runtime snapshot and curriculum evidence to show all required chapters and optional side quests. It presents prerequisite status, saved run counts, personal-best star ratings, and per-skill mastery state. Replays use the normal chapter session flow and configured reward-claim policies; side-quest launches return to the board when the player exits.

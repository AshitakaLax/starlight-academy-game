# Narration system

`createNarrationService` provides optional Web Speech narration with no external assets or network requests.

- Narration is disabled by default and never auto-speaks on launch or merely when enabled.
- Voice discovery listens for `voiceschanged`; a missing voice list or an unavailable selected voice falls back to the browser default.
- The service requires a visible caption element; `speak(text)` writes the full instruction there before attempting speech.
- New requests interrupt current speech; disabling narration or stopping the app cancels queued or active speech.
- Speech start ducks only the music bus; end, error, cancellation, and shutdown restore the user's configured music level.
- Unsupported Web Speech implementations leave the game fully playable with on-screen text.

Implementation: STEP-09.

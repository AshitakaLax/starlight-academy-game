# Audio system

STEP-08 implements local synthesized audio using the Web Audio API. The system owns separate master, music, and sound-effect buses; it does not own progression, narration, curriculum, or save data.

- \`createAudioEngine\` creates no AudioContext until \`unlock()\` is invoked from a user gesture. This complies with browser autoplay restrictions.
- Music uses soft, locally synthesized triads for the academy, gymnastics, pets, wardrobe, and quest scenes. No external sound files or network requests are used.
- Effects are short synthesized tones for selection, dialog open/close, sparkle, and positive feedback.
- Mixer settings are validated state actions under \`audio/settings-updated\`; the normal save/autosave and JSON backup systems persist them.
- The mixer exposes master, music, and effects volumes as 0–100 values plus mute. Mute affects the master bus while retaining the independent channel levels.
- If Web Audio is unsupported or blocked, the service reports a quiet fallback and the game continues without audio.

The audio service unlocks on the first interaction inside the academy, routes screen and dialog changes to appropriate sounds, and closes audio resources on app shutdown.

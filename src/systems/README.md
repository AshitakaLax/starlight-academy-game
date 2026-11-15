# Shared gameplay systems

This layer contains reusable rule services shared by chapters and activities:

- \`curriculum/\` — skill metadata, question generators, and evidence recording.
- \`hints/\` — staged, activity-specific teaching support.
- \`economy/\` — Star Gem transactions, Sparkle mastery records, and reward validation.
- \`audio/\` and \`narration/\` — optional audio feedback and speech; neither may block play.

Systems expose documented functions and accept dependencies through constructor/factory arguments. They do not query the DOM, draw directly to canvas, or import chapter files. Their gameplay behavior is implemented in the corresponding ledger steps.

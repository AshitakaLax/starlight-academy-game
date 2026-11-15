# Save boundary

The save manager owns persistence, validation, migration, and portable import/export. Its implementation is scheduled for \`STEP-04\`.

**Interface:** \`SaveManager\` in \`../contracts.d.ts\` (\`save\`, \`load\`, \`export\`, \`import\`). It receives validated state through an injected state-store adapter and uses a storage adapter. It does not own progression rules or present UI; it returns structured outcomes for the UI to display. A failed import must never overwrite a valid existing save.

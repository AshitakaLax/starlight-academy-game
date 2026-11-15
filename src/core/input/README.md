# Input boundary

The input router translates desktop mouse and keyboard events into named game actions. Its implementation is scheduled for \`STEP-05\`.

**Interface:** \`InputRouter\` in \`../contracts.d.ts\` (\`start\`, \`stop\`, \`registerContext\`). Bindings are scoped to the active screen/context. The router dispatches actions through the application boundary; it never mutates game state or implements gameplay rules. Focused form controls must retain normal keyboard behavior.

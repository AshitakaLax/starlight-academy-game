# State boundary

The state store is the single authority for mutable runtime and progression state. It will be implemented in \`STEP-03\`.

**Interface:** \`StateStore\` in \`../contracts.d.ts\` (\`getState\`, \`dispatch\`, \`subscribe\`). Consumers receive read-only snapshots and submit named actions. The store validates actions and emits state changes; it does not render UI, handle DOM events, or write browser storage directly.

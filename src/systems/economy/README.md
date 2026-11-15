# Economy system

The economy system is the authority for currency changes. All balances and ledgers live in the save-backed `state.economy` object.

- `economyCatalogs.js` validates immutable reward definitions and shop items. Every reward must grant at least one currency and declare an explicit replay policy: `once` or `capped`. Capped rewards cannot exceed the configured claim maximum. Shop items have a catalog-owned Star Gem price and a finite ownership limit.
- `economyState.js` defines the initial balances and read-only balance/ownership selectors.
- `economyActions.js` supplies reducers closed over the validated registries. Reward claims grant Star Gems and Starlight Sparkles together in one state transition. Purchases debit only Star Gems, and the item price is never accepted from an action payload.
- `createEconomyService.js` exposes `claimReward`, `purchaseItem`, `canPurchase`, and balance queries. It reports replay caps, ownership caps, and insufficient Star Gems before dispatching.
- Each successful change appends a sequence-numbered transaction with before/after balances. Transaction history is bounded by configuration; cumulative balances, claims, and ownership persist in saves.
- There is deliberately no Sparkle debit or shop-payment path. Starlight Sparkles record achievement/mastery rewards and cannot be converted into spending power.

A reward can be claimed once or up to a fixed configured cap. No unlimited replay policy exists. The reducer independently enforces each cap and affordability rule, so dispatching an action directly cannot bypass the economy service. A reward or purchase updates balances, claims/ownership, and transaction history atomically.

The browser composition root starts with zero balances, empty reward/shop registries, and economy action definitions. Older saves receive the new empty economy defaults through the existing recursive save-state normalization. Actual chapter/quest rewards and cosmetic catalog entries are registered alongside their content in later steps.

Configuration defaults currently provide zero starting balances, a bounded 200-entry transaction history, and a maximum of five claims for a capped reward.

Implementation: `STEP-13`.

# Central game state

createGameStore.js implements the single authority for mutable runtime and progression state. State is copied on entry, restricted to JSON-compatible values, and exposed only as deeply frozen snapshots. Feature systems must dispatch validated, namespaced actions rather than mutate state directly.

## Public API

- createGameStore({ initialState, actions, onListenerError, onDispatchError }) creates the store. Core navigation/overlay actions are registered automatically; feature systems inject their own action definitions.
- dispatch({ type, payload }) validates the action and its payload, then applies its pure reducer. Unknown actions and invalid payloads throw before state changes. Nested dispatches are queued FIFO so subscriber callbacks cannot cause re-entrant state transitions.
- subscribe(listener) observes every committed transition. subscribeSelector(selector, listener, options) observes only selected-value changes and can optionally emit the current value.
- createScope(id) groups screen-lifetime subscriptions. By default it is bound to the current app.screenId; when navigation leaves that screen, its subscriptions are disposed automatically. Use { screenId: null } for application-lifetime subscriptions.
- destroy() disposes all scopes and subscriptions and prevents further use.
- selectors.js contains common selectors, safe path lookup, and createSelector memoization.

Reducers receive frozen state and payloads and must be deterministic and side-effect-free. DOM rendering and canvas loops should read selectors only; progression, rewards, and persistence are changed by explicit actions from gameplay systems. Subscribers must return and retain their unsubscribe functions when they are not managed by a scope.

The initial state intentionally contains only the app screen and active overlay. The save system and feature steps add their own state domains without inventing unconfirmed economy or progression defaults.

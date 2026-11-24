/**
 * Default screen contexts for the five hub destinations and common activity flows.
 * Feature screens may register higher-priority contexts or replace these mappings.
 */
export function registerStandardInputContexts(router) {
  if (!router || typeof router.registerContext !== "function") {
    throw new TypeError("registerStandardInputContexts requires an input router.");
  }
  const unregister = [];

  unregister.push(router.registerContext("hub", {
    screenId: "academy",
    keys: {
      "1": { type: "hub/dock-selected", payload: { dockId: "chapters" } },
      "2": { type: "hub/dock-selected", payload: { dockId: "gymnastics" } },
      "3": { type: "hub/dock-selected", payload: { dockId: "pets" } },
      "4": { type: "hub/dock-selected", payload: { dockId: "wardrobe" } },
      "5": { type: "hub/dock-selected", payload: { dockId: "quests" } }
    }
  }));
  unregister.push(router.registerContext("settings", {
    screenId: "academy",
    overlayId: "settings",
    keys: {}
  }));
  unregister.push(router.registerContext("activity-answers", {
    screenId: "activity",
    enabledWhen: (state) => state?.activity?.inputMode === "multiple-choice",
    keys: {
      "1": { type: "activity/answer-selected", payload: { choiceIndex: 0 } },
      "2": { type: "activity/answer-selected", payload: { choiceIndex: 1 } },
      "3": { type: "activity/answer-selected", payload: { choiceIndex: 2 } },
      "4": { type: "activity/answer-selected", payload: { choiceIndex: 3 } }
    }
  }));
  unregister.push(router.registerContext("activity-hints", {
    screenId: "activity",
    enabledWhen: (state) => state?.activity?.supportsHints === true,
    keys: { h: { type: "hints/requested" } }
  }));
  unregister.push(router.registerContext("dialogue", {
    screenId: "dialogue",
    keys: {
      Enter: { type: "dialogue/advance-requested" },
      Space: { type: "dialogue/advance-requested" }
    }
  }));
  return () => {
    for (const unregisterContext of unregister.reverse()) unregisterContext();
  };
}

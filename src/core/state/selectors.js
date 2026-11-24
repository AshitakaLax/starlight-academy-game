/** Common selectors keep UI and rendering code independent of state layout. */
export function selectCurrentScreen(state) {
  return state?.app?.screenId ?? null;
}

export function selectActiveOverlayId(state) {
  return state?.ui?.activeOverlayId ?? null;
}

/** Read a serializable state path using a dotted string or array of path keys. */
export function selectAtPath(state, path) {
  const segments = Array.isArray(path) ? path : typeof path === "string" ? path.split(".") : null;
  if (!segments || segments.some((segment) => typeof segment !== "string" || !segment)) {
    throw new TypeError("selectAtPath expects a dotted path or an array of non-empty keys.");
  }
  return segments.reduce((value, key) => value == null ? undefined : value[key], state);
}

/** Memoize a derived selector by the identity of its input-selector results. */
export function createSelector(...selectorsAndResult) {
  if (selectorsAndResult.length < 2) {
    throw new TypeError("createSelector requires at least one input selector and a result function.");
  }

  const resultFunction = selectorsAndResult.at(-1);
  const inputSelectors = selectorsAndResult.slice(0, -1);
  if (!inputSelectors.every((selector) => typeof selector === "function")
      || typeof resultFunction !== "function") {
    throw new TypeError("createSelector arguments must be selector functions followed by a result function.");
  }

  let previousInputs = null;
  let previousResult;
  let hasResult = false;

  return function memoizedSelector(state) {
    const inputs = inputSelectors.map((selector) => selector(state));
    const unchanged = hasResult
      && inputs.length === previousInputs.length
      && inputs.every((input, index) => Object.is(input, previousInputs[index]));
    if (unchanged) return previousResult;

    previousInputs = inputs;
    previousResult = resultFunction(...inputs);
    hasResult = true;
    return previousResult;
  };
}

/** Utilities for enforcing JSON-compatible, immutable application state. */

export function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function cloneSerializable(value, path = "$", seen = new WeakSet()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(path + " must contain only finite numbers.");
    return value;
  }

  if (typeof value !== "object") {
    throw new TypeError(path + " contains a value that cannot be serialized.");
  }

  if (seen.has(value)) throw new TypeError(path + " contains a circular reference.");
  seen.add(value);

  let clone;
  if (Array.isArray(value)) {
    clone = [];
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) {
        throw new TypeError(path + "[" + index + "] must not be an empty array slot.");
      }
      clone.push(cloneSerializable(value[index], path + "[" + index + "]", seen));
    }
  } else {
    if (!isPlainObject(value)) {
      throw new TypeError(path + " must contain only plain objects and arrays.");
    }
    if (Reflect.ownKeys(value).some((key) => typeof key === "symbol")) {
      throw new TypeError(path + " must not contain symbol properties.");
    }

    clone = {};
    for (const key of Object.keys(value)) {
      if (key === "__proto__" || key === "prototype" || key === "constructor") {
        throw new TypeError(path + "." + key + " is not an allowed property name.");
      }
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, "value")) {
        throw new TypeError(path + "." + key + " must be a plain enumerable data property.");
      }
      clone[key] = cloneSerializable(descriptor.value, path + "." + key, seen);
    }
  }

  seen.delete(value);
  return clone;
}

export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
    Object.freeze(value);
  }
  return value;
}

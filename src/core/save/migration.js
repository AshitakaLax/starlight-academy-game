/**
 * Migration hooks. Add a function per schema version transition.
 * migrate(data, fromVersion) returns migrated data or throws.
 */
import { SCHEMA_VERSION } from "./schema.js";

const migrations = {
  // Example: 1: (data) => { ...; return data; }
};

export function migrateSave(data) {
  let version = data.schemaVersion ?? 0;
  let current = { ...data };
  while (version < SCHEMA_VERSION) {
    const fn = migrations[version];
    if (!fn) {
      throw new Error(`No migration from schema version ${version}`);
    }
    current = fn(current);
    version = current.schemaVersion;
  }
  if (version > SCHEMA_VERSION) {
    throw new Error(`Save schema ${version} is newer than supported ${SCHEMA_VERSION}`);
  }
  current.schemaVersion = SCHEMA_VERSION;
  return current;
}
export default { migrateSave };

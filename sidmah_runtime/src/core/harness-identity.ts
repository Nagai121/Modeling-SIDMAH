/** Keep Modeling SIDMAH SQLite separate from the original SIDMAH database. */
import type { DatabaseSync } from "node:sqlite";
import { invariant } from "./errors.ts";
export const HARNESS_NAME = "modeling_sidmah";
export const MODELING_SCHEMA_VERSION = 1;
export function ensureModelingDatabase(db: DatabaseSync): void {
  const objects = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as Array<{name:string}>;
  const labeled = objects.some(row => row.name === "harness_identity");
  invariant(!objects.length || labeled, "HARNESS_SCHEMA_MISMATCH", "An existing non-modeling database cannot be reused");
  db.exec("CREATE TABLE IF NOT EXISTS harness_identity(harness_name TEXT PRIMARY KEY,schema_version INTEGER NOT NULL)");
  const row = db.prepare("SELECT harness_name,schema_version FROM harness_identity LIMIT 1").get() as {harness_name:string;schema_version:number}|undefined;
  invariant(!row || (row.harness_name === HARNESS_NAME && row.schema_version === MODELING_SCHEMA_VERSION), "HARNESS_SCHEMA_MISMATCH", "An incompatible harness or database schema was found");
  if (!row) db.prepare("INSERT INTO harness_identity(harness_name,schema_version) VALUES(?,?)").run(HARNESS_NAME, MODELING_SCHEMA_VERSION);
}

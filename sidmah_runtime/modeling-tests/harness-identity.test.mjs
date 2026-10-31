import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {ensureModelingDatabase} from "../src/core/harness-identity.ts";

test("a Modeling SIDMAH database can be reopened within its own harness",()=>{
  const db=new DatabaseSync(":memory:");
  try {
    ensureModelingDatabase(db);ensureModelingDatabase(db);
    const row=db.prepare("SELECT * FROM harness_identity").get();
    assert.equal(row.harness_name,"modeling_sidmah");
    assert.equal(row.schema_version,1);
  } finally {db.close()}
});
test("unlabeled SIDMAH database is not relabeled",()=>{
  const db=new DatabaseSync(":memory:");
  try {
    db.exec("CREATE TABLE cells(cell_no INTEGER)");
    assert.throws(()=>ensureModelingDatabase(db),/HARNESS_SCHEMA_MISMATCH|non-modeling/i);
    assert.equal(db.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name='harness_identity'").get().n,0);
  } finally {db.close()}
});

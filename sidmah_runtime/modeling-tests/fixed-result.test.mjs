import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {writeFixedResult} from "../src/runtime/fixed-result.ts";

test("fixed result is hash-verified with complete manifest", () => {
  const root=mkdtempSync(join(tmpdir(),"modeling-result-"));
  try {
    const saved=writeFixedResult(root,"runtime-123",{schemaVersion:1,type:"modeling",executionStatus:"success",artifacts:[]});
    const digest=createHash("sha256").update(readFileSync(saved.resultRef)).digest("hex");
    const manifest=JSON.parse(readFileSync(saved.manifestRef,"utf8"));
    assert.equal(saved.resultHash,digest);
    assert.equal(manifest.resultHash,digest);
    assert.equal(manifest.runtimeId,"runtime-123");
    assert.equal(manifest.complete,true);
  } finally {rmSync(root,{recursive:true,force:true})}
});

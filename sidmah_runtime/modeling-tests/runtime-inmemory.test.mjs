import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID,createHash} from "node:crypto";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {SidmahSystem} from "../src/system.ts";
import {InMemoryProvider} from "../src/provider/in-memory-provider.ts";

test("completed modeling files follow original SIDMAH Start→Result→End→Review",async()=>{
  const root=mkdtempSync(join(tmpdir(),"modeling-runtime-"));
  const system=new SidmahSystem(root,new InMemoryProvider());
  try {
    writeFileSync(join(root,"worker-model.json"),JSON.stringify({model:"test-worker",reasoning_effort:"low"}));
    const director=system.contextForProviderSession("director-test",true);
    system.startDirector(director);
    system.registerQuery(director,randomUUID(),"A test modeling query without external API calls");
    const cell=await system.createCell(director,{responsibility:"head"});
    await system.acceptCell({providerSessionId:"worker-test",sessionToken:randomUUID()},true,cell.assignmentId);
    const worker=system.contextForProviderSession("worker-test");
    const start=await system.createStart(director,cell.cellNo,{
      objective:"Test model submission",referenceScope:"head three views",
      workInstructions:"Use local test fixture",deliverables:"GLB and preview",
      comparisonCriteria:"Local test only"
    });
    const work=join(root,"works","cell_"+cell.cellNo,"work_place");
    mkdirSync(join(work,"out"),{recursive:true});
    mkdirSync(join(work,"renders"),{recursive:true});
    writeFileSync(join(work,"out","model.glb"),"local fixture model (not a valid geometry)");
    writeFileSync(join(work,"renders","front.png"),"local fixture render");
    writeFileSync(join(work,"modeling-result.json"),JSON.stringify({
      schemaVersion:1,primaryModel:"out/model.glb",previewImages:["renders/front.png"],otherFiles:[],notes:"local fixture"
    }));
    const submitted=await system.submitModelingWork(worker);
    assert.equal(submitted.runtimeId,start.runtimeId);
    const runtime=system.runtimes.db.prepare("SELECT * FROM runtimes WHERE runtime_id=?").get(start.runtimeId);
    assert.equal(runtime.state,"finished");
    assert.equal(runtime.execution_status,"success");
    assert.equal(existsSync(join(root,"works","cell_"+cell.cellNo,"runtime_"+start.runtimeNo,"artifacts","out","model.glb")),true);
    const result=readFileSync(runtime.result_ref);
    assert.equal(createHash("sha256").update(result).digest("hex"),runtime.result_hash);
    await system.createEnd(worker,{
      producedArtifacts:"model.glb and preview",outputAudit:"fixed SHA-256 checked",
      visualDifferences:"not evaluated",unresolvedIssues:"fixture is not a visual model",
      revisionAdvice:"none",referenceEvidence:"local fixture"
    });
    const end=await system.completeEndReview(director);
    assert.equal(end.runtimeId,start.runtimeId);
  } finally {system.close();rmSync(root,{recursive:true,force:true})}
});

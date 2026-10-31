import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SidmahSystem } from "../src/system.ts";
import { InMemoryProvider } from "../src/provider/in-memory-provider.ts";
import { validateModelingOutput, verifyFixedArtifacts } from "../src/runtime/artifact-validation.ts";

function triangleGLB() {
  const coords = Buffer.alloc(36);
  [0,0,0, 1,0,0, 0,1,0].forEach((v,i)=>coords.writeFloatLE(v, i*4));
  const meta = {
    asset:{ version:"2.0" },
    scene:0, scenes:[{ nodes:[0] }], nodes:[{ mesh:0 }],
    meshes:[{ primitives:[{ attributes:{POSITION:0} }] }],
    buffers:[{byteLength:36}], bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],
    accessors:[{bufferView:0,componentType:5126,count:3,type:"VEC3",min:[0,0,0],max:[1,1,0]}],
  };
  const raw = Buffer.from(JSON.stringify(meta), "utf8");
  const padded = Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]);
  const header=Buffer.alloc(12),j=Buffer.alloc(8),bin=Buffer.alloc(8);
  header.write("glTF",0,"ascii");header.writeUInt32LE(2,4);
  header.writeUInt32LE(12+8+padded.length+8+coords.length,8);
  j.writeUInt32LE(padded.length,0);j.writeUInt32LE(0x4e4f534a,4);
  bin.writeUInt32LE(coords.length,0);bin.writeUInt32LE(0x004e4942,4);
  return Buffer.concat([header,j,padded,bin,coords]);
}
const PNG=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==","base64");

function setup(){
  const root=mkdtempSync(join(tmpdir(),"modeling-runtime-"));
  mkdirSync(join(root,"state"),{recursive:true});
  writeFileSync(join(root,"worker-model.json"),JSON.stringify({model:"test-worker",reasoning_effort:"low"}));
  const system=new SidmahSystem(root,new InMemoryProvider());
  return {root,system,close(){system.close();rmSync(root,{recursive:true,force:true})}};
}
async function start(testEnv){
  const {system}=testEnv;
  const director=system.contextForProviderSession("director-test",true);
  system.startDirector(director);
  system.registerQuery(director,randomUUID(),"Local modeling test, no external generation");
  const cell=await system.createCell(director,{responsibility:"selected work"});
  await system.acceptCell({providerSessionId:"worker-test",sessionToken:randomUUID()},true,cell.assignmentId);
  const worker=system.contextForProviderSession("worker-test");
  const runtime=await system.createStart(director,cell.cellNo,{
    objective:"Test model submission",referenceScope:"one head front image",
    workInstructions:"Use local GLB fixture",deliverables:"GLB and preview",
    comparisonCriteria:"Local integrity"
  });
  const work=join(testEnv.root,"works","cell_"+cell.cellNo,"work_place");
  mkdirSync(join(work,"out"),{recursive:true});mkdirSync(join(work,"renders"),{recursive:true});
  writeFileSync(join(work,"out","model.glb"),triangleGLB());
  writeFileSync(join(work,"renders","front.png"),PNG);
  writeFileSync(join(work,"modeling-result.json"),JSON.stringify({
    schemaVersion:1,primaryModel:"out/model.glb",previewImages:["renders/front.png"],otherFiles:[],notes:"local fixture"
  }));
  return {director,cell,worker,runtime,work};
}

test("invalid GLB fails validation instead of being falsely accepted",()=>{
  const root=mkdtempSync(join(tmpdir(),"modeling-invalid-"));
  try{
    mkdirSync(join(root,"out"));
    writeFileSync(join(root,"out","model.glb"),"not a valid GLB");
    writeFileSync(join(root,"modeling-result.json"),JSON.stringify({
      schemaVersion:1,primaryModel:"out/model.glb",previewImages:[],otherFiles:[]
    }));
    assert.throws(()=>validateModelingOutput(root),/MODEL_GEOMETRY_INVALID|GLB/);
    writeFileSync(join(root,"out","model.glb"),triangleGLB());
    assert.equal(validateModelingOutput(root).schemaVersion,1);
  } finally {rmSync(root,{recursive:true,force:true})}
});

test("Start, frozen artifact, Result, End and review work offline",async()=>{
  const e=setup();
  try{
    const {director,cell,worker,runtime}=await start(e);
    const submitted=await e.system.submitModelingWork(worker);
    assert.equal(submitted.runtimeId,runtime.runtimeId);
    assert.equal(submitted.executionStatus,"success");
    const state=e.system.runtimes.db.prepare("SELECT * FROM runtimes WHERE runtime_id=?").get(runtime.runtimeId);
    assert.equal(state.state,"finished");assert.equal(state.execution_status,"success");
    const dir=join(e.root,"works","cell_"+cell.cellNo,"runtime_"+runtime.runtimeNo);
    const artifact=join(dir,"artifacts","out","model.glb");
    assert.equal(existsSync(artifact),true);
    const result=JSON.parse(readFileSync(state.result_ref,"utf8"));
    assert.equal(verifyFixedArtifacts(dir,result),true);
    assert.equal(createHash("sha256").update(readFileSync(state.result_ref)).digest("hex"),state.result_hash);
    await e.system.createEnd(worker,{
      producedArtifacts:"model.glb and preview",outputAudit:"fixed SHA-256 checked",
      visualDifferences:"not evaluated",unresolvedIssues:"not a visual matching test",
      revisionAdvice:"none",referenceEvidence:"local fixture"
    });
    const end=await e.system.completeEndReview(director);
    assert.equal(end.runtimeId,runtime.runtimeId);
  } finally {e.close()}
});

test("a permanent error after Start commitment becomes an auditable failure Result",async()=>{
  const e=setup();
  try{
    const {worker,runtime}=await start(e);
    e.system.runtimes.completeModelingRuntime=async()=>{throw new Error("test deliberate processing failure")};
    const receipt=await e.system.submitModelingWork(worker);
    assert.equal(receipt.executionStatus,"failure");
    const state=e.system.runtimes.db.prepare("SELECT * FROM runtimes WHERE runtime_id=?").get(runtime.runtimeId);
    assert.equal(state.state,"finished");
    assert.equal(state.execution_status,"failure");
    assert.match(readFileSync(state.result_ref,"utf8"),/deliberate processing failure/);
  } finally {e.close()}
});

test("interrupted temporary copying returns to retryable created state",async()=>{
  const e=setup();
  try{
    const {runtime}=await start(e);
    const tmp=join(e.root,"abandoned-copy");
    mkdirSync(tmp);writeFileSync(join(tmp,"partial.bin"),"partial");
    e.system.runtimes.db.prepare("UPDATE runtimes SET snapshot_state='copying',snapshot_temporary_path=? WHERE runtime_id=?").run(tmp,runtime.runtimeId);
    await e.system.runtimes.recover();
    const row=e.system.runtimes.db.prepare("SELECT state,snapshot_state FROM runtimes WHERE runtime_id=?").get(runtime.runtimeId);
    assert.equal(row.state,"created");assert.equal(row.snapshot_state,"none");
    assert.equal(existsSync(tmp),false);
  } finally {e.close()}
});

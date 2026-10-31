import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {hashFile,verifyFixedArtifacts,validateModelingOutput} from "../src/runtime/artifact-validation.ts";

test("finished artifact tampering is detectable by its recorded SHA-256",()=>{
  const root=mkdtempSync(join(tmpdir(),"artifacts-"));
  try{
    mkdirSync(join(root,"artifacts"));
    const file=join(root,"artifacts","a.bin");
    writeFileSync(file,"original");
    const result={executionStatus:"success",artifacts:[{path:"a.bin",sha256:hashFile(file),bytes:8}]};
    assert.equal(verifyFixedArtifacts(root,result),true);
    writeFileSync(file,"tampered");
    assert.equal(verifyFixedArtifacts(root,result),false);
  } finally {rmSync(root,{recursive:true,force:true})}
});

test("missing GLTF dependencies are rejected",()=>{
  const root=mkdtempSync(join(tmpdir(),"gltf-"));
  try{
    writeFileSync(join(root,"object.gltf"),JSON.stringify({
      asset:{version:"2.0"},meshes:[{primitives:[]}],
      buffers:[{uri:"mesh.bin",byteLength:4}]
    }));
    writeFileSync(join(root,"modeling-result.json"),JSON.stringify({
      schemaVersion:2,startId:"e3f1e6c2-f5c9-491f-8312-32f7427313c7",primaryModel:"object.gltf",previewImages:[],otherFiles:[]
    }));
    assert.throws(()=>validateModelingOutput(root),/MODEL_RESOURCE_MISSING|not listed/);
    writeFileSync(join(root,"mesh.bin"),"1234");
    writeFileSync(join(root,"modeling-result.json"),JSON.stringify({
      schemaVersion:2,startId:"e3f1e6c2-f5c9-491f-8312-32f7427313c7",primaryModel:"object.gltf",previewImages:[],otherFiles:["mesh.bin"]
    }));
    assert.equal(validateModelingOutput(root).otherFiles.length,1);
  } finally {rmSync(root,{recursive:true,force:true})}
});

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { registerReferenceImage, listReferenceImages } from "../src/runtime/reference-input.ts";

const PNG=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==","base64");

test("one composite reference is sufficient and preserved as a single file",()=>{
 const root=mkdtempSync(join(tmpdir(),"ref-inbox-"));
 try{
   const source=join(root,"three-views.png");
   writeFileSync(source,PNG);
   const stored=registerReferenceImage(root,{sourcePath:source,view:"composite",description:"front side back montage"});
   assert.equal(stored.view,"composite");
   const result=listReferenceImages(root);
   assert.equal(result.count,1);
   assert.equal(result.images[0].composite,true);
   assert.deepEqual(readFileSync(result.images[0].path),PNG);
 }finally{rmSync(root,{recursive:true,force:true})}
});

test("base64 image inputs are accepted without asking for named part slots",()=>{
 const root=mkdtempSync(join(tmpdir(),"ref-base64-"));
 try{
   const stored=registerReferenceImage(root,{imageBase64:PNG.toString("base64"),filename:"user-image.png"});
   assert.ok(stored.id);
   const listed=listReferenceImages(root);
   assert.equal(listed.count,1);
   assert.equal(listed.images[0].part,null);
   assert.equal(listed.images[0].view,null);
 }finally{rmSync(root,{recursive:true,force:true})}
});

test("manual reference slot and inbox are listed together",()=>{
 const root=mkdtempSync(join(tmpdir(),"ref-slots-"));
 try{
   const folder=join(root,"modeling","reference_images","head");
   mkdirSync(folder,{recursive:true});
   writeFileSync(join(folder,"front.png"),PNG);
   registerReferenceImage(root,{imageBase64:PNG.toString("base64"),filename:"whole-image.png",part:"whole",view:"composite"});
   assert.equal(listReferenceImages(root).count,2);
 }finally{rmSync(root,{recursive:true,force:true})}
});

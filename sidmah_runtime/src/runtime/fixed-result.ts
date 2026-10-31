import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
export function writeFixedResult(runtimeDirectory: string, runtimeId: string, result: unknown): {resultRef:string;resultHash:string;manifestRef:string} {
  mkdirSync(runtimeDirectory,{recursive:true});
  const body=JSON.stringify(result,null,2), resultHash=createHash("sha256").update(body).digest("hex");
  const resultRef=resolve(runtimeDirectory,"result.json"),manifestRef=resolve(runtimeDirectory,"result.manifest.json");
  const tempResult=resultRef+"."+randomUUID()+".tmp",tempManifest=manifestRef+"."+randomUUID()+".tmp";
  writeFileSync(tempResult,body,"utf8");
  writeFileSync(tempManifest,JSON.stringify({schemaVersion:1,runtimeId,resultHash,complete:true},null,2),"utf8");
  renameSync(tempManifest,manifestRef);
  renameSync(tempResult,resultRef);
  return {resultRef,resultHash,manifestRef};
}

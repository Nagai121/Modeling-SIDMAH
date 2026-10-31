import { createHash, randomUUID } from "node:crypto";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { invariant } from "../core/errors.ts";

const PARTS = ["head","upper_body","lower_body","accessories","whole"];
const VIEWS = ["front","side","back"];
const EXT = new Set([".png",".jpg",".jpeg",".webp"]);
type Entry = { id: string; path: string; sourceName: string; sha256: string; part?: string; view?: string; description?: string };

function assertImage(file: string): void {
  invariant(existsSync(file) && lstatSync(file).isFile() && !lstatSync(file).isSymbolicLink(),
    "REFERENCE_NOT_FOUND", "Reference must be an existing regular file");
  const ext=extname(file).toLowerCase();
  invariant(EXT.has(ext), "REFERENCE_FORMAT", "Reference must be PNG, JPEG, or WebP");
  const b=readFileSync(file).subarray(0,16);
  const ok = ext===".png" ? b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
    ext===".webp" ? b.toString("ascii",0,4)==="RIFF" && b.toString("ascii",8,12)==="WEBP" :
    b.subarray(0,3).equals(Buffer.from([255,216,255]));
  invariant(ok,"REFERENCE_FORMAT","Image signature does not match filename");
}
function filenameSafe(name: string): string {
  const extension=extname(name).toLowerCase();
  invariant(EXT.has(extension),"REFERENCE_FORMAT","Use PNG, JPEG, or WebP");
  return extension;
}
function sourceFiles(root:string): string[] {
  const result:string[]=[];
  if(!existsSync(root))return result;
  for(const entry of readdirSync(root,{withFileTypes:true})) {
    const path=resolve(root,entry.name);
    if(entry.isFile()&&EXT.has(extname(entry.name).toLowerCase()))result.push(path);
    if(entry.isDirectory()&&(PARTS.includes(entry.name)||entry.name==="inbox")) {
      for(const f of readdirSync(path,{withFileTypes:true}))
        if(f.isFile()&&EXT.has(extname(f.name).toLowerCase()))result.push(resolve(path,f.name));
    }
  }
  return result;
}
function indexPath(folder:string):string{return resolve(folder,"index.json")}
function loadIndex(folder:string):Entry[] {
  if(!existsSync(indexPath(folder)))return [];
  const obj=JSON.parse(readFileSync(indexPath(folder),"utf8"));
  invariant(Array.isArray(obj),"REFERENCE_INDEX_INVALID","Reference index must be an array");
  return obj;
}
export function listReferenceImages(projectRoot:string) {
  const folder=resolve(projectRoot,"modeling","reference_images");
  const entries=loadIndex(folder);
  const indexed=new Map(entries.map(e=>[resolve(folder,e.path),e]));
  const images=sourceFiles(folder).sort().map(fullPath=>{
    assertImage(fullPath);
    const e=indexed.get(fullPath);
    return {path:fullPath, name:basename(fullPath), part:e?.part??null,view:e?.view??null,
      description:e?.description??null, sha256:e?.sha256??createHash("sha256").update(readFileSync(fullPath)).digest("hex"),
      sourceName:e?.sourceName??null, composite: e?.view === "composite" };
  });
  return {count:images.length,images};
}
export function registerReferenceImage(projectRoot:string,args:{sourcePath?:string;imageBase64?:string;filename?:string;part?:string;view?:string;description?:string}) {
  invariant(!!args && (typeof args.sourcePath==="string") !== (typeof args.imageBase64==="string"),
    "REFERENCE_INPUT_INVALID","Provide exactly one sourcePath or imageBase64");
  invariant(args.part===undefined||PARTS.includes(args.part),"REFERENCE_PART_INVALID","Unknown part slot");
  invariant(args.view===undefined||[...VIEWS,"composite","unknown"].includes(args.view),
    "REFERENCE_VIEW_INVALID","Unknown view; use composite for a multi-view image");
  const folder=resolve(projectRoot,"modeling","reference_images"),inbox=resolve(folder,"inbox");
  mkdirSync(inbox,{recursive:true});
  let source:string, temp:string|undefined;
  if(args.sourcePath!==undefined) {
    source=resolve(args.sourcePath);
    assertImage(source);
  } else {
    invariant(typeof args.filename==="string","REFERENCE_FILENAME_REQUIRED","Filename required for base64 images");
    const ext=filenameSafe(args.filename!);
    invariant(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(args.imageBase64!) &&
      args.imageBase64!.length>0,"REFERENCE_BASE64_INVALID","Base64 must be valid");
    temp=resolve(inbox,`.${randomUUID()}${ext}.tmp`);
    writeFileSync(temp,Buffer.from(args.imageBase64!,"base64"));
    source=temp;
  }
  const extension=filenameSafe(args.filename??source);
  const id=randomUUID(),filename=`${id}${extension}`,destination=resolve(inbox,filename);
  try {
    if(temp) {
      // Validate against the actual format even though this is a temporary file.
      const correct=resolve(inbox,`.${randomUUID()}${extension}`);
      renameSync(temp,correct);temp=correct;
      assertImage(correct);
    }
    copyFileSync(source,destination);
    assertImage(destination);
    const sha256=createHash("sha256").update(readFileSync(destination)).digest("hex");
    const entry:Entry={id,path:"inbox/"+filename,sourceName:basename(args.filename??source),sha256,
      ...(args.part?{part:args.part}:{}),...(args.view?{view:args.view}:{}),
      ...(args.description?{description:args.description}:{})};
    const index=loadIndex(folder);
    const tmpIndex=resolve(folder,`index.${randomUUID()}.tmp`);
    writeFileSync(tmpIndex,JSON.stringify([...index,entry],null,2)+"\n","utf8");
    renameSync(tmpIndex,indexPath(folder));
    return entry;
  } catch(error) {
    if(existsSync(destination))rmSync(destination,{force:true});
    throw error;
  } finally {if(temp&&existsSync(temp))rmSync(temp,{force:true})}
}

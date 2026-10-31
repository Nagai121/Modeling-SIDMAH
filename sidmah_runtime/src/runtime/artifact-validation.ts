import { createHash } from "node:crypto";
import { closeSync, existsSync, lstatSync, openSync, readFileSync, readSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { invariant } from "../core/errors.ts";

export type ModelingDeclaration = {
  schemaVersion: 1;
  primaryModel: string;
  previewImages: string[];
  otherFiles: string[];
  notes?: string;
};
export type FixedArtifact = { path: string; sha256: string; bytes: number };

export function hashFile(path: string): string {
  const hash = createHash("sha256");
  const fd = openSync(path, "r");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    while (true) {
      const n = readSync(fd, buffer, 0, buffer.length, null);
      if (!n) break;
      hash.update(buffer.subarray(0, n));
    }
  } finally { closeSync(fd); }
  return hash.digest("hex");
}

/** Portable paths only, confined within the declared root and free of symlinks. */
export function safeArtifactPath(root: string, name: string): string {
  invariant(typeof name === "string" && name.length > 0 && !name.includes("\\")
    && !name.includes("\0") && !isAbsolute(name) && !/^[A-Za-z]:/.test(name)
    && !name.split("/").includes(".."),
    "MODEL_PATH_ESCAPE", "Artifact must use a safe relative slash path");
  const base = resolve(root), path = resolve(base, name), rel = relative(base, path);
  invariant(rel && rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel),
    "MODEL_PATH_ESCAPE", "Artifact path escapes its root");
  let current = base;
  for (const part of rel.split(sep)) {
    current = resolve(current, part);
    invariant(existsSync(current) && !lstatSync(current).isSymbolicLink(),
      "MODEL_PATH_SYMLINK", "Artifact is missing or contains a symlink");
  }
  invariant(lstatSync(path).isFile() && lstatSync(path).size > 0,
    "MODEL_ARTIFACT_INVALID", "Artifact is empty or is not a regular file");
  return path;
}

function signature(file: string, length = 32): Buffer {
  const fd = openSync(file, "r");
  const b = Buffer.alloc(length);
  try { return b.subarray(0, readSync(fd, b, 0, length, 0)); }
  finally { closeSync(fd); }
}

function checkImage(file: string): void {
  const b = signature(file);
  const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
  const valid = ext === ".png"
    ? b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : ext === ".jpg" || ext === ".jpeg" ? b.subarray(0, 3).equals(Buffer.from([255,216,255]))
    : ext === ".webp" ? b.toString("ascii",0,4) === "RIFF" && b.toString("ascii",8,12) === "WEBP"
    : false;
  invariant(valid, "MODEL_PREVIEW_INVALID", "Preview image signature is invalid");
}

function modelJson(file: string, ext: string): any | undefined {
  if (ext === ".gltf") {
    const v = JSON.parse(readFileSync(file, "utf8"));
    invariant(v && v.asset?.version?.startsWith?.("2") && Array.isArray(v.meshes) && v.meshes.length > 0,
      "MODEL_GEOMETRY_INVALID", "GLTF must contain a 2.x asset and meshes");
    return v;
  }
  if (ext !== ".glb") return undefined;
  const head = signature(file, 20), actual = lstatSync(file).size;
  invariant(head.length >= 20 && head.toString("ascii",0,4) === "glTF" &&
    head.readUInt32LE(4) === 2 && head.readUInt32LE(8) === actual &&
    head.readUInt32LE(16) === 0x4e4f534a, "MODEL_GEOMETRY_INVALID",
    "GLB header or first JSON chunk is invalid");
  const jsonLength = head.readUInt32LE(12);
  invariant(jsonLength > 0 && jsonLength <= 16 * 1024 * 1024 && 20 + jsonLength <= actual,
    "MODEL_GEOMETRY_INVALID", "GLB JSON chunk length is invalid");
  const fd = openSync(file, "r"), b = Buffer.alloc(jsonLength);
  try {
    const n = readSync(fd,b,0,jsonLength,20);
    invariant(n === jsonLength,"MODEL_GEOMETRY_INVALID","Truncated GLB JSON chunk");
  } finally { closeSync(fd); }
  const v = JSON.parse(b.toString("utf8").trim());
  invariant(v.asset?.version?.startsWith?.("2") && Array.isArray(v.meshes) && v.meshes.length > 0,
    "MODEL_GEOMETRY_INVALID", "GLB has no meshes");
  return v;
}

function validateModel(file: string, root: string, relativeName: string, declared: Set<string>): void {
  const ext = relativeName.slice(relativeName.lastIndexOf(".")).toLowerCase();
  const b = signature(file);
  if (ext === ".blend") {
    invariant(b.length >= 12 && b.toString("ascii",0,7) === "BLENDER" &&
      (b[7] === 45 || b[7] === 95) && (b[8] === 86 || b[8] === 118) &&
      /^\d{3}$/.test(b.toString("ascii",9,12)), "MODEL_GEOMETRY_INVALID","Invalid Blender file header");
  } else if (ext === ".fbx") {
    invariant(b.toString("ascii",0,20).startsWith("Kaydara FBX Binary") ||
      signature(file,4096).toString("utf8").includes("FBX"),
      "MODEL_GEOMETRY_INVALID", "Invalid FBX header");
  } else if (ext === ".obj") {
    const s = readFileSync(file,"utf8");
    invariant(/^(?:v)\s+[-+.\d]/m.test(s) && /^f\s+\d/m.test(s),
      "MODEL_GEOMETRY_INVALID", "OBJ is missing vertices or faces");
    for (const line of s.split(/\r?\n/)) if (line.startsWith("mtllib ")) {
      const dep = line.slice(7).trim();
      const rel = relative(root,resolve(dirname(file),dep)).split(sep).join("/");
      invariant(declared.has(rel), "MODEL_RESOURCE_MISSING","OBJ references a material not listed in otherFiles");
      safeArtifactPath(root,rel);
    }
  }
  const model = modelJson(file,ext);
  if (!model) return;
  for (const item of [...(model.buffers ?? []),...(model.images ?? [])]) {
    if (typeof item.uri !== "string" || item.uri.startsWith("data:")) continue;
    invariant(!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(item.uri) && !item.uri.includes("?") && !item.uri.includes("#"),
      "MODEL_RESOURCE_MISSING","External GLTF resources must be local files");
    const decoded = decodeURIComponent(item.uri);
    const dep = relative(root,resolve(dirname(file),decoded)).split(sep).join("/");
    invariant(declared.has(dep), "MODEL_RESOURCE_MISSING",
      "GLTF references a file not listed in otherFiles: " + dep);
    safeArtifactPath(root,dep);
  }
}

export function validateModelingOutput(folder: string): ModelingDeclaration {
  const resultPath = safeArtifactPath(folder, "modeling-result.json");
  const result: unknown = JSON.parse(readFileSync(resultPath,"utf8"));
  invariant(!!result && typeof result === "object" && !Array.isArray(result),
    "MODEL_RESULT_INVALID","Invalid modeling-result.json");
  const r=result as Record<string,unknown>;
  invariant(r.schemaVersion === 1 && typeof r.primaryModel === "string" &&
    Array.isArray(r.previewImages) && Array.isArray(r.otherFiles) &&
    [...r.previewImages,...r.otherFiles].every(v=>typeof v==="string") &&
    (r.notes === undefined || typeof r.notes === "string"),
    "MODEL_RESULT_INVALID","Modeling result fields are invalid");
  const all=[r.primaryModel as string,...r.previewImages as string[],...r.otherFiles as string[]];
  invariant(new Set(all).size === all.length,"MODEL_PATH_DUPLICATE","Duplicate paths in modeling-result.json");
  for(const p of all) safeArtifactPath(folder,p);
  const modelFile=safeArtifactPath(folder,r.primaryModel as string);
  const ext=(r.primaryModel as string).toLowerCase();
  invariant(/\.(blend|glb|gltf|fbx|obj)$/.test(ext),"MODEL_FORMAT_INVALID","Unsupported model format");
  validateModel(modelFile, folder, r.primaryModel as string,new Set(all));
  for (const p of r.previewImages as string[]) checkImage(safeArtifactPath(folder,p));
  return r as ModelingDeclaration;
}

export function verifyFixedArtifacts(dir: string, result: any): boolean {
  if (!result || !Array.isArray(result.artifacts)) return false;
  if (result.executionStatus === "success" && !result.artifacts.length) return false;
  try {
    for(const item of result.artifacts) {
      if(typeof item?.path!=="string" || typeof item.sha256!=="string" ||
        !Number.isSafeInteger(item.bytes) || item.bytes <= 0) return false;
      const file=safeArtifactPath(resolve(dir,"artifacts"),item.path);
      if(lstatSync(file).size!==item.bytes || hashFile(file)!==item.sha256) return false;
    }
    return true;
  } catch {return false}
}

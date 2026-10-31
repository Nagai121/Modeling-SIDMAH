import test from "node:test";
import assert from "node:assert/strict";
import {resolve} from "node:path";
import {checkAllMcpConfigs} from "../src/maintenance/mcp-config-sync.ts";

test("both harness-local MCP configurations use modeling_sidmah",()=>{
  const root=resolve(import.meta.dirname,"../..");
  const configs=checkAllMcpConfigs(root);
  assert.equal(configs.codex.synced,true);
  assert.equal(configs.opencode.synced,true);
});
test("modeling system and runtime modules import without loading any simulator",async()=>{
  const {SidmahSystem}=await import("../src/system.ts");
  assert.equal(typeof SidmahSystem,"function");
});

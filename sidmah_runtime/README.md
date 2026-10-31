# Modeling SIDMAH Runtime v0.1.2

Node.js 24.10+ / Blender。Codex・OpenCodeのMCPは`modeling_sidmah`。Tripo接続・生成APIは不要。

MCP: `node --experimental-strip-types sidmah_runtime/src/mcp/server.ts`（プロジェクトルートから）。
主要操作：`director_start`、`register_query`、`register_reference_image`、`list_reference_images`、`create_cell_assignment`、`accept_cell_assignment`、`create_start_assignment`、`submit_modeling_work`、`create_end_assignment`、`complete_end_review`。

RuntimeはWork Placeの`modeling-result.json`（schemaVersion 2・startId必須）と実ファイルをSnapshotに固定してハッシュ付きResultを返す。WorkerはBlenderでモデルを新規制作する。DBは既存SIDMAHのCell/Runtime/Integratedを分離して保持する。旧Simulatorは利用しない。

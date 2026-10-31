# Modeling SIDMAH Runtime

Node.js **24.10以上**。実行コードに外部npm依存はありません。SIDMAHからCell管理、Assignment配送、Session制御、Runtime/Result/End、SQLite統合検索を継承しました。

- MCP server: `node --experimental-strip-types sidmah_runtime/src/mcp/server.ts`（プロジェクトルートから）
- プロジェクトのCodex設定: `.codex/config.toml`
- OpenCode設定: `opencode.json`
- MCP設定の検査・同期: `node --experimental-strip-types sidmah_runtime/src/maintenance/mcp-config-sync.ts . check` / `apply`
- DB export: `node --experimental-strip-types sidmah_runtime/src/maintenance/state-export.ts . <destination>`

MCP名は`modeling_sidmah`です。原SIDMAHの`sidmah`とは別に登録します。Workerの外部モデル生成は既存Tripo CLI/MCPまたは接続済み操作ツールを使用します。

## Runtime
`create_start_assignment`がWorkerへ制作指示を配送します。Workerは実ファイルを生成した後`submit_modeling_work`を呼び、Snapshot→成果物→Resultを確定します。ResultはWorkerへ配送され、`create_end_assignment`と`complete_end_review`でDirectorへ戻ります。古いシミュレーター実行は存在しません。

## SQLite
`state/cell_management.sqlite`、`state/runtime_management.sqlite`、`state/integrated.sqlite`にデータを保存します。既存DBと誤混同しないよう`harness_identity`を検証します。統合DBは`shared_databases/`で同一モデル用の外部DBを読み取れます。SQL検索はSELECT/WITHに限定されます。

## 制約
MCPのツール名`submit_modeling_work`に変更しています。元SIDMAHの`starter`による実験コマンド実行は提供しません。TripoやBlenderを実際に動かすには、それぞれの既存ツールとの接続が必要です。


# Worker — Modeling SIDMAH v0.1.2

1. Bootstrapに従って`accept_cell_assignment`で受領し、現在のStartを1件だけ処理する。
2. `worker_skill/worker.md`、`worker_skill/skills/blender-modeling/SKILL.md`を必ず読む。比較する作業では`visual-review`も使う。
3. **Blender（`bpy`/CLIまたは既存のBlender MCP）で3D形状を新規制作する。** Tripo/外部3Dモデル生成サービスは利用しない。
4. `works/cell_<n>/work_place/`でモデルを保存し、`modeling-result.json`へ**現Startの`startId`**・モデル・プレビュー・依存ファイルを列挙して`submit_modeling_work`する。
5. Resultを監査し、観測結果・差異・残課題を`create_end_assignment`で返す。次のStart通知なしに新Runtimeを開始しない。

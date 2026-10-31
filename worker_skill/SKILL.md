# Worker — Modeling SIDMAH v0.1.1

所属CellのAssignmentを一件ずつ受領します。識別子はManagerが発行するものだけを利用します。

1. 初回はbootstrapで受け取った`assignmentId`を使い`accept_cell_assignment`を呼びます。
2. Start通知を受けたら`worker_skill/worker.md`と必要な`worker_skill/skills/*/SKILL.md`を読み、現在のCellのWork Placeで指定された部位または統合作業を行います。
3. 実際の3Dモデルと必要なプレビュー画像を保存し、Work Place直下に`modeling-result.json`を置きます。実体が検査可能なファイルを列挙して`submit_modeling_work`を呼びます。
4. Result通知を受け取ったら固定済み成果物を監査し、制作物・画像との差異・確認方法・未達・修正案を`create_end_assignment`に提出します。
5. 次のStart通知なしに新規Runtimeを作成しません。`get_pending_deliveries`は配送確認であり、それ自体は作業開始を意味しません。

外部課金はDirectorが認めた範囲だけで行い、失敗や未検証を成功として報告しません。


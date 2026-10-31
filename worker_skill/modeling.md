# Modeling artifact contract — schemaVersion 2

Workerは現在のStart Assignmentの`startId`を提出マニフェストに書く必要があります。以前のStartから残ったモデルやマニフェストを流用してはいけません。

Work Place: `works/cell_<n>/work_place/modeling-result.json`

例：
```json
{
  "schemaVersion": 2,
  "startId": "START_ASSIGNMENT_UUID_FROM_MANAGER",
  "primaryModel": "out/model.blend",
  "previewImages": ["renders/front.png"],
  "otherFiles": ["create_model.py"],
  "notes": "Created in Blender from references"
}
```

UUIDは例の文字列ではなくManagerが返した実値に置き換えます。全体モデルをBlenderで作成し、必要な部分だけを分離します。モデルとプレビューは非空である必要があり、GLTF/OBJで外部依存ファイルがあるときは必ず`otherFiles`に列挙します。絶対パス、上位パス、リンクは使用できません。

`submit_modeling_work`はStart IDを照合してSnapshotを固定し、SHA-256付きResultを生成します。Resultの品質評価はDirectorが実施します。

# Modeling Artifact Contract

`works/cell_<n>/work_place/modeling-result.json`に、`schemaVersion`=1、`primaryModel`、`previewImages`、`otherFiles`を記載します。例:

`{"schemaVersion":1,"primaryModel":"out/model.glb","previewImages":["renders/front.png","renders/side.png","renders/back.png"],"otherFiles":["out/model.blend"],"notes":"head candidate 2"}`

列挙するパスはWork Placeからの相対パスで、実在する非空のファイルです。絶対パス、上位ディレクトリへの移動、シンボリックリンクを使いません。`primaryModel`はBlend/GLB/GLTF/FBX/OBJのいずれかです。`previewImages`はPNG/JPEG/WebPを指定します。

`submit_modeling_work`はWork PlaceをSnapshotとして固定し、指定ファイルを`works/cell_<n>/runtime_<m>/artifacts/`へコピー、SHA-256を記録します。以降はWork Placeを別の作業で更新できます。Resultの監査では固定済みファイルを確認します。


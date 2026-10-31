# Modeling SIDMAH v0.1.3

**Blenderで参照画像から3Dモデルを新規制作するマルチエージェントハーネスです。** 外部3D生成サービスは使用しません。

## 使用方法
必要環境：Node.js 24.10以降、Blender、CodexまたはOpenCode。Blender MCPは任意で、標準のBlender CLIと`bpy`でも動作します。

1. プロジェクトをCodex/OpenCodeで開き、参照画像を**1枚以上**与えます。5部位×3方向の15枠は分類であり、全枠を埋める必要はありません。正面・横・背面が**1枚の画像に並んだ資料**も受け付けます。
2. Directorは利用できる添付ファイルを`register_reference_image`で登録します（パスまたはbase64を使用）。すでに`modeling/reference_images/`に画像がある場合は`list_reference_images`で参照します。ファイルを手作業で15個に分ける必要はありません。
3. Directorが画像を理解→Query登録→Field Control（FC）。FCでは**Blenderと制作管理の制御経路を確認し、仮モデルを作りません**。
4. WorkerはBlender（`bpy`/CLIまたは既存のBlender MCP）で**全体のモデルを最初から制作**します。比較・修正し、必要になった段階で部分を分離します。Cell数や部位分割の前提は固定しません。
5. 各Startの`startId`を`modeling-result.json`に記録して`submit_modeling_work`。Result→End→Directorの視覚検査・再Assignmentを繰り返します。

## 画像の置き方
`modeling/reference_images/<part>/<view>.png`（part: head / upper_body / lower_body / accessories / whole、view: front / side / back）または`modeling/reference_images/inbox/`への任意ファイルが入力として有効。`manifest.json`の`side`はnullでよく、左右が不明ならBlenderで両方向をレンダリングします。`scripts/validate_references.py`で最低1枚の確認ができます。

## Blender
Workerは`worker_skill/skills/blender-modeling/SKILL.md`に従って**空のBlenderシーンからモデルを作成**します。`blender -b --factory-startup --python works/cell_N/work_place/create_model.py`のように`bpy`スクリプトを実行します。ユーザーの画像に合わせた実制作コードはWorkerが生成します。立方体などの検査用仮モデルを完成品とみなしません。

補助：`scripts/blender_render_views.py`で正面・背面・側面両方向をレンダリングできます。`scripts/split_reference_montage.py`で合成三面図から明示した領域を切り出せます。`scripts/overlay_compare.py`で画像とレンダリングを重ね合わせます。各候補の寸法比較には同じ`--ortho-scale`と`--camera-center`を使用します。

## 出力と制御
Cell・Runtime・Result・Endの管理、配送・復旧、統合SQLite検索に対応します。Workerは`modeling-result.json`に`schemaVersion:2`・現在の`startId`・`primaryModel`・`previewImages`・`otherFiles`を記述します。前のStartの成果物は拒否します。

## 検証
Node.js/PythonのオフラインテストでRuntime・画像取扱い・提出・復旧を検査します。Blenderを使った実制作とDirectorによる外観の一致は、実際の参照画像・Blender動作に依存します。

# Blender modeling — create from scratch, then separate as needed

**必須の制作環境: Blender。** Blender MCPが提供されていれば使用可能。提供されていなくても、Blender CLIと`bpy` Pythonスクリプトで新規制作・編集・レンダリング・保存を行う。外部モデル生成APIを利用しない。事前に `blender --version` と `blender -b --factory-startup --python-expr "import bpy; print(bpy.app.version_string)"` を確認する。

## 入力から初期モデル
Workerは入力された画像（単独の視点、合成三面図、部位画像）を読んで形状を把握し、Work Placeにそのキャラクター専用のBlender Pythonスクリプトを作成する。Blenderでは`bpy.ops.mesh.primitive_*_add`、`bpy.data.meshes.new`、`bmesh`、編集モードやモディファイア、材質ノード、UV/テクスチャを使って**空のシーンから**実際のモデルを生成する。ユーザーが渡していない完成済みメッシュを前提にしない。

`blender -b --factory-startup --python works/cell_N/work_place/create_model.py` のように実行できる。単なるサンプル立方体や検査用仮モデルを完成品として提出しない。制作のPythonスクリプト、Blenderファイル、必要ならGLB/テクスチャを保存する。

## 制作の順序
最初に全体のプロポーション・輪郭・服・髪・色の一致を目標に制作する。**単一の閉じたソリッドを強制しない。** 必要になったときにBlenderのメッシュ選択、分離（`bpy.ops.mesh.separate`）、別オブジェクト化や局所モデリングを行う。部位分割を生成の前提にしない。

## 視覚検査
Blenderで入力に対応する視点をレンダリングし、画像と見比べる。入力が合成画像なら視点領域を識別し、必要に応じて切り出して比較する。側面の左右が不明なら左と右の両方をレンダリングして比較する。モデル間比較は同じカメラ条件とする。`scripts/blender_render_views.py`や`scripts/overlay_compare.py`を使える。

## 提出
Startに紐づく`modeling-result.json`（schemaVersion 2・startId必須）を出力する。自分が制作したモデルと依存ファイルが存在し、Blenderで読み込めることを確認する。全体一致の最終判断はDirectorが行う。

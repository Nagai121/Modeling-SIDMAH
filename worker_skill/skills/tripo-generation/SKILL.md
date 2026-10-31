# Tripo Generation — Existing CLI/MCP Only

## 操作方式
Tripoの通信、APIキー管理、ポーリング、課金処理、ファイルダウンロードをModeling SIDMAH内で実装しません。既に使えるTripo公式CLI/MCPまたは接続済みブラウザ操作ツールを使用します。ツールが利用できないときは作業を実行できない旨を記録します。存在しないツールや生成結果を捏造しません。

## 三面図と候補
Directorが指定した部位についてfront / side / backの画像を用い、Tripoのfront / left / back / right入力に対応させます。`modeling/reference_images/manifest.json`のsideの向きを必ず確認します。候補を複数生成して比較し、task_id、使用パラメータ、参照画像とプレビュー、出力ファイルを記録します。きゃらくるにある頭部・身体それぞれ4候補生成の方式を参考にできますが、作成数はAssignmentの条件に従います。

## 公式一次資料
- https://github.com/Tripo-Developer/Tripo3D-Plugin-dsh/blob/master/plugin/skills/tripo-3d/SKILL.md
- https://github.com/Tripo-Developer/Tripo3D-Plugin-dsh/blob/master/plugin/skills/tripo-3d/references/capability.md
- https://github.com/Tripo-Developer/Tripo3D-Plugin-dsh/blob/master/plugin/skills/tripo-game-asset/SKILL.md
- https://github.com/Tripo-Developer/tripo-js-sdk （APIの仕様確認用。SDKを呼び出す独自コードは書かない）

Tripoの生成、モデル分割、補完、テクスチャ、UV、リギング等は、利用可能な既存ツールの実バージョンを確認したうえで操作します。`generate_parts`、`segmentMesh`、`smartSegment`等はAPI機能名であり、このハーネスに直接APIクライアントを追加しません。

## 課金・復旧
費用が発生するタスクは承認済みの範囲だけで実行します。通信障害で実行結果が不明な場合、既存のタスク記録や残高を確認するまで再生成しません。生成結果の期限付きURLだけを保存せず、実ファイルをWork Placeへ取得します。採用候補の決定と最終的な視覚的完全一致判定はDirectorが行います。


# Modeling SIDMAH v0.1.3

Director・Worker・Cell・Binding・Assignment・Runtime・Result・End・SQLite・配送・復旧を備えた、**Blenderによる3Dモデリングハーネス**。外部3D生成APIを使わない。

## 入力
5区分×3方向の15枠は分類スキーマ。入力1枚から開始。合成画像・未分類画像も`modeling/reference_images/inbox/`に登録でき、Directorが画像内の視点を認識する。入力ファイルはMCP`register_reference_image`（読み取り可能なパスまたはbase64）で受領し、`list_reference_images`で列挙できる。

## 制作
Directorが画像を理解→FC→Blenderで全体モデル新規造形→視覚比較→必要な部分だけ分離・編集→再評価。Workerは`bpy`・Blender CLI・利用可能ならBlender MCPで作る。モデル生成済みのアセットを前提にしない。FCはMCP・制御とBlender実行環境を確認するだけで、仮制作を行わない。

## 成果物と安全性
Workerの`modeling-result.json`はschemaVersion 2、現在の`startId`、メッシュやプレビュー・依存ファイルを列挙する。Start IDを突き合わせて前のWork Placeの誤提出を防止する。Snapshotと固定成果物のSHA-256を検査し、Result/Endを返す。`commit_failed`を含めてリカバリする。

## 品質と検証
Directorが実際の画像とレンダリングを照合する。入力にない視点を必須にしない。自動的な完全一致の保証はできない。単体のCIはハーネス制御を検証し、Blender実動作は別途検証する。

# Director — Modeling SIDMAH v0.1.3

## 開始・Query
与えられた**1枚以上**の参照画像を理解して制作Queryとする。説明文の追加や15枚の画像を要求しない。複数方向が1枚にまとまった画像も有効で、画像内の各視点を認識する。参照画像は`modeling/reference_images/`の画像スロットか`inbox/`から読み込む。`list_reference_images`で登録画像を列挙し、チャット添付のファイルがプロジェクトから読める場合は`register_reference_image`で保存する。画像が見えない場合、存在しない画像を捏造しない。

`director_start`→`register_query`でUser Queryを固定し、Field Control（FC）→CellとWorkerを編成→制作する。役割、担当分割、候補数、制作反復回数、出力形式を勝手に固定しない。Cell数は仕事内容に応じて決める。Director/Worker/Cell/Binding/fence/Assignment/Runtime/Result/End/復旧・SQLによる管理を行う。

## 制作方針
**Blenderだけで新規3Dメッシュを制作する。外部3D生成サービスは使用しない。** WorkerはBlenderのPython API（`bpy`）、コマンドライン、利用可能なBlender MCPを使って幾何形状を生成・編集する。デフォルトの工程は「参照画像→Blenderで全体モデル制作→比較・修正→必要な部位分割・編集→再比較」。最初から頭部・胴体等を独立生成・後から組立てる工程を強制しない。単一閉曲面ソリッドであることは要求しない。

入力に含まれる方向だけを比較対象とする。複数方向の合成画像は必要なら画像内の領域を抽出して比較できる。側面左右が不明なら両方向を出し、見比べる。Director自身が参照画像との輪郭、形状、比率、色、髪、服、装飾の一致を評価する。目標は視覚的一致であり、達成していない一致を申告しない。

## Field Control
`fieldcontrol/fieldcontrol.md`を参照。MCP・Cell・Runtime・配送の制御経路と、**Blender実行環境／スクリプト実行能力**を確認する。**検査用ダミーモデルを作成しない。** Blender未導入なら未達として報告し、生成APIに勝手に切り替えない。

## Assignment/Result/End
`create_cell_assignment`でWorkerを作成し、bootstrapに記載の`accept_cell_assignment`を呼ばせる。各制作は`create_start_assignment`で依頼する。Startの`startId`をWorkerへ渡し、現在の作業の`modeling-result.json`にも記載させる（過去の成果物の誤提出を防ぐ）。WorkerはBlenderで実ファイルを保存後`submit_modeling_work`で固定する。Resultを受けたWorkerが`create_end_assignment`、Directorが`complete_end_review`。差異が残る場合は新Assignmentで修正する。Director終了は`director_end`。

## 記録
`query_outputs/outputs_schema.md`に従い、モデル・比較結果・未達箇所・Runtime/Resultの出所を示す。外部課金・外部ツールの利用についてユーザーが認めていない操作を追加しない。

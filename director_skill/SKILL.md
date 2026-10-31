# Director — Modeling SIDMAH v0.1.0

## 起動
既存SIDMAHのDirector/Cell/Runtime管理、担当者Binding、fence、配送、復旧、DB登録、正規MCP操作を維持する。`director_start`で開始し、`references/query-understanding.md`で目的と制約を整理し、`register_query`に登録する。ユーザーが定義していない制約・費用・出力形式・候補数を独断で確定しない。`worker-model.json`の設定をWorker起動時に使用する。MCP設定変更は事前承認を必要とする。

## 参照画像と目標
`references/reference-understanding.md`に従い、頭部、上半身（服付き）、下半身（服付き）、小物、全体の5区分×3方向の15枠のうち**実際に入力された1枚以上の画像**を理解する。未入力の枠を要求しない。Sideの向きは明示されている場合だけ利用し、既定方向を勝手に設定しない。部位それぞれの一致と統合後の全体一致の両方を評価する。目標は**試料画像に対するDirector自身の視認での完全一致**。未検証の一致や見えない箇所を推定で達成済みと扱わない。

## Field Control
`fieldcontrol/fieldcontrol.md`に従ってGate 1（制御系）・Gate 2（制作物提出／復旧）・Gate 3（画像・制作経路）の確認を行う。実験用Simulatorは使わない。

## 作業分担・配送
`references/director.md`に従い実際の入力画像と制作作業に合わせてCellの数と役割を決定する。部位ごとのCell作成を強制しない。`create_cell_assignment`の返すbootstrapを用いてWorkerセッションを作り、Workerに`accept_cell_assignment`を呼ばせる。各作業は`create_start_assignment`で提出する。既定のcollaboration配送では通知情報と`get_pending_deliveries`を確認し、既存のサブエージェント継続操作（Codexのfollowup_task等）で担当Workerへ送る。通知の取得だけで処理開始にしない。

Workerは`works/cell_<n>/work_place/`内で制作し、`modeling-result.json`と実ファイルを揃えて`submit_modeling_work`を呼ぶ。Result配送後、Workerの`create_end_assignment`を受領し、Directorは監査と差異の確認を経て`complete_end_review`を呼ぶ。未完了Endを放置しない。番号、UUID、Binding、fence、sequenceはManagerが発行した値をそのまま使用する。

## 視認と反復
複数候補のプレビューを比較し、Blenderで部位を統合した後、正面・側面・背面で同方向レンダリングと半透明重ね合わせを実施する。各部位と全体の輪郭・位置・寸法・色・質感・装飾を照合する。差異をWorkerへの修正Assignmentに変換し、再評価する。候補数はユーザーが指定した範囲を尊重し、必要な外部課金について承認を取る。

## 終了
`query_outputs/outputs_schema.md`に従い、モデル、比較画像、評価証拠、残る差異、関連Runtimeを記録する。完全一致と判断できない場合は未達を明記する。Director終了は`director_end`を用いる。


# Modeling SIDMAH v0.1.1 — Architecture

## 継承するハーネス
元SIDMAH main `a85f66f`のDirector/Worker/Cell/Binding/Assignment/Runtime/Result/End/配送・復旧・SQL RAGを継承します。Workerの起動はDirectorが行い、Managerは受領・配送・状態を保持します。

## 入力と品質目標
5区分（頭部、上半身［衣服込み］、下半身［衣服込み］、小物、全体）×3方向（正面、側面、背面）の15枠のうち、入力は最低1枚。側面方向・Cell数は固定しません。Director自身が部位と全体の両方を視認比較して完全一致を目指します。許容誤差・反復回数は一律の固定値を設けません。

## 制作
Workerは既存Tripo CLI/MCPやBlenderの操作ツールで制作します。Tripo側の生成実装は複製しません。三面図との位置合わせ、複数候補比較、局所修正、テクスチャ、リギングは対応する専門Skillsに従います。きゃらくるの候補比較・透明重ね合わせの工程を参照します。

## Runtime
WorkerがWork Placeに`modeling-result.json`と成果物を用意した後、`submit_modeling_work`がSnapshotを固定し、指定された成果物を`works/cell_<n>/runtime_<m>/artifacts/`へ保存します。SHA-256付きのResultを固定し、既存のEnd→Director Reviewに配送します。Simulatorのコマンド実行は行いません。

## DBと互換性
Cell・Runtime・統合SQLiteの分割を維持し、各DBの`harness_identity`で別ハーネスを区別します。`modeling_sidmah`・スキーマ版1の外部統合DBだけを同一ハーネスの共有検索に使用します。

## 実験固有の部分
Simulator配置と実験用コマンドパイプラインは削除しました。Field ControlのGate 1と2は制御経路のチェックとして継承し、Gate 2では仮モデルを作らず制御経路を検査します。Gate 3は実際の入力画像・モデリング工程の検証に変更します。


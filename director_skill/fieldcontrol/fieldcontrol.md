# Field Control — Modeling

Gate 1（詳細: `system_fc.md`）：Codex/OpenCodeのMCP、Manager、Director、Cell、Binding、fenceが正常であることを検査する。

Gate 2（詳細: `system_fc.md`）：Worker受領→Start Assignment→Work Placeに実際の検査用モデル・画像を保存→`submit_modeling_work`→Result→End→Director Reviewを、既存の配送経路で確認する。Snapshot、固定ハッシュ、アーカイブと復旧も確認する。これは品質評価の実績には数えない。

Gate 3（詳細: `modeling_fc.md`）：15枚の試料画像の形式・向き・部位、既存Tripo等の生成ツール経路、Blenderでの編集・三方向レンダリング、半透明重ね合わせ、成果物の出所を検証する。課金が生じる操作は承認された範囲だけで実行する。

失敗・未検証のGateを合格とみなさない。確認内容、検査証拠、障害、再試行理由を記録する。旧実験用Simulatorは使用しない。


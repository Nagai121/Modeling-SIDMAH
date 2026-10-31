# Modeling SIDMAH v0.1.1

SIDMAH v2.0.2（親コミット `a85f66f626a4c2a00ef16909e59fc5a137fcad79`）のマルチエージェント実行基盤を継承し、3Dキャラクターモデリング専用に変更したハーネスです。独立した通常のGitHubリポジトリとして利用できます。変換スクリプトや元SIDMAHの別チェックアウトは不要です。

## 目標と入力

**頭部・上半身（衣服込み）・下半身（衣服込み）・小物・全体の5区分 × 正面・側面・背面の3方向＝15の画像枠**を使います。画像は**最低1枚**あれば開始でき、残りの枠は空欄のままで構いません。最終目標はDirectorの視認による試料画像との完全一致です。実際に確認していない一致を達成済みとして報告しません。

`modeling/reference_images/manifest.json`の側面方向は任意で、既定値はありません。必要な場合だけ指定します。参照画像は`modeling/reference_images/<part>/<view>.png`等に配置します。part は `head`、`upper_body`、`lower_body`、`accessories`、`whole`、view は `front`、`side`、`back`です。

## 起動

必要なもの：Node.js 24.10以降、CodexまたはOpenCode、必要に応じてBlender・Blender MCP・Tripo公式CLI/MCPなどの**既存ツール**。Pythonの画像検査は標準ライブラリ、重ね合わせスクリプトはPillowが必要です。Tripoの独自APIクライアントやAPIキー管理は実装していません。

1. このリポジトリをそのままcloneし、プロジェクトルートでCodexまたはOpenCodeを開きます。
2. `modeling/reference_images/` の15枠のいずれかに**最低1枚**の画像を配置します。側面方向は必要な場合のみ指定します。
3. `python scripts/validate_references.py modeling/reference_images` で実際に配置した画像を検査します。
4. `AGENTS.md` を読み、Directorとして入力画像を理解してからFCを実施します。FC Gate 2では検査用モデルを作りません。MCP設定は `.codex/config.toml` と `opencode.json` に収録されています。設定はプロジェクトルートからの相対パスです。
5. Directorは`director_start`、`register_query`で作業を確定し、Cell・Workerへ`create_cell_assignment`と`create_start_assignment`で作業を割り当てます。
6. Workerは対象の`works/cell_<n>/work_place/`へ完成モデルと画像を置き、`modeling-result.json`を書いて`submit_modeling_work`を呼びます。
7. Resultを受け取ったWorkerが`create_end_assignment`、Directorが`complete_end_review`で成果物と参照画像を比較します。必要な修正は新しいAssignmentとして渡します。

## 3D制作の専門機能

`worker_skill/skills/`に以下の専門Skillsを設けています。

- `reference-analysis`：試料画像の読み取りと方向・部位の整合確認
- `tripo-generation`：既存Tripo CLI/MCPを用いた多視点生成、複数候補の取得、分割・補完
- `blender-assembly`：部位の組立て、位置合わせ、三方向のレンダリング
- `visual-review`：半透明重ね合わせとDirectorへの差異報告
- `material-and-rigging`：テクスチャ、UV、ウェイト、リギング、衣服や髪の調整

Tripo公式Skills：[Tripo3D-Plugin-dsh](https://github.com/Tripo-Developer/Tripo3D-Plugin-dsh)。
きゃらくるの制作工程：[Charakuru](https://github.com/nanocle/Charakuru)。
後者のコード・Skill原文・素材は本リポジトリに複製していません。公開された制作手法を参考に、専用のプロンプト・補助コードを新規記述しています。

## 画像比較

Blenderで正面・側面・背面の固定視点をレンダリングし、参照画像と半透明で重ねる補助ツールを収録しています。

`blender -b --python scripts/blender_render_views.py -- --input works/cell_1/work_place/model.glb --output renders`

`python scripts/overlay_compare.py --reference modeling/reference_images/whole/front.png --render renders/front.png --output comparisons/front.png`

`scripts/overlay_compare.py`は検査用画像を生成するだけです。完全一致を機械的に判定するものではありません。部位単位と統合した全体像の両方をDirectorが評価します。

## 状態・成果物

既存のCell、Binding、Start、Runtime、Result、End、Director Review、SQLite統合検索、配送と復旧を維持します。旧Starter→Simulator→Finisherの独立実行は廃止しました。Workerが提出すると`submit_modeling_work`がSnapshotを固定し、成果物をRuntime単位に保管してSHA-256付きResultを確定します。

SQLiteにはハーネス名とスキーマバージョンを記録します。別のSIDMAHのDBは拒否し、**同じmodelingSIDMAHのDB**は互換チェックのうえ共有検索できます。保存先`state/`と`works/`は実行時生成です。

## 検証範囲

設計とソースコードの静的確認は行っています。実際のCodex/OpenCodeからTripo・Blenderを通した総合実行、課金APIの呼び出し、Directorが完全一致に到達できることの実証は未実施です。Tripoの直接API呼び出しは実装していません。

元SIDMAH：Apache-2.0。Tripo公式Skills／SDK：MIT。きゃらくる：独自Source-Available。元SIDMAHの`LICENSE`を保持しています。


# Field Control — Modeling SIDMAH

Gate 1: 元SIDMAHのDirector・Worker・Cell・MCP・Binding・fence等の制御経路を確認。
Gate 2: Runtime・Start/Result/End配送・既存SQLite・復旧経路を確認。**仮モデル・仮Assignmentは作成しない**。
Gate 3: 最低1枚の参照画像へのアクセス、Blenderの実行環境（`blender --background --factory-startup --python-expr "import bpy; print(bpy.app.version_string)"`等）、`bpy`を用いた新規メッシュ制作と編集が可能なツール経路、レンダリング・比較の手段を確認。MCPプラグインの存在は必須ではなく、Blender CLIがあればよい。

FCは制御・環境の確認であり、架空の制作作業はしない。使えない環境を合格と報告しない。外部3D生成サービスの利用をFCに含めない。

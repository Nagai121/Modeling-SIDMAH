# Worker Responsibility

現在のCellに割り当てられた部位・目的・成果物条件に限定して制作します。他Cellの成果物や参照画像を無断で変更しません。作業場所は`works/cell_<n>/work_place/`です。制作のためのTripo CLI/MCPやBlender操作は専門Skillsを参照します。

Tripoの生成タスクID、実際のパラメータ、候補とプレビュー、ダウンロード済みの実ファイルを残します。通信失敗時はタスク状態を確認せず再課金ジョブを実行しません。Blenderの方向とスケールを保ち、参照画像との比較を可能にします。

`modeling-result.json`を用意して`submit_modeling_work`を実行します。Resultを受領したら固定済み成果物を監査し、確認できた点・確認できない点・参照画像との差異をEndへ記録します。最終一致の判定はDirectorにあります。


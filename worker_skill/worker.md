# Worker responsibility — Blender-first modeling

現在のStartが指定する作業だけを行う。元SIDMAHのWork Place（`works/cell_<n>/work_place/`）で`bpy`を使って**最初のメッシュから**制作する。Blenderが使用できない場合は勝手に外部3D生成へ切り替えない。制作コードはWork Placeに保存し、元画像を改変しない。

制作の基本順は、全体の造形→入力画像との照合→必要な場合のみメッシュを分割→局所修正→再比較。新規メッシュ作成、衣服・髪・材質の適用、レンダリング、Blend/GLBの保存をBlenderのPython APIで行う。具体的な操作は`skills/blender-modeling/SKILL.md`を参照。

提出前に`modeling-result.json`の`startId`が**今のStart Assignment**のものかを確認し、前の作業のファイルをそのまま提出しない。Resultを受けたら固定ファイルを監査し、Endへ報告する。

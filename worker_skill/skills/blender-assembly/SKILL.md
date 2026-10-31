# Blender Assembly and Orthographic Review

Directorの指示に従い、担当メッシュを正しい座標・単位・方向で読み込みます。部位の接合位置、頭身、全体のシルエットを実際に提供されている参照画像と照合して調整します。画像の基準を勝手に変更しません。

`scripts/blender_render_views.py`で正面・背面と、側面方向が指定された場合の側面をレンダリングできます。Blender MCPなど実際に利用できる既存ツールでメッシュ編集・配置・保存を行います。画像の単純な重ね合わせは`scripts/overlay_compare.py`を使えます。

制作前のデータを保全し、Blend/GLB等の実ファイル、プレビュー、実施した編集内容をWork Placeに保存します。別Cellの完成物を上書きせず、統合作業のAssignmentに明示された範囲で作業します。


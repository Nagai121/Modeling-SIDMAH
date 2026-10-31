# Reference Analysis

Directorから指定された部位の正面・側面・背面画像と、必要に応じて全体三面図を確認します。`modeling/reference_images/manifest.json`でsideの左右を確定します。

見えている形状、輪郭、位置、寸法、色、材質、模様、装飾、衣服の形を整理し、異なる方向の画像間で矛盾がないか調べます。背景や未観測部分を確定形状と誤認しません。結果は担当CellのWork Placeに記録し、参照画像を直接上書きしません。静的検査には`scripts/validate_references.py`を使用できます。


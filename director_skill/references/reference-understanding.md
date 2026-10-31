# Reference Understanding

対象は5区分（head / upper_body / lower_body / accessories / whole）×3方向（front / side / back）の15枠です。実際の入力画像は最低1枚で構いません。`side`は指定がない場合nullです。`scripts/validate_references.py`は静的な存在・形式検査を行います。

Directorは入力されている各画像の形状、輪郭、色、材質、模様、装飾、境界を理解し、全体画像がある場合はそれに対するサイズ・位置・接合関係を整理します。遮蔽部分については根拠なく断定しません。側面方向が不明な場合は明示されていないものとして扱い、推定した方向を既定値として保存しません。部位単体と全体の両方を一致判定の対象とします。


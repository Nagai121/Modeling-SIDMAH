# Reference Understanding

対象は`modeling/reference_images/manifest.json`で宣言された5対象（head / upper_body / lower_body / accessories / whole）、それぞれfront / side / backの合計15画像です。`side`にleft/rightのどちらかが指定されます。`scripts/validate_references.py`は静的な存在・形式検査を行います。

Directorは各画像にある形状、輪郭、色、材質、模様、装飾、境界を理解し、全体三面図に対するサイズ・位置・接合関係を整理します。遮蔽部分については根拠なく断定しません。側面の左右をすべての部位で統一し、3Dモデルの座標系との対応を明示します。部位単体と全体の両方を一致判定の対象とします。


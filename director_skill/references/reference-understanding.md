# Reference Understanding

15枠は5区分（head / upper_body / lower_body / accessories / whole）×3方向（front / side / back）という**分類**であり、入力枚数条件ではない。最低1枚の参照画像で開始する。`modeling/reference_images/inbox/`の未分類画像、三方向を並べた合成画像も1枚として有効。Directorが画像の内容を見て、わかる範囲の方向・部位を認識する。`side`が未指定なら左右未確定のまま扱う。
入力されている画像の輪郭、色、衣服、髪、装飾、比率、重なりを整理する。部位画像がないことは失敗条件ではない。未観察部分を確定情報として扱わない。

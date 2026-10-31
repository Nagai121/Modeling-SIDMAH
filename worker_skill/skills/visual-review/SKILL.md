# Visual review — reference-based

入力された参照画像と、Blenderで新規制作したモデルの対応するレンダリングを比較する。合成画像は画像内に存在する視点を見分け、必要なら`scripts/split_reference_montage.py`で領域を取り出す。未入力方向は必須にしない。
`scripts/overlay_compare.py`は半透明重ね合わせの補助。モデル寸法の比較には共有カメラ中心と正射影スケールを用いる。側面の左右が不明なら両方をレンダリングする。
輪郭、比率、服、髪、色、装飾などの差異を記録し、最終一致の判断はDirectorが行う。

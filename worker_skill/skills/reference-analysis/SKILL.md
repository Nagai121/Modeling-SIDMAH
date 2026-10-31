# Reference analysis — one image or more

15枠のどこに入力された画像であっても、最低1枚から作業できる。`modeling/reference_images/inbox/`にある未分類画像や複数方向を1枚にまとめた画像も、**画像そのものをDirector/Workerが視認**して理解する。ファイル名のfront/side/backだけを視点判定の根拠にしない。
必要な場合、合成画像の視点領域を`scripts/split_reference_montage.py`で明示した範囲で切り出す。左右が判断できないときは不明と報告する。存在しない参照画像や向きは捏造しない。

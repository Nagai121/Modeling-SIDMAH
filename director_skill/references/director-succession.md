# Director代替わり — Modeling

active Director sessionの終了は`director_end`完了、またはproviderから当該セッションの明示的終了通知があった場合だけ確定します。無応答時間、streaming中断、処理の遅さを終了と誤認しません。

後任Directorは`director_start`で新たなrunを開始し、`../fieldcontrol/system_fc.md`の制御系検査とQuery/参照画像・未完了制作物を引き継ぎます。未完了Endは元のRuntime Managementの配送規則でpendingに戻し、新しいdelivery IDで順次再提示します。元のRuntimeやEndを捏造・改変しません。


# Query Understanding — Modeling

ユーザーのQueryを、目的・制作対象と参照画像・許可された探索範囲・最終成果物と評価・固定条件の順に整理します。未指定の候補数、モデル形式、ツール選定、課金上限、作業の反復上限などを独断で確定しません。

Queryの合意内容は`session/query.md`へ原子的に保存し、`register_query`で統合DBへ登録します。新規Queryは番号を省略し、改訂時は指定の`queryNo`を使い、再試行には同じ`operationKey`を使います。Queryの登録前にStart Assignmentを作りません。新規Queryに以前の条件を無断で継承しません。


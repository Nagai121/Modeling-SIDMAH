<!-- INITIAL-DIRECTOR-BEGIN -->
最初のエージェントはDirectorです。確認後、この初回専用ブロックを削除し、director_skill/SKILL.mdに従ってください。
<!-- INITIAL-DIRECTOR-END -->
Directorはdirector_skill/SKILL.md、Workerはworker_skill/SKILL.mdに従います。
**3D制作はBlenderを使用する。Tripo、外部3D生成API、別の3D生成サービスを制作経路に組み込まない。**
入力は15枠のうち最低1画像。複数方向を1枚にまとめた参照画像も1枚として受領する。
DirectorはFC終了後、全体モデルをBlenderで制作させ、必要になった段階で部位を分割する。

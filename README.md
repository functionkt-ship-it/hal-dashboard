# HAL AI統合ダッシュボード v1.0

AI・プロジェクト・日常ツールを一つの入口で管理する、依存関係のない静的ダッシュボードです。

## 起動

`index.html` を直接開くのではなく、ローカルWebサーバーかGitHub Pagesで表示してください。JSON設定を`fetch`で読み込むためです。

```bash
cd hal-dashboard/github-pages
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080` を開きます。

## 設定変更

- `data/projects.json`: プロジェクトカード、今日やること、最近更新したもの
- `data/tools.json`: クイック起動のリンク

プロジェクトには、`name`、`summary`、`status`、`leadAi`、`updatedAt`、`nextAction` を設定します。`notionUrl`、`githubUrl`、`outputUrl`は必要なものだけ追加できます。

## 公開

このフォルダの内容をGitHubリポジトリのルートへ置き、GitHub Pagesを有効化すれば静的サイトとして公開できます。

公開前に、以下を確認してください。

- `data/*.json` に顧客情報・APIキー・パスワードを入れない
- Notion・GitHubなどのリンク先が正しい
- 公開が必要な内容だけが表示されている

## 運用原則

- 設計・意思決定・作業履歴の正本はNotion
- コードと変更履歴の正本はGitHub
- HALは入口と状況表示に限定し、重要情報を二重管理しない

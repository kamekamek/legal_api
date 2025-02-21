# 開発ガイド

このディレクトリには、Legal APIプロジェクトの開発に関するドキュメントが含まれています。

## ファイル構成

- `requirement.md` - 要件定義
- `setup.md` - 開発環境セットアップ
- `coding-standards.md` - コーディング規約
- `git-workflow.md` - Git運用ルール
- `review-process.md` - コードレビュープロセス

## 開発環境

### 必要なツール

- Node.js 18.x以上
- pnpm
- Git
- VSCode（推奨）

### 推奨VSCode拡張機能

- ESLint
- Prettier
- TypeScript and JavaScript
- Tailwind CSS IntelliSense
- GitLens

## プロジェクトセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/your-org/legal-api.git
cd legal-api

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

## 開発フロー

1. 機能ブランチの作成
```bash
git checkout -b feature/機能名
```

2. 開発・テスト
```bash
# テストの実行
pnpm test

# リンター実行
pnpm lint
```

3. コミット
```bash
git add .
git commit -m "feat: 機能の説明"
```

4. プルリクエスト作成

## コーディング規約

- [コーディング規約](./coding-standards.md)を参照
- ESLint/Prettierの設定に従う
- TypeScriptの型定義を徹底

## テスト

- ユニットテスト必須
- E2Eテストは機能追加時に作成
- カバレッジ80%以上を維持

## デプロイメント

- mainブランチへのマージで自動デプロイ
- ステージング環境でのテスト必須
- 本番デプロイは承認必要

## トラブルシューティング

よくある問題と解決方法：

1. ビルドエラー
```bash
# 依存関係の再インストール
rm -rf node_modules
pnpm install
```

2. テストエラー
```bash
# テストキャッシュのクリア
pnpm test --clearCache
```

## 参考リンク

- [プロジェクト要件](./requirement.md)
- [API仕様書](../api/api-spec.md)
- [アーキテクチャ設計](../architecture/development-schema.md) 
# 推奨ディレクトリ構造

```
legal_api/
├── frontend/
│   ├── src/
│   │   ├── features/              # 機能ごとのコンポーネント
│   │   │   ├── projects/         # プロジェクト管理機能
│   │   │   ├── legal-updates/    # 法令アップデート機能
│   │   │   ├── map/             # 地図表示機能
│   │   │   └── checklists/      # チェックリスト機能
│   │   ├── components/           # 共通コンポーネント
│   │   ├── services/             # APIサービス
│   │   ├── hooks/               # カスタムフック
│   │   ├── utils/               # ユーティリティ関数
│   │   └── tests/               # テストファイル
│   └── e2e/                     # E2Eテスト
│
├── backend/
│   ├── src/
│   │   ├── features/            # 機能ごとのルートとコントローラー
│   │   │   ├── projects/
│   │   │   ├── legal-updates/
│   │   │   ├── zoning/
│   │   │   └── checklists/
│   │   ├── middleware/          # ミドルウェア
│   │   ├── services/           # ビジネスロジック
│   │   ├── models/             # データモデル
│   │   └── tests/             # テストファイル
│   └── e2e/                   # E2Eテスト
│
├── docs/                      # ドキュメント
│   ├── api/                  # API仕様書
│   ├── development/         # 開発ガイド
│   └── deployment/         # デプロイメントガイド
│
└── scripts/                 # 開発・デプロイメントスクリプト
```

## 段階的な開発とテスト計画

### Phase 1: プロジェクト管理機能
1. フロントエンド
   - `frontend/src/features/projects/`に実装
   - 単体テスト: `frontend/src/tests/projects/`
   - E2Eテスト: `frontend/e2e/projects/`

2. バックエンド
   - `backend/src/features/projects/`に実装
   - 単体テスト: `backend/src/tests/projects/`
   - E2Eテスト: `backend/e2e/projects/`

### Phase 2: 法令アップデート機能
同様の構造で`legal-updates`ディレクトリ以下に実装

### Phase 3: チェックリスト機能
同様の構造で`checklists`ディレクトリ以下に実装

## テスト環境構築

1. ユニットテスト
   - Jest + React Testing Library (フロントエンド)
   - Jest (バックエンド)

2. E2Eテスト
   - Cypress (フロントエンド)
   - Supertest (バックエンド)

3. 統合テスト環境
   - Docker Compose による開発環境
   - テスト用データベース

## CI/CD パイプライン

```yaml
stages:
  - test
  - build
  - deploy

test:
  - ユニットテスト実行
  - E2Eテスト実行
  - コードカバレッジ計測

build:
  - Docker イメージビルド
  - イメージタグ付け

deploy:
  - 開発環境デプロイ
  - ステージング環境デプロイ
  - 本番環境デプロイ
``` 
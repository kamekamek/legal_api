# 法規制情報検索アプリケーション

このアプリケーションは、住所から地図表示と法規制情報（用途地域、建蔽率、容積率など）を検索できるウェブアプリケーションです。また、プロジェクト管理機能を備え、各プロジェクトに法規制情報を紐づけて管理することができます。

## 機能

- 住所検索による地図表示
- 法規制情報の表示
  - 用途地域
  - 防火地域
  - 建蔽率
  - 容積率
  - 高度地区
  - 区域区分（市街化区域、市街化調整区域など）
  - 風致地区
  - 建築基準法48条（用途制限）
  - 法別表第２（用途地域内の建築物の制限）
  - 建築安全条例

- プロジェクト管理機能
  - プロジェクトの作成・編集・削除
  - プロジェクトに法規制情報を紐づけ
  - プロジェクト一覧表示
  - プロジェクト詳細表示

- 建築計算機能
  - 建築可能面積の計算
  - 延べ床面積の計算（道路幅員制限考慮）
  - 計算履歴の保存・表示

- 告示文管理機能
  - プロジェクトに関連する告示文の保存
  - 告示文の表示・編集

## 必要要件

- Node.js (v18.x以上)
- pnpm
- Wrangler CLI (Cloudflare Workers用)
- Supabase アカウント
- ZenrinAPI アクセスキー

## セットアップ手順

1. リポジトリのクローン
```bash
git clone [repository-url]
cd legal_api
```

2. Wrangler CLIのインストール
```bash
npm install -g wrangler
wrangler login  # Cloudflareアカウントにログイン
```

3. バックエンドのセットアップ
```bash
cd backend
npm install
```

4. フロントエンドのセットアップ
```bash
cd frontend
pnpm install
```

5. 環境変数の設定

`backend/.env`ファイルを作成:
```env
ZENRIN_API_KEY=your_api_key_here
CORS_ALLOWED_ORIGINS=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

`frontend/.env`ファイルを作成:
```env
VITE_API_URL=http://localhost:8787
VITE_ZENRIN_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

※ 各`your_xxx_here`は実際のAPIキーに置き換えてください。

## 開発環境での起動方法

1. バックエンドの起動（Cloudflare Workers）
```bash
cd backend
wrangler dev --port 8787
```

2. フロントエンドの起動（新しいターミナルで）
```bash
cd frontend
pnpm dev
```

3. ブラウザでアプリケーションにアクセス
```
http://localhost:5173
```

## 本番環境へのデプロイ

### バックエンドのデプロイ（Cloudflare Workers）

1. 環境変数の設定
- Cloudflareダッシュボードで環境変数を設定
  - `ZENRIN_API_KEY`
  - `CORS_ALLOWED_ORIGINS`
  - `SUPABASE_URL`
  - `SUPABASE_KEY`

2. デプロイ実行
```bash
cd backend
wrangler deploy
```

### フロントエンドのデプロイ（Cloudflare Pages）

1. ビルド
```bash
cd frontend
pnpm build
```

2. デプロイ
```bash
wrangler pages deploy dist
```

## 使用方法

### 住所検索と法規制情報の表示

1. 検索フォームに住所を入力（例：東京都大田区）
2. 「検索」ボタンをクリック
3. 地図上にピンが表示され、右側に法規制情報が表示されます

### プロジェクト管理

1. プロジェクト一覧画面で「新規プロジェクト」ボタンをクリック
2. プロジェクト情報（名前、所在地、説明など）を入力
3. プロジェクト詳細画面で法規制情報を追加・編集
4. 建築計算機能を使用して建築可能面積などを計算

## 住所検索の制約

住所検索には以下の制約があります：

1. 入力形式
- 都道府県名から入力してください（例：東京都千代田区丸の内1丁目）
- 番地まで入力することで、より正確な位置を特定できます
- 全角・半角どちらでも検索可能です

2. 検索可能な住所
- 日本国内の住所のみ検索可能です
- 建物名での検索はできません
- 郵便番号での検索はできません

## 使用技術

### フロントエンド
- React + TypeScript/JavaScript
- Vite
- Material-UI (MUI)
- React Router
- Leaflet (地図表示)
- Axios (APIリクエスト)
- Formik + Yup (フォームバリデーション)

### バックエンド
- Cloudflare Workers
- Express.js
- Supabase (PostgreSQL)
- itty-router

### インフラ
- Cloudflare Pages (フロントエンド)
- Cloudflare Workers (バックエンド)
- Supabase (データベース)

## 開発時の注意事項

### APIエンドポイント
- 開発環境: `http://localhost:8787`
- 本番環境: `https://legal-api-backend.nagare-0913.workers.dev`

### CORS設定
- 開発環境: `http://localhost:5173`からのリクエストを許可
- 本番環境: `https://legal-api-frontend.pages.dev`からのリクエストを許可

### 環境変数の管理
- 機密情報は`.env`ファイルで管理
- 本番環境の環境変数はCloudflareのダッシュボードで設定

### データベース構造
- プロジェクト（projects）テーブル
- 法令情報（legal_info）テーブル
- 告示文（project_kokuji）テーブル
- 建築計算（building_calculations）テーブル

詳細なデータベース構造は`docs/database-schema.md`を参照してください。

### トラブルシューティング

1. CORS エラー
- 環境変数`CORS_ALLOWED_ORIGINS`が正しく設定されているか確認
- バックエンドのCORS設定を確認

2. API接続エラー
- バックエンドサーバーが起動しているか確認
- 環境変数`VITE_API_URL`が正しく設定されているか確認
- Wranglerが正しくログインしているか確認

3. ビルドエラー
- 依存関係が正しくインストールされているか確認
- Node.jsのバージョンが18.x以上か確認

4. Supabase接続エラー
- Supabaseの認証情報が正しく設定されているか確認
- Supabaseのサービスが稼働しているか確認

## ライセンス

[ライセンス情報を記載]

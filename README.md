# 法規制情報検索アプリケーション

このアプリケーションは、住所から地図表示と法規制情報（用途地域、建蔽率、容積率など）を検索できるウェブアプリケーションです。

## 機能

- 住所検索による地図表示
- 法規制情報の表示
  - 用途地域
  - 防火地域
  - 建蔽率
  - 容積率
  - 建築基準法48条（準備中）
  - 法別表第２（準備中）

## 必要要件

- Node.js (v18.x以上)
- pnpm
- Wrangler CLI (Cloudflare Workers用)
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
```

`frontend/.env`ファイルを作成:
```env
VITE_API_URL=http://localhost:8787
VITE_ZENRIN_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
CORS_ORIGIN=http://localhost:5173
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

1. 検索フォームに住所を入力（例：東京都大田区）
2. 「検索」ボタンをクリック
3. 地図上にピンが表示され、右側に法規制情報が表示されます

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
- React + TypeScript
- Vite
- TailwindCSS
- React Query
- React Router
- Leaflet (地図表示)

### バックエンド
- Cloudflare Workers
- Node.js

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

## ライセンス

[ライセンス情報を記載]

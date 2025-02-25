# デプロイメントガイド

このドキュメントでは、Legal APIプロジェクトのデプロイメント手順と、発生する可能性のある一般的な問題の解決方法について説明します。

## 目次

1. [環境変数の設定](#環境変数の設定)
2. [Cloudflare Workersのデプロイ](#cloudflare-workersのデプロイ)
3. [Cloudflare Pagesのデプロイ](#cloudflare-pagesのデプロイ)
4. [CI/CDの設定](#cicdの設定)
5. [一般的な問題と解決策](#一般的な問題と解決策)

## 環境変数の設定

### バックエンド（Cloudflare Workers）

バックエンドでは以下の環境変数が必要です：

| 環境変数 | 説明 | 設定方法 |
|---------|------|---------|
| `SUPABASE_URL` | SupabaseのURL | `wrangler secret put SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | Supabaseの匿名キー | `wrangler secret put SUPABASE_ANON_KEY` |
| `CORS_ALLOWED_ORIGINS` | CORSで許可するオリジン | `wrangler.toml`の`[vars]`セクション |

#### 環境変数の設定方法

```bash
# 開発環境
wrangler secret put SUPABASE_URL --env development
wrangler secret put SUPABASE_ANON_KEY --env development

# 本番環境
wrangler secret put SUPABASE_URL --env production
wrangler secret put SUPABASE_ANON_KEY --env production
```

`wrangler.toml`での設定例：

```toml
[vars]
CORS_ALLOWED_ORIGINS = "https://legal-api-frontend.pages.dev,http://localhost:5173"
```

### フロントエンド（Vite + React）

フロントエンドでは以下の環境変数が必要です：

| 環境変数 | 説明 |
|---------|------|
| `VITE_API_URL` | バックエンドAPIのURL |
| `VITE_SUPABASE_URL` | SupabaseのURL |
| `VITE_SUPABASE_ANON_KEY` | Supabaseの匿名キー |

#### 環境変数の設定方法

`.env`ファイルを作成：

```
VITE_API_URL=https://legal-api-backend.nagare-0913.workers.dev
VITE_SUPABASE_URL=https://hyjyszrvgygzseqlbxlg.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Cloudflare Workersのデプロイ

### 前提条件

- Node.js 18.x以上
- Wrangler CLI（`npm install -g wrangler`）
- Cloudflareアカウント

### デプロイ手順

1. Cloudflareにログイン：

```bash
wrangler login
```

2. 環境変数の設定（上記参照）

3. デプロイ：

```bash
# 開発環境
wrangler deploy --env development

# 本番環境
wrangler deploy --env production
```

## Cloudflare Pagesのデプロイ

### 手動デプロイ

1. フロントエンドをビルド：

```bash
cd frontend
npm ci
npm run build
```

2. Cloudflareダッシュボードから「Pages」→「Create a project」→「Direct Upload」を選択

3. ビルドしたファイル（`dist`ディレクトリ内）をアップロード

### GitHubとの連携

1. Cloudflareダッシュボードから「Pages」→「Create a project」→「Connect to Git」を選択

2. GitHubリポジトリを接続

3. ビルド設定：
   - ビルドコマンド: `npm run build`
   - ビルド出力ディレクトリ: `dist`
   - ルートディレクトリ: `frontend`

4. 環境変数を設定（上記参照）

## CI/CDの設定

GitHub Actionsを使用してCI/CDを設定しています。

### 必要なシークレット

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で以下のシークレットを設定：

| シークレット名 | 説明 |
|--------------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン |
| `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントID |
| `SUPABASE_URL` | SupabaseのURL |
| `SUPABASE_ANON_KEY` | Supabaseの匿名キー |
| `VITE_API_URL_STAGING` | ステージング環境のAPI URL |
| `VITE_API_URL_PRODUCTION` | 本番環境のAPI URL |
| `VITE_SUPABASE_URL` | フロントエンド用のSupabase URL |
| `VITE_SUPABASE_ANON_KEY` | フロントエンド用のSupabase匿名キー |

## 一般的な問題と解決策

### CORSエラー

#### 症状

ブラウザコンソールに以下のようなエラーが表示される：

```
Access to fetch at 'https://legal-api-backend.nagare-0913.workers.dev/api/v1/projects' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

#### 原因

1. **itty-routerでの非同期処理の問題**：
   Cloudflare Workersでitty-routerを使用する際、非同期処理の扱いに問題があることがあります。特に、`router.handle(request)`が非同期関数を正しく処理できないことがあります。

2. **環境変数の不足**：
   `SUPABASE_URL`や`SUPABASE_ANON_KEY`などの環境変数が設定されていない場合、バックエンドが正常に動作せず、CORSヘッダーが正しく設定されないことがあります。

3. **CORSヘッダーの設定ミス**：
   `Access-Control-Allow-Origin`ヘッダーが正しく設定されていない、または`OPTIONS`リクエスト（プリフライトリクエスト）が正しく処理されていない可能性があります。

#### 解決策

1. **シンプルなルーティング実装に変更**：
   itty-routerを使わずに、シンプルなURL判定とメソッド判定でルーティングを実装することで問題を解決できます。

   ```javascript
   export default {
     async fetch(request, env, ctx) {
       const url = new URL(request.url);
       const path = url.pathname;

       // OPTIONSリクエスト（プリフライト）の処理
       if (request.method === 'OPTIONS') {
         return new Response(null, {
           headers: corsHeaders(request),
           status: 204
         });
       }

       // 各エンドポイントの処理
       if (path === '/api/v1/projects' && request.method === 'GET') {
         // ...
       }
     }
   }
   ```

2. **環境変数の確認**：
   必要な環境変数がすべて設定されていることを確認します。

   ```bash
   wrangler secret list
   ```

3. **CORSヘッダーの正しい設定**：
   すべてのレスポンスに適切なCORSヘッダーを設定します。

   ```javascript
   const corsHeaders = (request) => {
     const allowedOrigins = ['http://localhost:5173', 'https://legal-api-frontend.pages.dev'];
     const origin = request.headers.get('Origin');
     const isAllowed = allowedOrigins.includes(origin);

     return {
       'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
       'Access-Control-Allow-Credentials': 'true',
       'Access-Control-Max-Age': '86400',
     };
   };
   ```

### Cloudflare Workersのデプロイエラー

#### 症状

`wrangler deploy`コマンドを実行すると、以下のようなエラーが表示される：

```
Missing entry-point: The entry-point should be specified via the command line or the `main` config field.
```

#### 解決策

`wrangler.toml`ファイルに`main`フィールドを追加します：

```toml
name = "legal-api-backend"
main = "src/index.js"
compatibility_date = "2025-02-25"
```

また、`compatibility_date`も必要です。これはCloudflare Workersの機能の互換性を保証するために必要な設定です。 
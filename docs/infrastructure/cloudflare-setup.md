# Cloudflareセットアップガイド

このドキュメントでは、Legal APIプロジェクトのCloudflare設定手順について説明します。

## 目次

1. [アカウント設定](#アカウント設定)
2. [Cloudflare Pages設定](#cloudflare-pages設定)
3. [Cloudflare Workers設定](#cloudflare-workers設定)
4. [カスタムドメイン設定](#カスタムドメイン設定)
5. [セキュリティ設定](#セキュリティ設定)

## アカウント設定

### 1. アカウント作成

1. [Cloudflare](https://dash.cloudflare.com/sign-up)でアカウントを作成
2. メール認証を完了
3. 必要に応じて二要素認証を設定

### 2. APIトークンの作成

1. アカウントのプロファイル > "API Tokens"に移動
2. "Create Token"をクリック
3. "Edit Cloudflare Workers"テンプレートを選択
4. 以下の権限を設定：
   - Account Settings: Read
   - Workers Scripts: Edit
   - Workers Routes: Edit

## Cloudflare Pages設定

### 1. プロジェクトの作成

1. Cloudflareダッシュボード > "Workers & Pages"に移動
2. "Create application" > "Pages"を選択
3. "Connect to Git"をクリック
4. GitHubアカウントと連携
5. リポジトリを選択

### 2. ビルド設定

```yaml
Build Configuration:
  Build command: npm run build
  Build output directory: dist
  Root directory: frontend
  Framework preset: Vite
  Node.js version: 18.x
  Package manager: npm

Environment variables:
  Production:
    VITE_SUPABASE_URL: ${SUPABASE_URL}
    VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
    VITE_API_URL: https://legal-api-backend.workers.dev
  
  Preview (Optional):
    VITE_SUPABASE_URL: ${SUPABASE_URL_PREVIEW}
    VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY_PREVIEW}
    VITE_API_URL: https://legal-api-backend-preview.workers.dev
```

### 3. デプロイメント設定

1. 自動デプロイの設定
   - Production branch: main
   - Preview branches: dev, staging
2. プレビュー設定
   - Enable preview deployments
   - Auto-deploy when commits are pushed

## Cloudflare Workers設定

### 1. Wranglerの設定

```bash
# グローバルインストール
npm install -g wrangler

# ログイン
wrangler login

# プロジェクト初期化
cd backend
wrangler init
```

### 2. wrangler.tomlの設定

```toml
name = "legal-api-backend"
main = "src/worker.js"
compatibility_date = "2024-02-21"

[vars]
ENVIRONMENT = "production"

[env.development]
name = "legal-api-backend-dev"
vars = { ENVIRONMENT = "development" }
```

### 3. 環境変数の設定

```bash
# 本番環境
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY

# 開発環境（オプション）
wrangler secret put SUPABASE_URL --env development
wrangler secret put SUPABASE_ANON_KEY --env development
```

## カスタムドメイン設定

### 1. ドメインの追加

1. Cloudflareダッシュボード > "Websites"に移動
2. "Add a Site"をクリック
3. ドメイン名を入力
4. ネームサーバーの設定を更新

### 2. SSL/TLS設定

1. SSL/TLSセクションに移動
2. 暗号化モードを選択：
   - Full
   - Full (Strict) - 推奨
3. エッジ証明書を設定

### 3. DNSレコードの設定

```yaml
# フロントエンド用
Type: CNAME
Name: www
Target: your-project.pages.dev
Proxy status: Proxied

# APIサブドメイン用
Type: CNAME
Name: api
Target: legal-api-backend.workers.dev
Proxy status: Proxied
```

## セキュリティ設定

### 1. WAF（Web Application Firewall）

1. "Security" > "WAF"に移動
2. 以下のルールを設定：
   - OWASP Top 10の保護
   - レートリミット
   - IPレピュテーションフィルタリング

### 2. DDoS保護

1. "Security" > "DDoS"に移動
2. 以下の設定を有効化：
   - HTTP DDoS attack protection
   - Network-layer DDoS attack protection

### 3. アクセス制御

1. "Security" > "WAF" > "Custom Rules"に移動
2. 必要に応じて以下のルールを作成：
   - 特定のIPからのアクセス制限
   - 地域ベースのアクセス制御
   - レートリミット

## モニタリングとアナリティクス

### 1. アナリティクスの設定

1. "Analytics"セクションに移動
2. 以下の項目を監視：
   - トラフィック統計
   - キャッシュパフォーマンス
   - セキュリティイベント

### 2. アラートの設定

1. "Notifications"に移動
2. 以下のアラートを設定：
   - デプロイメント完了/失敗
   - セキュリティイベント
   - パフォーマンス低下

### 3. ログの設定

1. "Workers"セクションでログを有効化
2. 必要に応じてログレベルを設定：
   - Error
   - Warning
   - Info
   - Debug

## パフォーマンス最適化設定

### 1. キャッシュ設定

```yaml
# Pages Rules設定
URL Pattern: /*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours
  - Browser Cache TTL: 1 hour
  - Always Online: On
```

### 2. 画像最適化

1. "Speed" > "Optimization"に移動
2. 以下の設定を有効化：
   - Auto Minify (HTML, CSS, JavaScript)
   - Brotli圧縮
   - 画像最適化
   - Rocket Loader

### 3. ページルール

```yaml
# SPAルート設定
URL Pattern: /*
Settings:
  - Always Use HTTPS: On
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours

# APIエンドポイント設定
URL Pattern: /api/*
Settings:
  - Cache Level: Bypass
  - Security Level: High
```

## 開発環境設定

### 1. ローカル開発

```bash
# Wrangler開発サーバー
wrangler dev

# Pages開発サーバー
npm run dev
```

### 2. プレビュー環境

1. プレビューブランチの設定
```yaml
Preview Branches:
  - dev/*
  - feature/*
  - staging
```

2. 環境変数の分離
```env
# 開発環境
[env.development]
VITE_API_URL=https://dev.api.legal-service.com

# ステージング環境
[env.staging]
VITE_API_URL=https://staging.api.legal-service.com
```

## CI/CD設定

### 1. GitHub Actions連携

```yaml
# .github/workflows/cloudflare-deploy.yml
name: Cloudflare Deploy
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

### 2. デプロイメントフック

1. "Pages" > "Settings" > "Builds & deployments"
2. "Deploy Hooks"セクションで新規フック作成
3. CI/CDパイプラインと連携

## トラブルシューティング

### 1. ビルドエラー対応

1. Node.jsバージョンの確認
```bash
# .nvmrc
v18.x
```

2. 依存関係の確認
```bash
npm ci
npm audit fix
```

### 2. キャッシュ問題

1. キャッシュのパージ
```bash
# 特定URLのキャッシュクリア
wrangler pages deployment tail

# 全キャッシュのパージ
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
     -H "Authorization: Bearer {api_token}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
```

## セキュリティ強化設定

### 1. WAFカスタムルール

```lua
# レートリミット
(http.request.uri.path contains "/api/") and (rate_limit("10s", 100))

# 地域制限
not (ip.geoip.country in {"JP", "US"})

# 不正アクセス防止
(http.request.uri.path contains "/admin/") and (not http.request.headers["CF-IPCountry"]=="JP")
```

### 2. セキュリティヘッダー

```yaml
# カスタムヘッダー設定
Security Headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: max-age=31536000; includeSubDomains
  - Content-Security-Policy: default-src 'self'
```

## 参考リンク

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/security)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/) 
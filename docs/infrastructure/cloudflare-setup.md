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

## 参考リンク

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/security)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/) 
# メンテナンスとモニタリングガイド

このドキュメントでは、Legal APIプロジェクトのデプロイ後のメンテナンスとモニタリングについて説明します。

## 目次

1. [定期的なメンテナンス](#定期的なメンテナンス)
2. [モニタリング](#モニタリング)
3. [バックアップと復旧](#バックアップと復旧)
4. [セキュリティ対策](#セキュリティ対策)
5. [パフォーマンス最適化](#パフォーマンス最適化)

## 定期的なメンテナンス

### 1. 依存パッケージの更新

```bash
# フロントエンド
cd frontend
npm outdated  # 更新可能なパッケージの確認
npm update    # パッケージの更新
npm audit     # セキュリティ監査

# バックエンド
cd backend
npm outdated
npm update
npm audit
```

### 2. 環境変数の確認

1. Cloudflare Pages
   - 環境変数の有効期限確認
   - シークレットの更新

2. Cloudflare Workers
   ```bash
   # 環境変数の一覧表示
   wrangler secret list
   
   # 環境変数の更新
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY
   ```

### 3. デプロイメントの確認

```bash
# フロントエンド（Cloudflare Pages）
- デプロイメント履歴の確認
- ビルドログの確認
- プレビュー環境の動作確認

# バックエンド（Cloudflare Workers）
wrangler tail  # ログの確認
```

## モニタリング

### 1. パフォーマンスモニタリング

#### フロントエンド
- ページロード時間
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

#### バックエンド
- APIレスポンスタイム
- エラーレート
- CPU使用率
- メモリ使用率

### 2. エラー監視

```javascript
// フロントエンドのエラー監視
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // エラー報告ロジック
});

// バックエンドのエラー監視
try {
  // 処理
} catch (error) {
  console.error('API error:', error);
  // エラー報告ロジック
}
```

### 3. アクセス分析

Cloudflareダッシュボードで確認できる項目：
- ページビュー数
- ユニークビジター数
- 地域別アクセス統計
- デバイス別アクセス統計

## バックアップと復旧

### 1. データベースバックアップ

```sql
-- Supabaseバックアップの確認
SELECT
  backup_id,
  created_at,
  status
FROM
  supabase_backups
ORDER BY
  created_at DESC;
```

### 2. コードバックアップ

```bash
# GitHubへのバックアップ
git add .
git commit -m "backup: yyyy-mm-dd"
git push origin main

# タグの作成
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

### 3. 復旧手順

1. コードの復旧
```bash
git checkout v1.0.0  # 特定バージョンに戻る
```

2. データベースの復旧
- Supabaseダッシュボードからリストア
- バックアップポイントの選択

## セキュリティ対策

### 1. 定期的なセキュリティスキャン

```bash
# 依存パッケージの脆弱性スキャン
npm audit

# コードの静的解析
npm run lint
```

### 2. アクセス制御の確認

1. Cloudflare WAFルールの確認
2. レートリミットの設定確認
3. IPアクセス制限の確認

### 3. SSL/TLS証明書の管理

- 証明書の有効期限確認
- 暗号化設定の確認
- セキュリティヘッダーの確認

## パフォーマンス最適化

### 1. フロントエンド最適化

```javascript
// ビルド設定の最適化（vite.config.js）
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // その他の依存関係
        }
      }
    }
  }
});
```

### 2. バックエンド最適化

```javascript
// キャッシュ設定
const cache = new Map();

async function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetchData(key);
  cache.set(key, data);
  return data;
}
```

### 3. CDN最適化

Cloudflare設定：
- キャッシュルールの設定
- エッジキャッシュの設定
- ブラウザキャッシュの設定

## 監視メトリクス

### 1. アプリケーションメトリクス

| メトリクス | 閾値 | アラート条件 |
|------------|------|--------------|
| ページロード時間 | < 3秒 | > 5秒 |
| APIレスポンス時間 | < 1秒 | > 2秒 |
| エラーレート | < 0.1% | > 1% |
| CPU使用率 | < 70% | > 90% |

### 2. インフラメトリクス

| メトリクス | 閾値 | アラート条件 |
|------------|------|--------------|
| メモリ使用率 | < 80% | > 90% |
| ディスク使用率 | < 80% | > 90% |
| ネットワークレイテンシー | < 100ms | > 200ms |
| SSL/TLS有効期限 | > 30日 | < 14日 |

## 参考リンク

- [Cloudflare Analytics](https://developers.cloudflare.com/analytics/)
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/metrics)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/) 
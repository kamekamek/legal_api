# 告示文API実装計画

## 概要
告示文を取得するAPIを実装し、フロントエンドに表示する機能を追加します。

## 現在のバックエンド構成
- Express.jsを使用したRESTful API
- 主な依存関係:
  - express
  - cors
  - axios
  - dotenv
- 既存のエラーハンドリング関数 `handleApiError` を活用

## API仕様

### エンドポイント
- GET `/api/kokuji/{kokuji_id}`

### リクエストパラメータ
- `kokuji_id`: 告示ID（例：412K500040001453）

### レスポンス
```json
{
  "status": "success",
  "data": {
    "kokuji_text": "告示文の内容",
    "kokuji_id": "412K500040001453",
    "updated_at": "2025-02-17T23:45:21+09:00"
  }
}
```

## 実装手順

### バックエンド（Express.js）
1. 新しいAPIエンドポイントの追加
```javascript
app.get('/api/kokuji/:kokuji_id', async (req, res) => {
  try {
    const { kokuji_id } = req.params;
    const response = await axios.get(
      `https://kokujiapi.azurewebsites.net/api/v1/getKokuji`,
      {
        params: {
          kokuji_id,
          response_format: 'plain'
        },
        headers: {
          'accept': 'application/xml'
        }
      }
    );
    res.json({
      status: 'success',
      data: {
        kokuji_text: response.data,
        kokuji_id,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    const { statusCode, message } = handleApiError(error, '告示文の取得に失敗しました');
    res.status(statusCode).json({ error: message });
  }
});
```

2. エラーハンドリング
   - 既存の `handleApiError` 関数を活用
   - 告示文API特有のエラーケースの追加

3. 環境変数の追加（必要に応じて）
   - KOKUJI_API_URL
   - KOKUJI_API_KEY（認証が必要な場合）

### フロントエンド
1. API呼び出し用のカスタムフック作成
```javascript
const useKokujiText = (kokujiId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 実装詳細
  }, [kokujiId]);

  return { data, loading, error };
};
```

2. UIコンポーネントの更新
   - 告示文表示用のコンポーネント
   - ローディングインジケータ
   - エラーメッセージ表示

## セキュリティ考慮事項
- 既存のCORS設定を活用
- レート制限の実装（必要に応じて）
- エラーメッセージでの機密情報の非表示

## テスト計画
1. ユニットテスト
   - API呼び出し処理
   - エラーハンドリング
2. 統合テスト
   - エンドポイントのテスト
   - フロントエンド・バックエンド間の連携
3. E2Eテスト
   - ユーザーフローの確認

## デプロイメント
- 既存のデプロイメントプロセスに従う
- 環境変数の更新
- APIドキュメントの更新

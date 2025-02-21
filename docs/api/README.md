# API仕様書

このディレクトリには、Legal APIプロジェクトのAPI仕様に関するドキュメントが含まれています。

## ファイル構成

- `api-spec.md` - API仕様の詳細
- `endpoints/` - 各エンドポイントの詳細仕様
- `schemas/` - リクエスト/レスポンススキーマ
- `examples/` - APIリクエスト/レスポンスの例

## API概要

Legal APIは以下の主要機能を提供します：

1. プロジェクト管理API
2. 用途地域検索API
3. 法的チェックAPI
4. ドキュメント生成API

## エンドポイント一覧

| エンドポイント | メソッド | 説明 |
|----------------|----------|------|
| `/api/projects` | GET | プロジェクト一覧の取得 |
| `/api/projects/:id` | GET | プロジェクト詳細の取得 |
| `/api/zone-search` | GET | 用途地域の検索 |

## 認証

- Bearer認証を使用
- JWTトークンベース
- Supabase認証と連携

## エラーハンドリング

標準エラーレスポンス形式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  }
}
```

## バージョニング

APIバージョニングは以下の形式で行います：
`/api/v1/...`

## レート制限

- 認証済み：100リクエスト/分
- 未認証：10リクエスト/分

## 参考リンク

- [API仕様書](./api-spec.md)
- [OpenAPI仕様](./openapi.yaml)
- [Postmanコレクション](./postman/) 
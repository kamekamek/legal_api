# API仕様書

## 法令情報 API

### プロジェクトの法令情報を取得

```
GET /api/v1/projects/:id/legal-info
```

#### パラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| id | string | ○ | プロジェクトID |

#### レスポンス
```json
{
  "status": "success",
  "data": {
    "type": "string",           // 用途地域タイプ
    "fireArea": "string",       // 防火地域
    "buildingCoverageRatio": "number",  // 建蔽率
    "buildingCoverageRatio2": "number", // 建蔽率（制限値）
    "floorAreaRatio": "number",         // 容積率
    "heightDistrict": "string",         // 高度地区
    "heightDistrict2": "string",        // 高度地区（制限値）
    "zoneMap": "string",                // 区域区分
    "scenicZoneName": "string",         // 風致地区名
    "scenicZoneType": "string",         // 風致地区種別
    "article48": "string",              // 建築基準法48条
    "appendix2": "string",              // 法別表第２
    "safetyOrdinance": "string"         // 東京都建築安全条例
  }
}
```

### プロジェクトの法令情報を更新

```
PUT /api/v1/projects/:id/legal-info
```

#### パラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| id | string | ○ | プロジェクトID |

#### リクエストボディ
```json
{
  "type": "string",           // 用途地域タイプ
  "fireArea": "string",       // 防火地域
  "buildingCoverageRatio": "number",  // 建蔽率
  "buildingCoverageRatio2": "number", // 建蔽率（制限値）
  "floorAreaRatio": "number",         // 容積率
  "heightDistrict": "string",         // 高度地区
  "heightDistrict2": "string",        // 高度地区（制限値）
  "zoneMap": "string",                // 区域区分
  "scenicZoneName": "string",         // 風致地区名
  "scenicZoneType": "string",         // 風致地区種別
  "article48": "string",              // 建築基準法48条
  "appendix2": "string",              // 法別表第２
  "safetyOrdinance": "string"         // 東京都建築安全条例
}
```

#### レスポンス
```json
{
  "status": "success",
  "data": {
    // 更新された法令情報（リクエストボディと同じ構造）
  }
}
```

## エラーレスポンス

```json
{
  "status": "error",
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### エラーコード
| コード | 説明 |
|--------|------|
| 400 | 不正なリクエスト |
| 404 | プロジェクトが見つかりません |
| 500 | サーバーエラー |

## 実装計画

### バックエンド実装（Express.js）

1. データベーススキーマの更新
   - `legal_info` テーブルの作成
   - プロジェクトとの関連付け

2. モデルの実装
   ```javascript
   // models/LegalInfo.js
   class LegalInfo {
     static async findByProjectId(projectId) { ... }
     static async updateByProjectId(projectId, data) { ... }
   }
   ```

3. ルーターの実装
   ```javascript
   // routes/legalInfo.js
   router.get('/projects/:id/legal-info', getLegalInfo);
   router.put('/projects/:id/legal-info', updateLegalInfo);
   ```

4. コントローラーの実装
   ```javascript
   // controllers/legalInfo.js
   const getLegalInfo = async (req, res) => { ... }
   const updateLegalInfo = async (req, res) => { ... }
   ```

5. バリデーションの実装
   - リクエストデータの検証
   - 型チェック
   - 必須項目チェック

### フロントエンド連携

1. APIクライアントの実装
   ```javascript
   // services/legalInfoApi.js
   export const fetchLegalInfo = async (projectId) => { ... }
   export const updateLegalInfo = async (projectId, data) => { ... }
   ```

2. コンポーネントの更新
   - ProjectDetail.jsxでの法令情報表示
   - ZoneSearch.jsxでの保存機能連携

### テスト実装

1. ユニットテスト
   - モデルのテスト
   - コントローラーのテスト
   - バリデーションのテスト

2. 統合テスト
   - APIエンドポイントのテスト
   - データベース連携のテスト

3. E2Eテスト
   - フロントエンドからバックエンドまでの一連の流れのテスト

### デプロイ計画

1. データベースマイグレーション
   - 新しいテーブルの作成
   - 既存データの移行

2. APIのデプロイ
   - ステージング環境でのテスト
   - 本番環境への段階的なデプロイ

3. モニタリング
   - エラーログの監視
   - パフォーマンスの監視

## 告示文 API

### 告示文を取得

```
GET /api/v1/kokuji/:kokujiId
```

#### パラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| kokujiId | string | ○ | 告示ID（例: 412K500040001453） |

#### レスポンス
```json
{
  "status": "success",
  "data": {
    "kokuji_id": "string",      // 告示ID
    "kokuji_text": "string",    // 告示文本文
    "effective_date": "string", // 施行日
    "title": "string",         // 告示タイトル
    "category": "string",      // 告示区分
    "related_laws": [         // 関連法令
      {
        "law_name": "string",
        "article": "string"
      }
    ]
  }
}
```

### プロジェクトの告示文一覧を取得

```
GET /api/v1/projects/:id/kokuji
```

#### パラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| id | string | ○ | プロジェクトID |

#### レスポンス
```json
{
  "status": "success",
  "data": [
    {
      "kokuji_id": "string",
      "title": "string",
      "effective_date": "string",
      "category": "string"
    }
  ]
}
```

### プロジェクトに告示文を関連付け

```
POST /api/v1/projects/:id/kokuji
```

#### パラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| id | string | ○ | プロジェクトID |

#### リクエストボディ
```json
{
  "kokuji_id": "string",    // 告示ID
  "memo": "string"          // メモ（任意）
}
```

#### レスポンス
```json
{
  "status": "success",
  "data": {
    "kokuji_id": "string",
    "title": "string",
    "effective_date": "string",
    "category": "string",
    "memo": "string"
  }
}
```

### データベーススキーマ

```sql
-- 告示文テーブル
CREATE TABLE kokuji (
    id SERIAL PRIMARY KEY,
    kokuji_id VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    kokuji_text TEXT NOT NULL,
    effective_date DATE,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- プロジェクトと告示文の関連テーブル
CREATE TABLE project_kokuji (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    kokuji_id VARCHAR(100) REFERENCES kokuji(kokuji_id),
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, kokuji_id)
);
```

### モデルの実装

```javascript
// models/Kokuji.js
class Kokuji {
  static async findById(kokujiId) { ... }
  static async findByProjectId(projectId) { ... }
  static async addToProject(projectId, kokujiId, memo) { ... }
}
```

### バリデーション

1. 告示IDのフォーマット検証
   - 正規表現: `^412[A-Z][0-9]{12}$`
   - 例: "412K500040001453"

2. 必須項目チェック
   - kokuji_id
   - title
   - kokuji_text

3. 日付フォーマット検証
   - effective_date: YYYY-MM-DD

### エラーハンドリング

1. 告示文が見つからない場合
   ```json
   {
     "status": "error",
     "error": {
       "code": "KOKUJI_NOT_FOUND",
       "message": "指定された告示文が見つかりません"
     }
   }
   ```

2. 不正な告示ID
   ```json
   {
     "status": "error",
     "error": {
       "code": "INVALID_KOKUJI_ID",
       "message": "不正な告示IDです"
     }
   }
   ```

### フロントエンド連携

1. 告示文表示コンポーネント
   ```javascript
   // components/KokujiDialog.jsx
   const KokujiDialog = ({ kokujiId, open, onClose }) => {
     // 告示文の取得と表示
   };
   ```

2. APIクライアント
   ```javascript
   // services/kokujiApi.js
   export const fetchKokuji = async (kokujiId) => { ... }
   export const fetchProjectKokuji = async (projectId) => { ... }
   export const addKokujiToProject = async (projectId, kokujiId, memo) => { ... }
   ``` 
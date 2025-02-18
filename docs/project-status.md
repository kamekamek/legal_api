# Legal API プロジェクト状況

## 1. プロジェクト概要
法令情報管理システムの開発プロジェクト。Zenrin Maps APIを活用した地図ベースの法令情報検索と、プロジェクト管理機能を統合したシステム。

## 2. システム構成
### フロントエンド（React）
- `frontend/`
  - `src/features/` - 機能モジュール
  - `src/components/` - 共通コンポーネント
  - `src/services/` - APIサービス
  - `src/pages/` - ページコンポーネント
  - `src/hooks/` - カスタムフック
  - `src/utils/` - ユーティリティ関数

### バックエンド（Express）
- `backend/`
  - `src/` - ソースコード
  - `tests/` - テストコード
  - `e2e/` - E2Eテスト
  - `config/` - 設定ファイル

## 3. 実装状況

### 3.1 実装済み機能 
1. **地図表示基本機能**
   - Zenrin Maps APIによる地図表示
   - 地点選択機能
   - 用途地域情報の表示
   - 住所検索機能
   - 法令情報の自動取得
   - 地図表示の最適化（キャッシュ機能）
   - エラーハンドリングとリトライ機能
   - ヘルプ機能

2. **プロジェクト管理基本機能**
   - プロジェクトCRUD操作
   - プロジェクト一覧表示
   - プロジェクト詳細表示
     - 基本情報の表示（名前、所在地、期間、説明）
     - プロジェクトステータス表示
     - 編集・削除機能
     - 地図検索への遷移
   - 基本情報の編集

3. **バックエンド基盤**
   - Express APIサーバー
   - 用途地域情報取得API
   - 告示文取得API
   - CORSとエラーハンドリング

4. **フロントエンドUI基盤**
   - Material-UIによるコンポーネント
   - レスポンシブ対応の基本構造
   - エラーハンドリング

### 3.2 開発中の機能 
1. **プロジェクト管理機能の拡張**
   - プロジェクト詳細画面の拡充
     - 法令情報の表示機能の改善
       - 建ぺい率・容積率の表示
       - 高度地区情報の表示
       - 用途地域情報の表示
     - 法令情報の編集機能の拡充
       - 規制値の直接編集
       - 告示情報の編集
     - 地図連携機能の強化
   - プロジェクトステータス管理
   - 検索・フィルタリング機能

2. **法令アップデート通知機能**
   - 法令データベース連携
   - 更新通知機能
   - 検索・参照機能

3. **法令チェックリスト機能**
   - チェックリスト基本UI
   - ステータス管理機能

### 3.3 今後の実装予定 
1. **法令チェックリスト機能の拡充**
   - プロジェクト情報に基づく自動生成
   - 進捗管理機能
   - レポート機能

2. **テスト拡充**
   - 統合テストの追加
   - E2Eテストシナリオの拡充
   - パフォーマンステスト

## 4. データベース設計

```sql
-- プロジェクト管理
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    scale VARCHAR(100),
    usage_type VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 法令文書
CREATE TABLE legal_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    location TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用途地域情報
CREATE TABLE zone_info (
    id SERIAL PRIMARY KEY,
    legal_document_id INTEGER REFERENCES legal_documents(id),
    zone_type VARCHAR(100) NOT NULL,
    regulations JSONB NOT NULL,
    coverage_ratio FLOAT,
    floor_area_ratio FLOAT,
    height_restrictions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 告示情報
CREATE TABLE kokuji_info (
    id SERIAL PRIMARY KEY,
    legal_document_id INTEGER REFERENCES legal_documents(id),
    kokuji_id VARCHAR(100) NOT NULL,
    kokuji_text TEXT NOT NULL,
    effective_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 法令更新情報
CREATE TABLE legal_updates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    law_type VARCHAR(100),
    update_date TIMESTAMP,
    effective_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用途地域情報
CREATE TABLE zoning_info (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    zone_type VARCHAR(100),
    coordinates JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- チェックリスト
CREATE TABLE checklists (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- チェックリスト項目
CREATE TABLE checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER REFERENCES checklists(id),
    content TEXT NOT NULL,
    status VARCHAR(50),
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API設計

```markdown
# API Endpoints

## プロジェクト管理 API
GET    /api/v1/projects           # プロジェクト一覧取得
POST   /api/v1/projects           # プロジェクト作成
GET    /api/v1/projects/:id       # プロジェクト詳細取得
PUT    /api/v1/projects/:id       # プロジェクト更新
DELETE /api/v1/projects/:id       # プロジェクト削除

## 法令情報 API
POST   /api/v1/projects/:id/legal-docs     # 法令情報保存
GET    /api/v1/projects/:id/legal-docs     # プロジェクトの法令情報一覧取得
GET    /api/v1/legal-docs/:id              # 法令情報詳細取得
PUT    /api/v1/legal-docs/:id              # 法令情報更新
DELETE /api/v1/legal-docs/:id              # 法令情報削除
PATCH  /api/v1/legal-docs/:id/regulations  # 規制情報の部分更新
PATCH  /api/v1/legal-docs/:id/kokuji       # 告示情報の部分更新

## 用途地域 API
GET    /api/v1/zoning/search      # 用途地域検索
GET    /api/v1/zoning/:id/details # 用途地域詳細取得

## 法令アップデート API
GET    /api/v1/legal-updates              # 法令更新情報一覧取得
GET    /api/v1/legal-updates/:id          # 法令更新詳細取得
GET    /api/v1/legal-updates/unread       # 未読の法令更新取得
PUT    /api/v1/legal-updates/:id/read     # 既読マーク付与

## チェックリスト API
GET    /api/v1/projects/:id/checklists    # プロジェクトのチェックリスト取得
POST   /api/v1/projects/:id/checklists    # チェックリスト作成
PUT    /api/v1/checklists/:id             # チェックリスト更新
GET    /api/v1/checklists/:id/items       # チェックリスト項目取得
POST   /api/v1/checklists/:id/items       # チェックリスト項目追加
PUT    /api/v1/checklist-items/:id        # チェックリスト項目更新
```

## 6. 今後の開発計画

### 6.1 短期目標（1-2週間）
1. プロジェクト管理機能の完成
   - プロジェクト詳細画面の実装
     - 法令情報一覧コンポーネントの作成
     - 編集フォームの実装
     - 地図連携機能の統合
   - 検索・フィルタリング機能の実装

2. テストカバレッジの向上
   - コンポーネントテストの追加
   - API統合テストの実装

### 6.2 中期目標（1-2ヶ月）
1. 法令アップデート通知機能の実装
   - 法令データベース連携の完成
   - 通知システムの実装
   - ユーザー設定機能の追加

2. チェックリスト機能の拡充
   - 自動生成機能の実装
   - 進捗管理機能の実装
   - レポート機能の実装

### 6.3 長期目標（3-6ヶ月）
1. システム全体の最適化
   - パフォーマンス改善
   - UI/UXの改善
   - セキュリティ強化

2. 追加機能の実装
   - ユーザー管理・認証システム
   - データ分析・レポート機能
   - API機能の拡充 

# 実装優先順位と計画

## 1. プロジェクト管理機能 (Phase 1)

### 1.1 基本機能
- プロジェクトCRUD操作
  - [] プロジェクト一覧表示
  - [ ] プロジェクト作成
  - [ ] プロジェクト詳細表示
  - [ ] プロジェクト編集
  - [ ] プロジェクト削除

### 1.2 プロジェクト情報管理
- [ ] 基本情報管理
  - プロジェクト名
  - 所在地
  - 規模
  - 用途
- [ ] ステータス管理
  - 計画中
  - 申請中
  - 完了
- [ ] ドキュメント管理
  - 文書アップロード
  - バージョン管理
  - 履歴参照

### 1.3 UI/UX
- [ ] プロジェクトダッシュボード
- [ ] プロジェクト進捗表示
- [ ] レスポンシブ対応

## 2. 法令アップデート通知機能 (Phase 2)

### 2.1 法令データベース連携
- [ ] 法令情報の取得・保存
  - 建築基準法
  - 消防法
  - 都市計画法
  - 各地方自治体の条例

### 2.2 更新通知機能
- [ ] ポータルサイト形式のUI
  - チェックマーク付きUI
  - 未読/既読管理
- [ ] 通知設定
  - メール通知
  - アプリ内通知

### 2.3 検索・参照機能
- [ ] 法令検索機能
- [ ] 検索履歴管理
- [ ] お気に入り登録

## 3. 法令チェックリスト機能 (Phase 3)

### 3.1 チェックリスト生成
- [ ] プロジェクト情報に基づく自動生成
  - 必要書類リスト
  - 法的要件リスト
- [ ] カスタムチェックリスト作成

### 3.2 進捗管理
- [ ] ステータス管理
  - 未着手
  - 進行中
  - 完了
  - 要確認
- [ ] 期限管理
- [ ] アラート機能

### 3.3 レポート機能
- [ ] 進捗レポート生成
- [ ] エクスポート機能

## データベース設計

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

## API設計

```markdown
# API Endpoints

## プロジェクト管理 API
GET    /api/v1/projects           # プロジェクト一覧取得
POST   /api/v1/projects           # プロジェクト作成
GET    /api/v1/projects/:id       # プロジェクト詳細取得
PUT    /api/v1/projects/:id       # プロジェクト更新
DELETE /api/v1/projects/:id       # プロジェクト削除

## 法令アップデート API
GET    /api/v1/legal-updates              # 法令更新情報一覧取得
GET    /api/v1/legal-updates/:id          # 法令更新詳細取得
GET    /api/v1/legal-updates/unread       # 未読の法令更新取得
PUT    /api/v1/legal-updates/:id/read     # 既読マーク付与

## チェックリスト API
GET    /api/v1/projects/:id/checklists           # プロジェクトのチェックリスト取得
POST   /api/v1/projects/:id/checklists           # チェックリスト作成
PUT    /api/v1/checklists/:id                    # チェックリスト更新
GET    /api/v1/checklists/:id/items              # チェックリスト項目取得
POST   /api/v1/checklists/:id/items              # チェックリスト項目追加
PUT    /api/v1/checklist-items/:id               # チェックリスト項目更新

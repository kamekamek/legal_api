# 実装優先順位と計画

## 1. プロジェクト管理機能 (Phase 1)

### 1.1 基本機能 ✅
- プロジェクトCRUD操作
  - ✅ プロジェクト一覧表示
    - 単体テスト: コンポーネントテスト
    - E2Eテスト: 一覧表示・ソート・フィルター機能
  - ✅ プロジェクト作成
    - 単体テスト: フォームバリデーション
    - E2Eテスト: プロジェクト作成フロー

### 1.2 詳細機能と編集 🚧
- プロジェクト詳細・編集機能
  - ✅ 詳細表示ページ
    - プロジェクト情報の表示
    - ステータス表示
    - 単体テスト: 表示ロジック
  - ✅ 編集機能
    - 編集フォーム（ProjectFormの再利用）
    - APIとの連携
    - バリデーション
    - 単体テスト: 更新ロジック
  - ✅ 削除機能
    - 削除確認ダイアログ
    - API連携
    - 単体テスト: 削除ロジック

### 1.3 拡張機能 📝
- [ ] プロジェクトステータス管理
  - ステータス更新UI
  - ステータス遷移ロジック
  - バリデーション
  - テスト: ステータス遷移テスト

- [ ] 検索・フィルタリング機能
  - 検索バー実装
  - フィルターコンポーネント
  - APIとの連携
  - テスト: 検索・フィルター機能

### 1.4 UI/UX改善 ✅
- ✅ レスポンシブデザイン最適化
  - モバイル対応
  - タブレット対応
  - 画面サイズ別レイアウト

## 2. 法令アップデート通知機能 (Phase 2)

### 2.1 法令データベース連携 🚧
- ✅ 法令情報の取得・保存
  - ✅ 建築基準法
  - ✅ 用途地域情報
  - ✅ 高さ制限情報
  - [ ] 消防法
  - [ ] 都市計画法
  - [ ] 各地方自治体の条例
- ✅ 用途検索機能の実装
  - ✅ 用途地域による検索
  - ✅ 建物用途による検索
  - ✅ 高さ制限の確認
- 🚧 プロジェクト管理との連携
  - [ ] プロジェクト詳細への法令情報表示
  - [ ] 用途地域情報の自動連携
  - [ ] 建物用途による制限の自動チェック

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

## 4. テスト拡充 🚧

### 4.1 フロントエンドテスト
- ✅ コンポーネントテスト
  - ✅ ProjectList
  - ✅ ProjectForm
  - ✅ ProjectDetail
  - [ ] 共通コンポーネント

### 4.2 統合テスト
- 🚧 APIとの連携テスト
- [ ] ルーティングテスト
- [ ] 状態管理テスト

### 4.3 E2Eテスト
- [ ] プロジェクト管理フロー
- [ ] エラーハンドリング
- [ ] ユーザー操作シナリオ

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

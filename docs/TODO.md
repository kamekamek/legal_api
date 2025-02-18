# TODO リスト

## 告示文機能の実装

現在の実装では、固定の告示ID（412K500040001453）を使用しています。今後、以下の機能を実装する必要があります：

### 優先度: 高
- [ ] 用途地域に応じた告示IDの動的取得
  - 用途地域APIのレスポンスに告示IDを含める
  - 地点ごとに適切な告示IDを返却する仕組みの実装

### 優先度: 中
- [ ] 告示文の検索機能
  - キーワードによる告示文検索
  - 地域による告示文検索
- [ ] 告示文の履歴管理
  - 改正前の告示文の表示
  - 改正履歴の表示

### 優先度: 低
- [ ] 告示文のPDFダウンロード機能
- [ ] 告示文の印刷機能
- [ ] お気に入りの告示文保存機能

## データベース設計

### 告示文テーブル
```sql
CREATE TABLE kokuji (
  id VARCHAR(20) PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_date DATE NOT NULL,
  updated_date DATE,
  area_code VARCHAR(10),
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true
);
```

### 用途地域-告示文紐付けテーブル
```sql
CREATE TABLE zone_kokuji_mapping (
  id SERIAL PRIMARY KEY,
  zone_type VARCHAR(10),
  area_code VARCHAR(10),
  kokuji_id VARCHAR(20) REFERENCES kokuji(id),
  valid_from DATE,
  valid_to DATE
);
```

## API設計

### 告示文取得API
```
GET /api/kokuji/:kokuji_id
```

### 告示文検索API
```
GET /api/kokuji/search
Query Parameters:
- keyword: string
- area: string
- category: string
- from_date: date
- to_date: date
```

### 用途地域に基づく告示文取得API
```
GET /api/kokuji/by-zone
Query Parameters:
- zone_type: string
- lat: number
- lng: number
```

## 技術的な検討事項
1. 告示文データの効率的な保存方法
2. 全文検索の実装方法
3. 地理空間データとの連携方法
4. キャッシュ戦略
5. データ更新の仕組み

## その他の改善点
- [ ] エラーハンドリングの強化
- [ ] パフォーマンスの最適化
- [ ] ユーザーインターフェースの改善
- [ ] アクセシビリティの向上
- [ ] セキュリティ対策の強化 
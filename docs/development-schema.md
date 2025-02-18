# 開発中機能のスキーマ設計

## 1. プロジェクト管理機能の拡張

### 1.1 プロジェクトステータス管理

```mermaid
erDiagram
    Project ||--o{ ProjectStatus : has
    Project ||--o{ LegalInfo : contains
    ProjectStatus ||--o{ StatusHistory : tracks
    
    Project {
        int id PK
        string name
        string location
        string scale
        string usage_type
        timestamp created_at
        timestamp updated_at
    }
    
    ProjectStatus {
        int id PK
        int project_id FK
        string status
        string description
        timestamp effective_from
        timestamp created_at
    }
    
    StatusHistory {
        int id PK
        int status_id FK
        string old_status
        string new_status
        string change_reason
        timestamp changed_at
    }
    
    LegalInfo {
        int id PK
        int project_id FK
        string zone_type
        json regulations
        timestamp updated_at
    }
```

### 1.2 検索・フィルタリング機能

```mermaid
graph TD
    A[検索入力] --> B{検索タイプ}
    B -->|プロジェクト検索| C[プロジェクト名]
    B -->|ステータス検索| D[ステータス]
    B -->|地域検索| E[地域]
    B -->|用途検索| F[用途地域]
    
    C --> G[検索結果]
    D --> G
    E --> G
    F --> G
    
    G --> H[フィルタリング]
    H --> I[ソート]
    H --> J[ステータスフィルタ]
    H --> K[日付フィルタ]
```

## 2. 法令アップデート通知機能

### 2.1 データベース構造

```mermaid
erDiagram
    LegalUpdate ||--o{ NotificationQueue : generates
    NotificationQueue ||--o{ UserNotification : creates
    Project }|--o{ LegalUpdate : affects
    
    LegalUpdate {
        int id PK
        string title
        text content
        string law_type
        timestamp update_date
        timestamp effective_date
    }
    
    NotificationQueue {
        int id PK
        int update_id FK
        string status
        timestamp scheduled_at
        timestamp processed_at
    }
    
    UserNotification {
        int id PK
        int queue_id FK
        int project_id FK
        string status
        timestamp read_at
    }
```

### 2.2 通知フロー

```mermaid
sequenceDiagram
    participant DB as 法令DB
    participant S as 通知サービス
    participant Q as 通知キュー
    participant U as ユーザー
    
    DB->>S: 法令更新検知
    S->>Q: 通知生成
    Q->>S: 通知処理開始
    S->>U: 通知送信
    U->>S: 既読マーク
    S->>Q: ステータス更新
```

## 3. 法令チェックリスト機能

### 3.1 データモデル

```mermaid
erDiagram
    Project ||--o{ Checklist : has
    Checklist ||--o{ ChecklistItem : contains
    ChecklistItem ||--o{ ItemStatus : tracks
    
    Checklist {
        int id PK
        int project_id FK
        string title
        text description
        timestamp due_date
        string status
    }
    
    ChecklistItem {
        int id PK
        int checklist_id FK
        string content
        string category
        boolean is_required
        timestamp due_date
    }
    
    ItemStatus {
        int id PK
        int item_id FK
        string status
        text notes
        timestamp updated_at
    }
```

### 3.2 ステータス管理フロー

```mermaid
stateDiagram-v2
    [*] --> 未着手
    未着手 --> 進行中
    進行中 --> 確認待ち
    確認待ち --> 完了
    確認待ち --> 要修正
    要修正 --> 進行中
    完了 --> [*]
```

## 4. API設計

### 4.1 プロジェクト管理API

```mermaid
sequenceDiagram
    participant C as クライアント
    participant A as API
    participant DB as データベース
    
    C->>A: プロジェクト情報取得
    A->>DB: クエリ実行
    DB-->>A: 結果返却
    A-->>C: レスポンス
    
    C->>A: ステータス更新
    A->>DB: ステータス保存
    DB-->>A: 更新確認
    A-->>C: 更新完了通知
```

### 4.2 通知API

```mermaid
sequenceDiagram
    participant C as クライアント
    participant A as API
    participant N as 通知サービス
    
    C->>A: 通知一覧取得
    A->>N: 未読通知確認
    N-->>A: 通知リスト
    A-->>C: レスポンス
    
    C->>A: 既読マーク
    A->>N: 既読状態更新
    N-->>A: 更新確認
    A-->>C: 更新完了通知
```

## 5. 法令情報保存機能

### 5.1 データベース構造

```mermaid
erDiagram
    Project ||--o{ LegalDocument : contains
    LegalDocument ||--o{ ZoneInfo : has
    LegalDocument ||--o{ KokujiInfo : references
    
    LegalDocument {
        int id PK
        int project_id FK
        string location
        float latitude
        float longitude
        timestamp created_at
        timestamp updated_at
    }
    
    ZoneInfo {
        int id PK
        int legal_document_id FK
        string zone_type
        json regulations
        float coverage_ratio
        float floor_area_ratio
        json height_restrictions
        timestamp created_at
    }
    
    KokujiInfo {
        int id PK
        int legal_document_id FK
        string kokuji_id
        text kokuji_text
        date effective_date
        timestamp created_at
    }
```

### 5.2 API設計

```mermaid
sequenceDiagram
    participant C as クライアント
    participant A as API
    participant DB as データベース
    
    C->>A: 法令情報保存リクエスト
    Note right of C: POST /api/v1/projects/:id/legal-docs
    
    A->>DB: プロジェクト存在確認
    DB-->>A: プロジェクト情報
    
    A->>DB: 法令情報保存
    Note right of A: トランザクション開始
    A->>DB: 用途地域情報保存
    A->>DB: 告示情報保存
    Note right of A: トランザクション終了
    
    DB-->>A: 保存完了
    A-->>C: 保存完了レスポンス
```

### 5.3 保存データ構造

```json
{
  "location": "東京都千代田区丸の内1-1-1",
  "coordinates": {
    "latitude": 35.681236,
    "longitude": 139.767125
  },
  "zoneInfo": {
    "zone_type": "商業地域",
    "regulations": {
      "coverage_ratio": 80,
      "floor_area_ratio": 400,
      "height_restrictions": {
        "absolute_max": 60,
        "gradient_restrictions": []
      }
    }
  },
  "kokujiInfo": {
    "kokuji_id": "412K500040001453",
    "kokuji_text": "...",
    "effective_date": "2024-01-01"
  }
}

```

## 6. プロジェクト詳細画面

### 6.1 実装済みコンポーネント構成

```mermaid
graph TD
    A[ProjectDetail] --> B[基本情報セクション]
    A --> C[法令情報セクション]
    
    subgraph "基本情報セクション"
        B --> D[プロジェクト名]
        B --> E[ステータスチップ]
        B --> F[所在地]
        B --> G[期間]
        B --> H[説明]
        B --> I[操作ボタン]
        I --> J[編集ボタン]
        I --> K[削除ボタン]
    end
    
    subgraph "法令情報セクション"
        C --> L[用途地域情報]
        C --> M[建ぺい率]
        C --> N[容積率]
        C --> O[高度地区]
        C --> P[操作ボタン]
        P --> Q[用途地域検索]
        P --> R[地図から検索]
    end
```

### 6.2 追加予定のコンポーネント

```mermaid
graph TD
    A[ProjectDetail] --> B[LegalInfoEditor]
    A --> C[MapViewer]
    
    subgraph "法令情報編集"
        B --> D[RegulationEditor]
        B --> E[KokujiEditor]
        
        D --> F[ZoneTypeSelect]
        D --> G[RatioInputs]
        D --> H[HeightRestrictionInputs]
        
        E --> I[KokujiTextArea]
        E --> J[EffectiveDatePicker]
    end
    
    subgraph "地図表示"
        C --> K[ZoneOverlay]
        C --> L[LocationMarker]
        C --> M[MapControls]
    end
```

### 6.3 状態管理フロー

```mermaid
stateDiagram-v2
    [*] --> プロジェクト詳細表示
    プロジェクト詳細表示 --> 基本情報編集: 編集ボタン
    プロジェクト詳細表示 --> 削除確認: 削除ボタン
    プロジェクト詳細表示 --> 地図検索: 地図から検索
    プロジェクト詳細表示 --> 用途地域検索: 用途地域検索
    
    基本情報編集 --> プロジェクト詳細表示: 保存/キャンセル
    削除確認 --> プロジェクト詳細表示: キャンセル
    削除確認 --> プロジェクト一覧: 削除確定
    
    地図検索 --> 法令情報更新: 地点選択
    用途地域検索 --> 法令情報更新: 検索実行
    法令情報更新 --> プロジェクト詳細表示: 保存完了
```

### 6.4 データ構造

```json
{
  "project": {
    "id": 1,
    "name": "丸の内プロジェクト",
    "location": "東京都千代田区丸の内",
    "start_date": "2024-04-01",
    "end_date": "2025-03-31",
    "description": "丸の内エリアの再開発プロジェクト",
    "status": "planning"
  },
  "legalInfo": {
    "zoneType": "商業地域",
    "coverageRatio": 80,
    "floorAreaRatio": 400,
    "heightDistrict": "第三種高度地区",
    "kokuji": {
      "id": "412K500040001453",
      "text": "...",
      "effectiveDate": "2024-01-01"
    }
  }
}

```

## 7. 建築計算機能

### 7.1 計算ロジック

```mermaid
graph TD
    A[入力値] --> B[敷地面積]
    A --> C[建ぺい率]
    A --> D[容積率]
    A --> E[前面道路幅員]
    A --> F[用途地域]

    B --> G[建築可能面積計算]
    C --> G
    G --> H[建築面積]

    B --> I[延べ床面積計算]
    D --> I
    E --> J[道路幅員による制限]
    F --> J
    J --> I
    I --> K[延べ床面積]

    subgraph "制限値計算"
        J --> L[住居系地域]
        J --> M[その他地域]
        L --> N[道路幅×0.4×100]
        M --> O[道路幅×0.6×100]
    end
```

### 7.2 計算式

```javascript
// 建築可能面積の計算
const calculateBuildableArea = (siteArea, coverageRatio) => {
  return (siteArea * coverageRatio) / 100;
};

// 延べ床面積の計算（道路幅員制限考慮）
const calculateTotalFloorArea = (siteArea, floorAreaRatio, roadWidth, zoneType) => {
  // 道路幅員による制限
  const roadWidthLimit = zoneType.includes('住居') 
    ? roadWidth * 0.4 * 100
    : roadWidth * 0.6 * 100;

  // 制限値と指定容積率の小さい方を採用
  const effectiveRatio = Math.min(floorAreaRatio, roadWidthLimit);
  return (siteArea * effectiveRatio) / 100;
};
```

### 7.3 データ構造の更新

```json
{
  "project": {
    "id": 1,
    "name": "丸の内プロジェクト",
    "location": "東京都千代田区丸の内",
    "start_date": "2024-04-01",
    "end_date": "2025-03-31",
    "description": "丸の内エリアの再開発プロジェクト",
    "status": "planning"
  },
  "legalInfo": {
    "zoneType": "商業地域",
    "coverageRatio": 80,
    "floorAreaRatio": 400,
    "heightDistrict": "第三種高度地区",
    "roadWidth": 25,
    "siteArea": 1000,
    "calculations": {
      "buildableArea": 800,
      "totalFloorArea": 4000,
      "roadWidthLimit": 1500,
      "effectiveFloorAreaRatio": 400
    },
    "kokuji": {
      "id": "412K500040001453",
      "text": "...",
      "effectiveDate": "2024-01-01"
    }
  }
}
```

### 7.4 ZoneSearch機能の統合

```mermaid
sequenceDiagram
    participant U as User
    participant Z as ZoneSearch
    participant A as API
    participant D as Database

    U->>Z: 地図または住所で検索
    Z->>A: 用途地域情報取得
    A-->>Z: 用途地域データ
    
    Z->>Z: 建築計算実行
    Note right of Z: 建ぺい率・容積率計算
    Note right of Z: 道路幅員制限確認
    
    Z->>A: 計算結果を含む法令情報保存
    A->>D: データ保存
    D-->>A: 保存完了
    A-->>Z: 保存完了レスポンス
    Z-->>U: 結果表示
```

### 7.5 入力フォームの更新

```mermaid
graph TD
    A[ZoneSearchForm] --> B[地図/住所検索]
    A --> C[敷地情報入力]
    
    subgraph "敷地情報"
        C --> D[敷地面積]
        C --> E[前面道路幅員]
        C --> F[用途地域選択]
    end
    
    subgraph "計算結果表示"
        G[ResultDisplay] --> H[建築可能面積]
        G --> I[延べ床面積]
        G --> J[制限値表示]
    end
```

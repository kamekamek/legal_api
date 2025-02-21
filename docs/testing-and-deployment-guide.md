# テストとデプロイメントガイド

## 1. テスト環境について

### 1.1 テストの種類と目的

1. **単体テスト（Unit Test）**
   - 個々のコンポーネントやファンクションが正しく動作するかをテスト
   - 最も小さい単位のテスト
   - 例：ボタンクリックが正しく動作するか、計算関数が正しい結果を返すか

2. **統合テスト（Integration Test）**
   - 複数のコンポーネントやシステムが連携して正しく動作するかをテスト
   - 例：フォームの入力からAPIコール、データベース保存までの一連の流れ

3. **E2Eテスト（End-to-End Test）**
   - ユーザーの実際の操作シナリオを再現してテスト
   - アプリケーション全体の動作を確認
   - 例：ログインからデータ入力、保存までの一連の操作

### 1.2 フロントエンドのテスト（Jest + React Testing Library）

#### テストの実行方法
```bash
# 通常のテスト実行
npm test

# テストをウォッチモードで実行（ファイル変更を監視）
npm run test:watch

# カバレッジレポートを生成
npm run test:coverage
```

#### テストの書き方例
```javascript
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Buttonコンポーネント', () => {
  test('クリックイベントが正しく発火する', () => {
    const handleClick = jest.fn();  // モック関数
    render(<Button onClick={handleClick}>クリック</Button>);
    
    // ボタンを探してクリック
    const button = screen.getByText('クリック');
    fireEvent.click(button);
    
    // クリックイベントが1回発火したことを確認
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 1.3 バックエンドのテスト（Jest + Supertest）

#### テストの実行方法
```bash
# 通常のテスト実行
npm test

# 特定のテストファイルのみ実行
npm test -- projects.test.js

# E2Eテストの実行
npm run test:e2e
```

#### テストの書き方例
```javascript
// projects.test.js
const request = require('supertest');
const app = require('../app');

describe('プロジェクトAPI', () => {
  test('プロジェクト一覧を取得できる', async () => {
    const response = await request(app)
      .get('/api/v1/projects')
      .expect(200);
    
    expect(response.body).toHaveProperty('projects');
    expect(Array.isArray(response.body.projects)).toBe(true);
  });
});
```

## 2. CI/CDパイプラインについて

### 2.1 基本的な概念

1. **CI（継続的インテグレーション）**
   - コードの変更を定期的に統合
   - 自動テストを実行
   - 問題を早期に発見

2. **CD（継続的デリバリー/デプロイメント）**
   - テスト済みのコードを自動的にデプロイ
   - 開発→ステージング→本番の流れを自動化

### 2.2 GitHub Actionsの使い方

1. **ワークフローの確認**
   - `.github/workflows/main.yml`にワークフローが定義されています
   - プッシュやプルリクエスト時に自動実行

2. **実行の流れ**
   ```mermaid
   graph TD
     A[コードのプッシュ] --> B[テスト実行]
     B --> C{テスト成功?}
     C -->|Yes| D[ビルド]
     C -->|No| E[失敗通知]
     D --> F[デプロイ]
   ```

3. **環境ごとのデプロイ**
   - develop ブランチ → ステージング環境
   - main ブランチ → 本番環境

### 2.3 日常的な開発フロー

1. **新機能の開発開始**
   ```bash
   # 新しいブランチを作成
   git checkout -b feature/new-feature
   ```

2. **ローカルでのテスト**
   ```bash
   # フロントエンドのテスト
   cd frontend
   npm test

   # バックエンドのテスト
   cd backend
   npm test
   ```

3. **変更のコミットとプッシュ**
   ```bash
   git add .
   git commit -m "新機能の追加"
   git push origin feature/new-feature
   ```

4. **プルリクエストの作成**
   - GitHub上でプルリクエストを作成
   - 自動的にテストが実行される
   - レビュー後、developブランチにマージ

### 2.4 トラブルシューティング

1. **テストが失敗する場合**
   - テストログを確認
   - ローカルで再現を試みる
   - 必要に応じてテストコードを修正

2. **デプロイが失敗する場合**
   - GitHub Actionsのログを確認
   - 環境変数の設定を確認
   - 必要なアクセス権限の確認

## 3. 開発環境の使い分け

### 3.1 各環境の役割

1. **開発環境（Development）**
   - 開発者のローカル環境
   - 新機能の開発とテスト
   - `npm run dev`で起動

2. **ステージング環境（Staging）**
   - 本番に近い環境でのテスト
   - developブランチの変更を自動デプロイ
   - QAテストを実施

3. **本番環境（Production）**
   - 実際のユーザーが使用する環境
   - mainブランチの変更のみデプロイ
   - 慎重な変更管理が必要

### 3.2 環境変数の管理

```bash
# .env.development（開発環境用）
VITE_API_URL=http://localhost:3001
VITE_ENV=development

# .env.staging（ステージング環境用）
VITE_API_URL=https://staging-api.example.com
VITE_ENV=staging

# .env.production（本番環境用）
VITE_API_URL=https://api.example.com
VITE_ENV=production
```

## 4. 推奨される開発プラクティス

1. **テストファーストの開発**
   - 新機能の実装前にテストを書く
   - テストが失敗する状態から始める
   - 実装後にテストが成功することを確認

2. **定期的なマージ**
   - 小さな変更を頻繁にマージ
   - コンフリクトのリスクを減らす
   - レビューしやすい単位を維持

3. **モニタリングとフィードバック**
   - テストカバレッジの監視
   - パフォーマンスの計測
   - ユーザーフィードバックの収集 
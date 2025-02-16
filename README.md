# 法規制情報検索アプリケーション

このアプリケーションは、住所から地図表示と法規制情報（用途地域、建蔽率、容積率など）を検索できるウェブアプリケーションです。

## 機能

- 住所検索による地図表示
- 法規制情報の表示
  - 用途地域
  - 防火地域
  - 建蔽率
  - 容積率
  - 建築基準法48条（準備中）
  - 法別表第２（準備中）

## 必要要件

- Node.js (v16以上)
- npm
- ZenrinAPI アクセスキー

## セットアップ手順

1. リポジトリのクローン
```bash
git clone [repository-url]
cd legal_api
```

2. バックエンドのセットアップ
```bash
cd backend
npm install
```

3. フロントエンドのセットアップ
```bash
cd ../frontend
npm install
```

4. 環境変数の設定

`backend/.env`ファイルを作成し、以下の内容を設定：
```
PORT=3001
ZENRIN_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:5173
```

※ `your_api_key_here`は実際のZenrinAPIキーに置き換えてください。

## 起動方法

1. バックエンドの起動
```bash
cd backend
npm start
```

2. フロントエンドの起動（新しいターミナルで）
```bash
cd frontend
npm run dev
```

3. ブラウザでアプリケーションにアクセス
```
http://localhost:5173
```

## 使用方法

1. 検索フォームに住所を入力（例：東京都大田区）
2. 「検索」ボタンをクリック
3. 地図上にピンが表示され、右側に法規制情報が表示されます

## 使用技術

- フロントエンド
  - React
  - Vite
  - Material-UI
  - Leaflet (地図表示)
  - Axios (API通信)

- バックエンド
  - Node.js
  - Express
  - dotenv (環境変数管理)
  - cors (CORS対応)

## 注意事項

- ZenrinAPIキーは必ず`.env`ファイルで管理し、公開リポジトリにコミットしないようご注意ください。
- 本番環境にデプロイする場合は、適切なセキュリティ対策を実施してください。

## ライセンス

[ライセンス情報を記載]

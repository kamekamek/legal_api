

```markdown:zenrin-api-implementation-learnings.md
# ZENRINマップAPI実装における学び
## 概要
フロントエンドとバックエンドを分離したアーキテクチャにおける、ZENRINマップAPIの実装から得られた知見をまとめます。

## 1. APIの種類と役割分担

### 1.1 JavaScript API（フロントエンド）
フロントエンドでは、ユーザーインターフェースに関連する機能を担当します。

```javascript
// 地図の初期化と表示
const map = new ZMap.Map({
  container: 'map',
  center: [139.767125, 35.681236],
  zoom: 13
});
```

**主な責務：**
- 地図の表示と操作
- マーカーの配置
- ズーム・パン操作
- ユーザーインタラクションの処理

### 1.2 Web API（バックエンド）
バックエンドでは、データ処理とセキュリティに関連する機能を担当します。

```javascript
const response = await axios.get(`${ZENRIN_WMS_URL}`, {
  params: wmsParams,
  headers: {
    'x-api-key': ZENRIN_API_KEY,
    'Authorization': 'referer'
  }
});
```

**主な責務：**
- WMSを通じた用途地域情報の取得
- APIキーの安全な管理
- 座標系の変換処理
- エラーハンドリング

## 2. アーキテクチャ上の利点

### 2.1 セキュリティの向上
- APIキーをバックエンドで管理することで、クライアントサイドでの露出を防止
- CORSの適切な設定による安全な通信の確保

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### 2.2 保守性の向上
- 関心の分離による責務の明確化
- フロントエンドとバックエンドそれぞれに適した実装が可能
- コードの可読性と保守性の向上

### 2.3 データ処理の最適化
- バックエンドでの座標変換処理の一元管理
- レスポンスデータの最適化による効率的な通信

```javascript
// 座標変換の例
const x = lon * 20037508.34 / 180;
const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
```

## 3. エラーハンドリングの改善

### 3.1 集中的なエラー管理
```javascript
const handleApiError = (error, defaultMessage) => {
  console.error('API Error:', error.response?.data || error.message);
  const statusCode = error.response?.status || 500;
  const message = error.response?.data?.message || defaultMessage;
  return { statusCode, message };
};
```

### 3.2 ユーザーフレンドリーなエラーメッセージ
- バックエンドでのエラー情報の適切な加工
- フロントエンドでの分かりやすいエラー表示

## 4. 実装のベストプラクティス

### 4.1 環境変数の活用
```javascript
const ZENRIN_API_KEY = process.env.ZENRIN_API_KEY;
const ZENRIN_WMS_URL = 'https://test-web.zmaps-api.com/map/wms/youto';
```

### 4.2 レスポンスデータの整形
```javascript
const regulationData = {
  type: properties.youto?.toString() || '情報なし',
  fireArea: properties.bouka?.toString() || '情報なし',
  buildingCoverageRatio: (properties.kenpei?.toString() || '60').replace(/%/g, ''),
  floorAreaRatio: (properties.yoseki?.toString() || '200').replace(/%/g, '')
};
```

## 5. 結論
フロントエンドとバックエンドの適切な役割分担により：
1. セキュアな実装
2. 保守性の高いコード
3. 効率的なデータ処理
4. 堅牢なエラーハンドリング

が実現可能となりました。この構造は、他の地図APIを使用する際にも応用可能な設計パターンとして活用できます。

## 参考文献
- [ZENRIN Maps API Web API リファレンス](https://developers.zmaps-api.com/v20/reference/webAPI/)
- [ZENRIN Maps API JavaScript API リファレンス](https://developers.zmaps-api.com/v20/reference/javascriptAPI/)
```

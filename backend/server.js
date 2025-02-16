require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Zenrin WMS APIの設定
const ZENRIN_API_KEY = process.env.ZENRIN_API_KEY;
const ZENRIN_WMS_URL = 'https://test-web.zmaps-api.com';

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// エラーレスポンスの整形
const handleApiError = (error, defaultMessage) => {
  console.error('API Error:', error.response?.data || error.message);
  const statusCode = error.response?.status || 500;
  const message = error.response?.data?.message || defaultMessage;
  return { statusCode, message };
};

// ジオコーディングエンドポイント
app.post('/api/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: '住所を入力してください' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (!response.data || !response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: '指定された住所が見つかりませんでした' });
    }

    res.json(response.data);
  } catch (error) {
    const { statusCode, message } = handleApiError(error, 'ジオコーディングに失敗しました');
    res.status(statusCode).json({ error: message });
  }
});

// 用途地域情報取得エンドポイント
app.get('/api/landuse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: '緯度・経度を指定してください' });
    }

    // WMS GetFeatureInfo リクエスト
    const response = await axios.get(`${ZENRIN_WMS_URL}/wms`, {
      params: {
        service: 'WMS',
        version: '1.3.0',
        request: 'GetFeatureInfo',
        layers: 'youto',
        query_layers: 'youto',
        info_format: 'application/json',
        i: '50',
        j: '50',
        width: '101',
        height: '101',
        bbox: `${parseFloat(lng) - 0.001},${parseFloat(lat) - 0.001},${parseFloat(lng) + 0.001},${parseFloat(lat) + 0.001}`,
        crs: 'EPSG:4326',
        api_key: ZENRIN_API_KEY
      }
    });

    if (!response.data || !response.data.features || response.data.features.length === 0) {
      return res.status(404).json({ error: '指定された地点の情報が見つかりませんでした' });
    }

    // レスポンスデータの整形
    const feature = response.data.features[0];
    const properties = feature.properties;

    const regulationData = {
      type: properties.youto || '情報なし',
      fireArea: properties.bouka || '情報なし',
      buildingCoverageRatio: properties.kenpei?.replace('%', '') || '60',
      floorAreaRatio: properties.yoseki?.replace('%', '') || '200'
    };

    res.json(regulationData);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: '用途地域情報の取得に失敗しました' });
  }
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

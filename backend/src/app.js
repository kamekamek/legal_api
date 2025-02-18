const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const axios = require('axios');

const app = express();

// Zenrin WMS APIの設定
const ZENRIN_API_KEY = process.env.ZENRIN_API_KEY;
const ZENRIN_WMS_URL = 'https://test-web.zmaps-api.com/map/wms/youto';
const ZENRIN_GEOCODE_URL = 'https://test-web.zmaps-api.com/geocode';

// ミドルウェアの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 用途地域情報取得エンドポイント
app.get('/api/landuse', async (req, res) => {
  try {
    const { lat: latStr, lng: lngStr } = req.query;
    if (!latStr || !lngStr) {
      return res.status(400).json({ error: '緯度・経度を指定してください' });
    }

    console.log('WMS Request Parameters:', {
      lat: latStr,
      lng: lngStr,
      api_key: ZENRIN_API_KEY ? 'Set' : 'Not Set'
    });

    // 座標を EPSG:4326 から EPSG:3857 に変換
    const lon = parseFloat(lngStr);
    const lat = parseFloat(latStr);
    const x = lon * 20037508.34 / 180;
    const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
    
    // バッファを追加（約500mの範囲）
    const buffer = 500;
    const xMin = x - buffer;
    const xMax = x + buffer;
    const yMin = y - buffer;
    const yMax = y + buffer;

    const wmsParams = {
      'VERSION': '1.3.0',
      'REQUEST': 'GetFeatureInfo',
      'LAYERS': 'lp1',
      'QUERY_LAYERS': 'lp1',
      'INFO_FORMAT': 'application/json',
      'I': '400',
      'J': '300',
      'WIDTH': '800',
      'HEIGHT': '600',
      'FORMAT': 'image/png',
      'FEATURE_COUNT': '1',
      'BBOX': `${xMin},${yMin},${xMax},${yMax}`,
      'CRS': 'EPSG:3857'
    };

    console.log('WMS Request URL:', `${ZENRIN_WMS_URL}`);
    console.log('WMS Parameters:', wmsParams);

    const response = await axios.get(`${ZENRIN_WMS_URL}`, {
      params: wmsParams,
      headers: {
        'x-api-key': ZENRIN_API_KEY,
        'Authorization': 'referer',
        'Referer': req.headers.referer || ''
      }
    });

    console.log('WMS Response:', response.data);

    if (!response.data || !response.data.features || response.data.features.length === 0) {
      return res.status(404).json({ error: '指定された地点の情報が見つかりませんでした' });
    }

    // レスポンスデータの整形
    const feature = response.data.features[0];
    const properties = feature.properties;

    const regulationData = {
      type: properties.youto?.toString() || '情報なし',
      fireArea: properties.bouka?.toString() || '情報なし',
      buildingCoverageRatio: (properties.kenpei?.toString() || '60').replace(/%/g, ''),
      floorAreaRatio: (properties.yoseki?.toString() || '200').replace(/%/g, ''),
      heightDistrict: properties.koudo?.toString() || '0',
      heightDistrict2: properties.koudo2?.toString() || '0',
      zoneMap: properties.map?.toString() || '',
      zoneMap2: properties.map2?.toString() || '',
      buildingCoverageRatio2: properties.kenpei2?.toString() || '',
      scenicZoneName: properties.f_meisho?.toString() || '',
      scenicZoneType: properties.f_shu?.toString() || ''
    };

    res.json(regulationData);
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        params: error.config?.params
      }
    });
    res.status(500).json({ 
      error: '用途地域情報の取得に失敗しました',
      details: error.response?.data || error.message
    });
  }
});

// ルートの設定
app.use('/api/v1', routes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

module.exports = app; 
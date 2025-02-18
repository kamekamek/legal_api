require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// Zenrin WMS APIの設定
const ZENRIN_API_KEY = process.env.ZENRIN_API_KEY;
const ZENRIN_WMS_URL = 'https://test-web.zmaps-api.com/map/wms/youto';
const ZENRIN_GEOCODE_URL = 'https://test-web.zmaps-api.com/geocode';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// 住所検索APIエンドポイント
app.post('/api/legal/address/search', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: '住所を入力してください' });
    }

    // Zenrinジオコーディング APIを呼び出し
    const geocodeResponse = await axios.get(ZENRIN_GEOCODE_URL, {
      params: {
        'q': address,
        'output': 'json'
      },
      headers: {
        'x-api-key': ZENRIN_API_KEY
      }
    });

    if (!geocodeResponse.data || !geocodeResponse.data.features || geocodeResponse.data.features.length === 0) {
      return res.status(404).json({ error: '住所が見つかりませんでした' });
    }

    const location = geocodeResponse.data.features[0].geometry.coordinates;
    const [lng, lat] = location;

    // 用途地域情報を取得
    const landUseResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/landuse`, {
      params: { lat, lng }
    });

    res.json({
      location: { lat, lng },
      landUseInfo: landUseResponse.data
    });
  } catch (error) {
    console.error('Address Search Error:', error);
    res.status(500).json({ 
      error: '住所検索に失敗しました',
      details: error.response?.data || error.message
    });
  }
});

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

// 告示文取得エンドポイント
app.get('/api/kokuji/:kokuji_id', async (req, res) => {
  try {
    const { kokuji_id } = req.params;
    console.log('告示文取得リクエスト開始:', { kokuji_id });

    // APIリクエストの設定をログ出力
    const apiConfig = {
      url: 'https://kokujiapi.azurewebsites.net/api/v1/getKokuji',
      params: {
        kokuji_id,
        response_format: 'plain'
      },
      headers: {
        'accept': 'application/xml'
      }
    };
    console.log('API設定:', apiConfig);

    const response = await axios({
      method: 'GET',
      url: apiConfig.url,
      params: apiConfig.params,
      headers: apiConfig.headers,
      timeout: 10000
    });

    console.log('告示文取得成功:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataLength: response.data?.length
    });

    // レスポンスデータの整形
    let kokujiText = response.data;
    if (typeof kokujiText === 'string') {
      kokujiText = kokujiText.replace(/^\s*<Law>\s*/g, '');
      kokujiText = kokujiText.replace(/\s*<\/Law>\s*$/g, '');
    }

    res.json({
      status: 'success',
      data: {
        kokuji_text: kokujiText,
        kokuji_id,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('告示文取得エラー詳細:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      config: error.config
    });

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.status === 404 
      ? '指定された告示文が見つかりませんでした'
      : '告示文の取得に失敗しました';

    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      error: {
        code: error.code,
        status: statusCode,
        details: error.message
      }
    });
  }
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

module.exports = app;

// サーバー起動（テスト時は起動しない）
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

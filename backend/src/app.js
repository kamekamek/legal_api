import 'node:path';
import 'node:fs';
import 'node:http';
import 'node:crypto';
import 'node:buffer';
import 'node:stream';
import 'node:util';
import 'node:url';
import 'node:querystring';
import 'node:events';
import 'node:string_decoder';
import 'node:zlib';
import 'node:os';
import 'node:net';

import express from 'express';
import cors from 'cors';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import axios from 'axios';
import buildingCalculationRouter from './routes/buildingCalculation';
import legalRouter from './routes/legal';

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

// 告示文取得APIエンドポイント
app.get('/api/v1/kokuji/:kokuji_id', async (req, res) => {
  try {
    const { kokuji_id } = req.params;
    console.log('告示文取得リクエスト開始:', { kokuji_id });

    const response = await axios({
      method: 'GET',
      url: 'https://kokujiapi.azurewebsites.net/api/v1/getKokuji',
      params: {
        kokuji_id: kokuji_id,
        response_format: 'plain'
      },
      headers: {
        'accept': 'application/xml'
      },
      timeout: 10000
    });

    console.log('Azure API Response:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataLength: response.data?.length
    });

    if (response.data) {
      let kokujiText = response.data;
      // <Law>タグの中身のみを抽出
      const match = /<Law>([\s\S]*?)<\/Law>/g.exec(kokujiText);
      if (match && match[1]) {
        kokujiText = match[1].trim();
      }

      res.json({
        status: 'success',
        data: {
          kokuji_text: kokujiText,
          kokuji_id: kokuji_id,
          updated_at: new Date().toISOString()
        }
      });
    } else {
      res.status(404).json({ 
        status: 'error',
        error: '告示文が見つかりませんでした',
        kokuji_id
      });
    }
  } catch (error) {
    console.error('告示文取得エラー:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    if (error.response) {
      res.status(error.response.status).json({
        status: 'error',
        error: '告示文の取得に失敗しました',
        details: error.response.data,
        kokuji_id
      });
    } else if (error.request) {
      res.status(503).json({
        status: 'error',
        error: 'Azure APIからの応答がありません',
        kokuji_id
      });
    } else {
      res.status(500).json({
        status: 'error',
        error: 'サーバー内部エラー',
        details: error.message,
        kokuji_id
      });
    }
  }
});

// 建築計算APIルーターを追加
app.use('/api/v1', buildingCalculationRouter);

// 法令情報APIルーターを追加
app.use('/api/v1', legalRouter);

// ルートの設定
app.use('/', routes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

export default app; 
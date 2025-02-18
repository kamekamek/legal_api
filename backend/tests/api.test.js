const request = require('supertest');
const nock = require('nock');
const app = require('../server');

describe('Legal API Endpoints', () => {
  beforeEach(() => {
    // モックのZenrin APIレスポンスを設定
    nock('https://test-web.zmaps-api.com')
      .get('/geocode')
      .query(true)
      .reply(200, {
        features: [{
          geometry: {
            coordinates: [139.7671, 35.6814]
          }
        }]
      });

    nock('https://test-web.zmaps-api.com')
      .get('/map/wms/youto')
      .query(true)
      .reply(200, {
        features: [{
          properties: {
            youto: '11',
            bouka: '1',
            kenpei: '60',
            yoseki: '200',
            koudo: '1',
            map: '市化:11:60:200:準防'
          }
        }]
      });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('POST /api/legal/address/search', () => {
    it('正しい住所で検索すると座標と用途地域情報を返す', async () => {
      const res = await request(app)
        .post('/api/legal/address/search')
        .send({ address: '東京都千代田区丸の内1丁目' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('location');
      expect(res.body).toHaveProperty('landUseInfo');
      expect(res.body.location).toHaveProperty('lat');
      expect(res.body.location).toHaveProperty('lng');
    });

    it('住所が空の場合はエラーを返す', async () => {
      const res = await request(app)
        .post('/api/legal/address/search')
        .send({ address: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', '住所を入力してください');
    });

    it('Zenrin APIがエラーを返した場合は適切なエラーメッセージを返す', async () => {
      nock.cleanAll();
      nock('https://test-web.zmaps-api.com')
        .get('/geocode')
        .query(true)
        .reply(500, { error: 'Internal Server Error' });

      const res = await request(app)
        .post('/api/legal/address/search')
        .send({ address: '東京都千代田区丸の内1丁目' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/landuse', () => {
    it('正しい緯度経度で検索すると用途地域情報を返す', async () => {
      const res = await request(app)
        .get('/api/landuse')
        .query({ lat: '35.6814', lng: '139.7671' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('fireArea');
      expect(res.body).toHaveProperty('buildingCoverageRatio');
      expect(res.body).toHaveProperty('floorAreaRatio');
    });

    it('緯度経度が不足している場合はエラーを返す', async () => {
      const res = await request(app)
        .get('/api/landuse')
        .query({ lat: '35.6814' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', '緯度・経度を指定してください');
    });

    it('Zenrin WMS APIがエラーを返した場合は適切なエラーメッセージを返す', async () => {
      nock.cleanAll();
      nock('https://test-web.zmaps-api.com')
        .get('/map/wms/youto')
        .query(true)
        .reply(500, { error: 'Internal Server Error' });

      const res = await request(app)
        .get('/api/landuse')
        .query({ lat: '35.6814', lng: '139.7671' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
}); 
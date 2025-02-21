const request = require('supertest');
const app = require('../../app');

describe('プロジェクトAPI', () => {
  describe('GET /api/v1/projects', () => {
    test('プロジェクト一覧を取得できる', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .expect(200);
      
      expect(response.body).toHaveProperty('projects');
      expect(Array.isArray(response.body.projects)).toBe(true);
    });

    test('クエリパラメータによるフィルタリングが機能する', async () => {
      const response = await request(app)
        .get('/api/v1/projects?status=active')
        .expect(200);
      
      expect(response.body.projects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ status: 'active' })
        ])
      );
    });
  });

  describe('POST /api/v1/projects', () => {
    test('新しいプロジェクトを作成できる', async () => {
      const newProject = {
        name: 'テストプロジェクト',
        location: '東京都渋谷区',
        scale: '中規模',
        usage_type: '事務所'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(newProject)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProject.name);
    });

    test('必須フィールドが欠けている場合はエラーを返す', async () => {
      const invalidProject = {
        location: '東京都渋谷区'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(invalidProject)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name');
    });
  });
}); 
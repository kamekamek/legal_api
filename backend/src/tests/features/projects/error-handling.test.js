const request = require('supertest');
const app = require('../../../app');
const { Project } = require('../../../models');

describe('プロジェクトAPI エラーハンドリング', () => {
  beforeEach(async () => {
    await Project.destroy({ where: {} });
  });

  describe('入力バリデーション', () => {
    test('不正なJSONリクエストの場合は400エラー', async () => {
      await request(app)
        .post('/api/v1/projects')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toContain('Invalid JSON');
        });
    });

    test('不正なステータス値の場合は400エラー', async () => {
      await request(app)
        .post('/api/v1/projects')
        .send({
          name: 'テストプロジェクト',
          status: '無効なステータス'
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toContain('status');
        });
    });
  });

  describe('リソース不在', () => {
    test('存在しないプロジェクトの取得は404エラー', async () => {
      await request(app)
        .get('/api/v1/projects/999')
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toContain('not found');
        });
    });

    test('存在しないプロジェクトの更新は404エラー', async () => {
      await request(app)
        .put('/api/v1/projects/999')
        .send({
          name: '更新テスト'
        })
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toContain('not found');
        });
    });

    test('存在しないプロジェクトの削除は404エラー', async () => {
      await request(app)
        .delete('/api/v1/projects/999')
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toContain('not found');
        });
    });
  });

  describe('データベースエラー', () => {
    test('データベース接続エラー時は500エラー', async () => {
      // モックでデータベースエラーを発生させる
      jest.spyOn(Project, 'findAll').mockRejectedValue(new Error('DB Error'));

      await request(app)
        .get('/api/v1/projects')
        .expect(500)
        .expect(res => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toContain('Internal Server Error');
        });

      // モックを元に戻す
      jest.restoreAllMocks();
    });
  });

  describe('同時実行制御', () => {
    test('同じプロジェクトの同時更新は409エラー', async () => {
      const project = await Project.create({
        name: '競合テストプロジェクト',
        status: 'planning'
      });

      // 同時更新をシミュレート
      const updates = [
        request(app)
          .put(`/api/v1/projects/${project.id}`)
          .send({ status: 'active' }),
        request(app)
          .put(`/api/v1/projects/${project.id}`)
          .send({ status: 'completed' })
      ];

      const results = await Promise.all(updates);
      expect(results.some(res => res.status === 409)).toBe(true);
    });
  });
}); 
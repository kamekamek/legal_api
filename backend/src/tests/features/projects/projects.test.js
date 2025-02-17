const request = require('supertest');
const app = require('../../../app');
const { Project } = require('../../../models');

describe('プロジェクト管理API', () => {
  beforeEach(async () => {
    // テストの前にデータベースをクリーンアップ
    await Project.destroy({ where: {} });
  });

  describe('GET /api/v1/projects', () => {
    test('プロジェクト一覧を取得できる', async () => {
      // テストデータの作成
      await Project.bulkCreate([
        {
          name: 'テストプロジェクト1',
          location: '東京都渋谷区',
          scale: '中規模',
          usage_type: '事務所',
          status: 'active'
        },
        {
          name: 'テストプロジェクト2',
          location: '東京都新宿区',
          scale: '大規模',
          usage_type: '商業施設',
          status: 'planning'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/projects')
        .expect(200);
      
      expect(response.body).toHaveProperty('projects');
      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(response.body.projects).toHaveLength(2);
      expect(response.body.projects[0]).toHaveProperty('name', 'テストプロジェクト1');
    });

    test('ステータスでフィルタリングできる', async () => {
      // テストデータの作成
      await Project.bulkCreate([
        {
          name: 'アクティブプロジェクト',
          status: 'active'
        },
        {
          name: '計画中プロジェクト',
          status: 'planning'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/projects?status=active')
        .expect(200);
      
      expect(response.body.projects).toHaveLength(1);
      expect(response.body.projects[0].status).toBe('active');
    });
  });

  describe('POST /api/v1/projects', () => {
    test('新しいプロジェクトを作成できる', async () => {
      const newProject = {
        name: '新規プロジェクト',
        location: '東京都渋谷区',
        scale: '中規模',
        usage_type: '事務所',
        status: 'planning'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(newProject)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProject.name);
      
      // データベースに保存されていることを確認
      const savedProject = await Project.findByPk(response.body.id);
      expect(savedProject.name).toBe(newProject.name);
    });

    test('必須フィールドが欠けている場合はエラーを返す', async () => {
      const invalidProject = {
        location: '東京都渋谷区'
        // nameフィールドが欠けている
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(invalidProject)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name');
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    test('指定したIDのプロジェクトを取得できる', async () => {
      const project = await Project.create({
        name: 'テストプロジェクト',
        location: '東京都渋谷区',
        scale: '中規模',
        usage_type: '事務所',
        status: 'active'
      });

      const response = await request(app)
        .get(`/api/v1/projects/${project.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', project.id);
      expect(response.body.name).toBe(project.name);
    });

    test('存在しないIDの場合は404を返す', async () => {
      await request(app)
        .get('/api/v1/projects/999')
        .expect(404);
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    test('プロジェクトを更新できる', async () => {
      const project = await Project.create({
        name: '更新前プロジェクト',
        status: 'planning'
      });

      const updateData = {
        name: '更新後プロジェクト',
        status: 'active'
      };

      const response = await request(app)
        .put(`/api/v1/projects/${project.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.status).toBe(updateData.status);

      // データベースが更新されていることを確認
      const updatedProject = await Project.findByPk(project.id);
      expect(updatedProject.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    test('プロジェクトを削除できる', async () => {
      const project = await Project.create({
        name: '削除対象プロジェクト',
        status: 'active'
      });

      await request(app)
        .delete(`/api/v1/projects/${project.id}`)
        .expect(204);

      // データベースから削除されていることを確認
      const deletedProject = await Project.findByPk(project.id);
      expect(deletedProject).toBeNull();
    });
  });
}); 
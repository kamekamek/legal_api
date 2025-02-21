const { Project } = require('../../../models');

describe('プロジェクトバリデーション', () => {
  describe('必須フィールド', () => {
    test('nameは必須', async () => {
      const project = Project.build({
        location: '東京都渋谷区',
        scale: '中規模',
        usage_type: '事務所'
      });

      await expect(project.validate()).rejects.toThrow();
    });

    test('全ての必須フィールドが存在する場合は有効', async () => {
      const project = Project.build({
        name: 'テストプロジェクト',
        location: '東京都渋谷区',
        scale: '中規模',
        usage_type: '事務所',
        status: 'planning'
      });

      await expect(project.validate()).resolves.not.toThrow();
    });
  });

  describe('フィールドの制約', () => {
    test('nameは255文字以内', async () => {
      const project = Project.build({
        name: 'a'.repeat(256),
        location: '東京都渋谷区',
        status: 'planning'
      });

      await expect(project.validate()).rejects.toThrow();
    });

    test('statusは有効な値のみ許可', async () => {
      const project = Project.build({
        name: 'テストプロジェクト',
        location: '東京都渋谷区',
        status: '無効なステータス'
      });

      await expect(project.validate()).rejects.toThrow();
    });
  });

  describe('ユニーク制約', () => {
    beforeEach(async () => {
      await Project.destroy({ where: {} });
    });

    test('同じ名前のプロジェクトは作成できない', async () => {
      await Project.create({
        name: 'テストプロジェクト',
        location: '東京都渋谷区',
        status: 'planning'
      });

      const duplicateProject = Project.build({
        name: 'テストプロジェクト',
        location: '東京都新宿区',
        status: 'planning'
      });

      await expect(duplicateProject.save()).rejects.toThrow();
    });
  });

  describe('デフォルト値', () => {
    test('statusが指定されていない場合はplanningがデフォルト値', async () => {
      const project = await Project.create({
        name: 'テストプロジェクト',
        location: '東京都渋谷区'
      });

      expect(project.status).toBe('planning');
    });

    test('created_atとupdated_atが自動設定される', async () => {
      const project = await Project.create({
        name: 'テストプロジェクト',
        location: '東京都渋谷区'
      });

      expect(project.created_at).toBeDefined();
      expect(project.updated_at).toBeDefined();
    });
  });
}); 
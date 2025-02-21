const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Project Controller', () => {
  beforeEach(async () => {
    // テストデータのクリーンアップ
    await supabase.from('projects').delete().neq('id', 0);
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      // テストデータの作成
      const testProject = {
        name: 'Test Project',
        description: 'Test Description',
        status: 'planning'
      };
      
      await supabase.from('projects').insert([testProject]);

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.projects).toBeDefined();
      expect(response.body.projects.length).toBeGreaterThan(0);
      expect(response.body.projects[0].name).toBe(testProject.name);
    });

    it('should filter projects by status', async () => {
      const testProjects = [
        { name: 'Project 1', status: 'planning' },
        { name: 'Project 2', status: 'in_progress' }
      ];
      
      await supabase.from('projects').insert(testProjects);

      const response = await request(app)
        .get('/api/projects?status=planning')
        .expect(200);

      expect(response.body.projects).toBeDefined();
      expect(response.body.projects.length).toBe(1);
      expect(response.body.projects[0].status).toBe('planning');
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const newProject = {
        name: 'New Project',
        description: 'New Description',
        status: 'planning'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(newProject)
        .expect(201);

      expect(response.body.name).toBe(newProject.name);
      expect(response.body.description).toBe(newProject.description);
      expect(response.body.status).toBe(newProject.status);
    });

    it('should return 400 if project name already exists', async () => {
      const project = {
        name: 'Duplicate Project',
        description: 'Test Description',
        status: 'planning'
      };

      await supabase.from('projects').insert([project]);

      await request(app)
        .post('/api/projects')
        .send(project)
        .expect(400);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update an existing project', async () => {
      // テストプロジェクトの作成
      const { data: project } = await supabase
        .from('projects')
        .insert([{
          name: 'Project to Update',
          description: 'Original Description',
          status: 'planning'
        }])
        .select()
        .single();

      const updatedData = {
        name: 'Updated Project',
        description: 'Updated Description',
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.status).toBe(updatedData.status);
    });

    it('should return 404 if project not found', async () => {
      await request(app)
        .put('/api/projects/999999')
        .send({ name: 'Updated Project' })
        .expect(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete an existing project', async () => {
      // テストプロジェクトの作成
      const { data: project } = await supabase
        .from('projects')
        .insert([{
          name: 'Project to Delete',
          description: 'Test Description',
          status: 'planning'
        }])
        .select()
        .single();

      await request(app)
        .delete(`/api/projects/${project.id}`)
        .expect(204);

      // プロジェクトが削除されたことを確認
      const { data: deletedProject } = await supabase
        .from('projects')
        .select()
        .eq('id', project.id)
        .single();

      expect(deletedProject).toBeNull();
    });
  });
}); 
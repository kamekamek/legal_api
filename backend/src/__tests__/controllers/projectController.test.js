import { getProjects, getProject, createProject } from '../../controllers/projectController.js';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントのモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('Project Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockSupabase;

  beforeEach(() => {
    // リクエスト、レスポンス、nextのモック
    mockReq = {
      params: {},
      body: {},
      env: {
        SUPABASE_URL: 'test-url',
        SUPABASE_ANON_KEY: 'test-key'
      }
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();

    // Supabaseクライアントのモック設定
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis()
    };
    createClient.mockReturnValue(mockSupabase);
  });

  describe('getProjects', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1' },
        { id: 2, name: 'Project 2' }
      ];
      mockSupabase.select.mockResolvedValueOnce({ data: mockProjects, error: null });

      await getProjects(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockProjects
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockSupabase.select.mockResolvedValueOnce({ error });

      await getProjects(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProject', () => {
    it('should return a single project', async () => {
      const mockProject = { id: 1, name: 'Project 1' };
      mockReq.params.id = 1;
      mockSupabase.single.mockResolvedValueOnce({ data: mockProject, error: null });

      await getProject(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 when project not found', async () => {
      mockReq.params.id = 999;
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

      await getProject(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'プロジェクトが見つかりません' });
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const newProject = { name: 'New Project', description: 'Test description' };
      mockReq.body = newProject;
      mockSupabase.select.mockResolvedValueOnce({ 
        data: { ...newProject, id: 1 }, 
        error: null 
      });

      await createProject(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { ...newProject, id: 1 }
      });
    });

    it('should return 400 when name is missing', async () => {
      mockReq.body = { description: 'Test description' };

      await createProject(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: '400',
          message: 'プロジェクト名は必須です'
        }
      });
    });
  });
}); 
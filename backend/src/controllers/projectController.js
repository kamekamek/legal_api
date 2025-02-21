'use strict';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// プロジェクト一覧の取得
export const getProjects = async (req, res, next) => {
  try {
    const { data, error } = await global.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      status: 'success',
      data: data || []
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    next(error);
  }
};

// プロジェクト詳細の取得
export const getProject = async (req, res, next) => {
  try {
    const { data, error } = await global.supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Project fetch error:', error);
    next(error);
  }
};

// プロジェクトの作成
export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: '400',
          message: 'プロジェクト名は必須です'
        }
      });
    }

    const { data, error } = await global.supabase
      .from('projects')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('Project creation error:', error);
    next(error);
  }
};

// プロジェクトの更新
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: '400',
          message: '更新するフィールドを指定してください'
        }
      });
    }

    const { data, error } = await global.supabase
      .from('projects')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: '404',
          message: 'プロジェクトが見つかりません'
        }
      });
    }

    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('Project update error:', error);
    next(error);
  }
};

// プロジェクトの削除
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await global.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Project deletion error:', error);
    next(error);
  }
}; 
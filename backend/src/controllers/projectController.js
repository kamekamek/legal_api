'use strict';

const supabase = require('../config/supabase');

// プロジェクト一覧の取得
exports.getProjects = async (req, res, next) => {
  try {
    let query = supabase.from('projects').select('*');
    
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json({ projects: data });
  } catch (error) {
    next(error);
  }
};

// プロジェクト詳細の取得
exports.getProject = async (req, res, next) => {
  try {
    const { data, error } = await supabase
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
    next(error);
  }
};

// プロジェクトの作成
exports.createProject = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([req.body])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // ユニーク制約違反
        return res.status(400).json({ error: 'プロジェクト名が既に使用されています' });
      }
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// プロジェクトの更新
exports.updateProject = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// プロジェクトの削除
exports.deleteProject = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 
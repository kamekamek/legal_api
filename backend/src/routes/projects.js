'use strict';

import express from 'express';
import { supabase } from '../lib/supabase.js';
import { Router } from 'itty-router';

const router = express.Router();

// プロジェクト一覧の取得
router.get('/', async (req, res, next) => {
  try {
    let query = supabase.from('projects').select('*');
    
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json({ projects: data });
  } catch (error) {
    console.error('Projects fetch error:', error);
    next(error);
  }
});

// プロジェクト詳細の取得
router.get('/:id', async (req, res, next) => {
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
    console.error('Project fetch error:', error);
    next(error);
  }
});

// プロジェクトの作成
router.post('/', async (req, res, next) => {
  try {
    const { name, description, status, location } = req.body;
    if (!name || !status) {
      return res.status(400).json({ 
        error: '必須フィールドが不足しています',
        details: {
          name: !name ? 'プロジェクト名は必須です' : null,
          status: !status ? 'ステータスは必須です' : null
        }
      });
    }

    const validStatuses = ['planning', 'in_progress', 'completed', 'on_hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: '無効なステータスです',
        details: {
          status: `ステータスは${validStatuses.join(', ')}のいずれかである必要があります`
        }
      });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name,
        description,
        status,
        location
      }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'プロジェクト名が既に使用されています' });
      }
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Project creation error:', error);
    next(error);
  }
});

// プロジェクトの更新
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, status, location } = req.body;
    
    if (status) {
      const validStatuses = ['planning', 'in_progress', 'completed', 'on_hold'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: '無効なステータスです',
          details: {
            status: `ステータスは${validStatuses.join(', ')}のいずれかである必要があります`
          }
        });
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(location !== undefined && { location })
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'プロジェクト名が既に使用されています' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Project update error:', error);
    next(error);
  }
});

// プロジェクトの削除
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Project deletion error:', error);
    next(error);
  }
});

export default router; 
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// 告示文一覧を取得
router.get('/kokuji', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kokuji')
      .select('kokuji_id, title, effective_date, category')
      .order('effective_date', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error getting kokuji list:', err);
    res.status(500).json({ error: '告示文一覧の取得に失敗しました' });
  }
});

// 特定の告示文を取得
router.get('/kokuji/:kokujiId', async (req, res) => {
  try {
    const { kokujiId } = req.params;
    const { data, error } = await supabase
      .from('kokuji')
      .select('kokuji_id, kokuji_text')
      .eq('kokuji_id', kokujiId)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: '告示文が見つかりません' });
    }

    res.json({ data });
  } catch (err) {
    console.error('Error getting kokuji:', err);
    res.status(500).json({ error: '告示文の取得に失敗しました' });
  }
});

// プロジェクトに関連する告示文一覧を取得
router.get('/projects/:projectId/kokuji', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { data, error } = await supabase
      .from('project_kokuji')
      .select(`
        kokuji (
          kokuji_id,
          kokuji_text
        )
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    res.json({ data: data.map(item => item.kokuji) });
  } catch (err) {
    console.error('Error getting project kokuji:', err);
    res.status(500).json({ error: 'プロジェクトの告示文取得に失敗しました' });
  }
});

// プロジェクトに告示文を関連付け
router.post('/projects/:projectId/kokuji', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { kokujiId, kokujiText } = req.body;

    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'プロジェクトが存在しません' });
    }

    // 告示文の登録（存在しない場合のみ）
    const { error: kokujiError } = await supabase
      .from('kokuji')
      .upsert({ kokuji_id: kokujiId, kokuji_text: kokujiText });

    if (kokujiError) throw kokujiError;

    // 関連付けの作成
    const { error: linkError } = await supabase
      .from('project_kokuji')
      .insert({ project_id: projectId, kokuji_id: kokujiId });

    if (linkError) {
      if (linkError.code === '23505') { // unique_violation
        return res.status(400).json({ error: 'すでに関連付けられています' });
      }
      throw linkError;
    }

    res.status(201).json({ message: '告示文を関連付けました' });
  } catch (err) {
    console.error('Error linking kokuji to project:', err);
    res.status(500).json({ error: err.message || '告示文の関連付けに失敗しました' });
  }
});

// プロジェクトから告示文の関連付けを解除
router.delete('/projects/:projectId/kokuji/:kokujiId', async (req, res) => {
  try {
    const { projectId, kokujiId } = req.params;
    const { error } = await supabase
      .from('project_kokuji')
      .delete()
      .match({ project_id: projectId, kokuji_id: kokujiId });

    if (error) throw error;
    res.json({ message: '関連付けを解除しました' });
  } catch (err) {
    console.error('Error unlinking kokuji from project:', err);
    res.status(500).json({ error: '関連付けの解除に失敗しました' });
  }
});

module.exports = router; 
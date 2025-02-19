const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// 告示文一覧を取得
router.get('/kokuji', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT kokuji_id, title, effective_date, category FROM kokuji ORDER BY effective_date DESC'
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error getting kokuji list:', err);
    res.status(500).json({ error: '告示文一覧の取得に失敗しました' });
  }
});

// 特定の告示文を取得
router.get('/kokuji/:kokujiId', async (req, res) => {
  try {
    const { kokujiId } = req.params;
    const result = await pool.query(
      'SELECT * FROM kokuji WHERE kokuji_id = $1',
      [kokujiId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '告示文が見つかりません' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting kokuji:', err);
    res.status(500).json({ error: '告示文の取得に失敗しました' });
  }
});

// プロジェクトに関連する告示文一覧を取得
router.get('/projects/:projectId/kokuji', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `SELECT k.* 
       FROM kokuji k
       JOIN project_kokuji pk ON k.kokuji_id = pk.kokuji_id
       WHERE pk.project_id = $1
       ORDER BY k.effective_date DESC`,
      [projectId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error getting project kokuji:', err);
    res.status(500).json({ error: 'プロジェクトの告示文取得に失敗しました' });
  }
});

// プロジェクトに告示文を関連付け
router.post('/projects/:projectId/kokuji', async (req, res) => {
  const client = await pool.connect();
  try {
    const { projectId } = req.params;
    const { kokujiId, memo } = req.body;

    await client.query('BEGIN');

    // プロジェクトの存在確認
    const projectExists = await client.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
    if (projectExists.rows.length === 0) {
      throw new Error('プロジェクトが存在しません');
    }

    // 告示文の存在確認
    const kokujiExists = await client.query(
      'SELECT kokuji_id FROM kokuji WHERE kokuji_id = $1',
      [kokujiId]
    );
    if (kokujiExists.rows.length === 0) {
      throw new Error('告示文が存在しません');
    }

    // 関連付けを作成
    await client.query(
      'INSERT INTO project_kokuji (project_id, kokuji_id, memo) VALUES ($1, $2, $3)',
      [projectId, kokujiId, memo]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: '告示文を関連付けました' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error linking kokuji to project:', err);
    res.status(500).json({ error: err.message || '告示文の関連付けに失敗しました' });
  } finally {
    client.release();
  }
});

// プロジェクトから告示文の関連付けを解除
router.delete('/projects/:projectId/kokuji/:kokujiId', async (req, res) => {
  try {
    const { projectId, kokujiId } = req.params;
    const result = await pool.query(
      'DELETE FROM project_kokuji WHERE project_id = $1 AND kokuji_id = $2',
      [projectId, kokujiId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: '関連付けが見つかりません' });
    }
    
    res.json({ message: '関連付けを解除しました' });
  } catch (err) {
    console.error('Error unlinking kokuji from project:', err);
    res.status(500).json({ error: '関連付けの解除に失敗しました' });
  }
});

module.exports = router; 
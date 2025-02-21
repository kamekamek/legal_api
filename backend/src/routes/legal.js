import express from 'express';

const router = express.Router();

// 法令情報取得エンドポイント
router.get('/legal-info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supabaseから法令情報を取得
    const { data, error } = await global.supabase
      .from('legal_info')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        error: '指定された法令情報が見つかりません'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('法令情報取得エラー:', error);
    res.status(500).json({
      error: '法令情報の取得に失敗しました'
    });
  }
});

// 法令情報登録エンドポイント
router.post('/legal-info', async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    // バリデーション
    if (!title || !content || !category) {
      return res.status(400).json({
        error: 'タイトル、内容、カテゴリーは必須です'
      });
    }

    // Supabaseに法令情報を登録
    const { data, error } = await global.supabase
      .from('legal_info')
      .insert([
        {
          title,
          content,
          category,
          tags: tags || [],
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('法令情報登録エラー:', error);
    res.status(500).json({
      error: '法令情報の登録に失敗しました'
    });
  }
});

// 法令情報更新エンドポイント
router.put('/legal-info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    // バリデーション
    if (!title && !content && !category && !tags) {
      return res.status(400).json({
        error: '更新する項目が指定されていません'
      });
    }

    // 更新データの準備
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    updateData.updated_at = new Date().toISOString();

    // Supabaseの法令情報を更新
    const { data, error } = await global.supabase
      .from('legal_info')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        error: '指定された法令情報が見つかりません'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('法令情報更新エラー:', error);
    res.status(500).json({
      error: '法令情報の更新に失敗しました'
    });
  }
});

// 法令情報削除エンドポイント
router.delete('/legal-info/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Supabaseから法令情報を削除
    const { error } = await global.supabase
      .from('legal_info')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('法令情報削除エラー:', error);
    res.status(500).json({
      error: '法令情報の削除に失敗しました'
    });
  }
});

// 法令情報一覧取得エンドポイント
router.get('/legal-info', async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    
    // クエリの構築
    let query = global.supabase
      .from('legal_info')
      .select('*');

    // カテゴリーでフィルタリング
    if (category) {
      query = query.eq('category', category);
    }

    // タグでフィルタリング
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // ページネーション
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // データ取得
    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data,
      page: parseInt(page),
      limit: parseInt(limit),
      total: count
    });
  } catch (error) {
    console.error('法令情報一覧取得エラー:', error);
    res.status(500).json({
      error: '法令情報一覧の取得に失敗しました'
    });
  }
});

export default router; 
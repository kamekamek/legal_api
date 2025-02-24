'use strict';

export default (err, req, res, next) => {
  console.error(err);

  // Supabaseのエラーハンドリング
  if (err.code) {
    switch (err.code) {
      case '23505': // ユニーク制約違反
        return res.status(400).json({
          error: 'この名前は既に使用されています'
        });
      case '23503': // 外部キー制約違反
        return res.status(400).json({
          error: '関連するリソースが見つかりません'
        });
      case '23502': // Not null制約違反
        return res.status(400).json({
          error: '必須フィールドが入力されていません'
        });
      case '42703': // カラムが存在しない
        return res.status(400).json({
          error: '無効なフィールドが指定されています'
        });
    }
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: '無効なJSONフォーマットです'
    });
  }

  // その他のエラー
  res.status(500).json({
    error: '内部サーバーエラーが発生しました'
  });
}; 
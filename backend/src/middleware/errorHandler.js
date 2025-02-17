'use strict';

const { ValidationError, DatabaseError } = require('sequelize');

module.exports = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      error: 'データベースエラーが発生しました'
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON'
    });
  }

  // 同時実行制御エラー
  if (err.name === 'SequelizeOptimisticLockError') {
    return res.status(409).json({
      error: '他のユーザーによって更新されました'
    });
  }

  // その他のエラー
  res.status(500).json({
    error: 'Internal Server Error'
  });
}; 
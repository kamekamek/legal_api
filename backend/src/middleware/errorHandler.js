'use strict';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // エラーオブジェクトからステータスコードを取得（デフォルトは500）
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler; 
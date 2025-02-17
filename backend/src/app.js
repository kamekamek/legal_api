const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ミドルウェアの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());

// ルートの設定
app.use('/api/v1', routes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

module.exports = app; 
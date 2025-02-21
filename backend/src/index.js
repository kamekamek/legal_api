import express from 'express';
import cors from 'cors';
import routes from './routes';
import errorHandler from './middleware/errorHandler';

const app = express();

// ミドルウェアの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// 環境変数をリクエストに追加するミドルウェア
app.use((req, res, next) => {
  req.env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  };
  next();
});

// ルーティングの設定
app.use('/api/v1', routes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

// Cloudflare Workers用のエクスポート
export default {
  fetch: async (request, env, ctx) => {
    // Cloudflare Workersの環境変数をexpressのリクエストに渡す
    process.env.SUPABASE_URL = env.SUPABASE_URL;
    process.env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
    
    return app(request);
  }
}; 
import { Router } from 'itty-router'
import { createClient } from '@supabase/supabase-js'

// ルーターの作成
const router = Router()

// CORSヘッダーを設定する関数
const corsHeaders = (request) => {
  const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',');
  const origin = request.headers.get('Origin');
  const isAllowed = allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
};

// Supabaseクライアントの初期化
const initSupabase = (env) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
}

// プロジェクト一覧を取得
router.get('/api/projects', async (request, env) => {
  try {
    const supabase = initSupabase(env)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify({ data }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'プロジェクト一覧の取得に失敗しました'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    })
  }
})

// OPTIONSリクエストに対するCORS対応
router.options('*', (request) => new Response(null, { headers: corsHeaders(request) }))

// 404ハンドラー
router.all('*', () => new Response('Not Found', { status: 404 }))

// メインのリクエストハンドラー
export default {
  fetch: router.handle
} 
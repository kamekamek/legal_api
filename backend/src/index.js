import { Router } from 'itty-router'
import { createClient } from '@supabase/supabase-js'

// ルーターの作成
const router = Router()

// CORSヘッダーを設定する関数
const corsHeaders = (request) => {
  // 開発環境とプロダクション環境のオリジンを許可
  const allowedOrigins = [
    'http://localhost:5173',  // 開発環境
    'https://legal-api-frontend.pages.dev'  // 本番環境（適宜変更してください）
  ];
  
  const origin = request.headers.get('Origin');
  const isAllowed = allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',  // credentialsを許可
    'Access-Control-Max-Age': '86400',  // プリフライトリクエストのキャッシュ時間
  };
};

// Supabaseクライアントの初期化
const initSupabase = (env) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
}

// プリフライトリクエストのハンドラー
router.options('*', (request) => {
  // プリフライトリクエストの場合は、追加のヘッダーを設定
  const headers = {
    ...corsHeaders(request),
    'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
  };
  
  return new Response(null, { 
    headers,
    status: 204  // No Content
  });
});

// プロジェクト一覧を取得
router.get('/api/v1/projects', async (request, env) => {  // パスを/api/v1/projectsに修正
  try {
    const supabase = initSupabase(env)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify({ projects: data }), {  // レスポンスの形式を修正
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

// 404ハンドラー
router.all('*', (request) => new Response('Not Found', { 
  status: 404,
  headers: corsHeaders(request)  // 404レスポンスにもCORSヘッダーを追加
}))

// メインのリクエストハンドラー
export default {
  fetch: router.handle
} 
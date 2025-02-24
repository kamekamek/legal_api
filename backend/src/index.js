import { Router } from 'itty-router/Router'
import { createClient } from '@supabase/supabase-js'

// ルーターの作成
const router = Router()

// CORSヘッダーを設定する関数
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

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
        ...corsHeaders
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'プロジェクト一覧の取得に失敗しました'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
})

// OPTIONSリクエストに対するCORS対応
router.options('*', () => new Response(null, { headers: corsHeaders }))

// 404ハンドラー
router.all('*', () => new Response('Not Found', { status: 404 }))

// メインのリクエストハンドラー
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx)
  }
} 
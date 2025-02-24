import { Router } from 'itty-router'

// ルーターの作成
const router = Router()

// CORSヘッダーを設定する関数
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// プロジェクト一覧を取得
router.get('/api/projects', async () => {
  try {
    // Supabaseからデータを取得する処理をここに実装
    const projects = [] // 仮のレスポンス
    return new Response(JSON.stringify(projects), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
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

// メインのリクエストハンドラー
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx)
  }
} 
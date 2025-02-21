import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントの初期化
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
)

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ルーティングの設定
async function handleRequest(request) {
  const url = new URL(request.url)
  
  // プリフライトリクエストの処理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // APIエンドポイントの処理
    if (url.pathname.startsWith('/api/projects')) {
      if (request.method === 'GET') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
        
        if (error) throw error
        
        return new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        })
      }
    }

    // 他のエンドポイントも同様に実装

    // 404エラー
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
}

// Workersのエントリーポイント
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request)
  }
} 
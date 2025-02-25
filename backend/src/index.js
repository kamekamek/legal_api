import { createClient } from '@supabase/supabase-js'

// CORSヘッダーを設定する関数
const corsHeaders = (request) => {
  // 開発環境とプロダクション環境のオリジンを許可
  const allowedOrigins = [
    'http://localhost:5173',  // 開発環境
    'https://legal-api-frontend.pages.dev'  // 本番環境
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

// プロジェクト一覧を取得する関数
async function getProjects(env) {
  try {
    const supabase = initSupabase(env);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { projects: data || [] };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

// メインのリクエストハンドラー
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // OPTIONSリクエスト（プリフライト）の処理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(request),
        status: 204
      });
    }

    // 各エンドポイントの処理
    try {
      // テストエンドポイント
      if (path === '/api/v1/test' && request.method === 'GET') {
        return new Response(
          JSON.stringify({ message: 'API is working!' }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(request)
            }
          }
        );
      }
      
      // プロジェクト一覧エンドポイント
      if (path === '/api/v1/projects' && request.method === 'GET') {
        const data = await getProjects(env);
        return new Response(
          JSON.stringify(data),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(request)
            }
          }
        );
      }

      // 404 - Not Found
      return new Response(
        JSON.stringify({ error: 'Not Found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(request)
          }
        }
      );
    } catch (error) {
      // エラーハンドリング
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Internal Server Error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(request)
          }
        }
      );
    }
  }
}; 
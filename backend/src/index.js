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

// プロジェクト詳細を取得する関数
async function getProjectById(env, id) {
  try {
    const supabase = initSupabase(env);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('プロジェクトが見つかりません');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

// 法令情報を取得する関数
async function getLegalInfo(env, projectId) {
  try {
    const supabase = initSupabase(env);
    const { data, error } = await supabase
      .from('legal_info')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116はデータが見つからない場合のエラー

    // データが見つからない場合は空のオブジェクトを返す
    if (!data) {
      return {
        status: 'success',
        data: null
      };
    }

    // フロントエンドの表示形式に合わせてデータを整形
    const formattedData = {
      type: data.type || null,
      fireArea: data.fire_area || null,
      buildingCoverageRatio: data.building_coverage_ratio,
      buildingCoverageRatio2: data.building_coverage_ratio2,
      floorAreaRatio: data.floor_area_ratio,
      heightDistrict: data.height_district || null,
      heightDistrict2: data.height_district2 || null,
      zoneMap: data.zone_map || null,
      scenicZoneName: data.scenic_zone_name || null,
      scenicZoneType: data.scenic_zone_type || null,
      article48: data.article_48 || null,
      appendix2: data.appendix_2 || null,
      safetyOrdinance: data.safety_ordinance || null
    };

    return {
      status: 'success',
      data: formattedData
    };
  } catch (error) {
    console.error('Error fetching legal info:', error);
    throw error;
  }
}

// 法令情報を保存する関数
async function saveLegalInfo(env, projectId, legalInfo) {
  try {
    const supabase = initSupabase(env);
    
    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('プロジェクトが見つかりません');
    }

    // データベース用に整形
    const dbData = {
      project_id: projectId,
      type: legalInfo.type,
      fire_area: legalInfo.fireArea,
      building_coverage_ratio: legalInfo.buildingCoverageRatio,
      building_coverage_ratio2: legalInfo.buildingCoverageRatio2,
      floor_area_ratio: legalInfo.floorAreaRatio,
      height_district: legalInfo.heightDistrict,
      height_district2: legalInfo.heightDistrict2,
      zone_map: legalInfo.zoneMap,
      scenic_zone_name: legalInfo.scenicZoneName,
      scenic_zone_type: legalInfo.scenicZoneType,
      article_48: legalInfo.article48,
      appendix_2: legalInfo.appendix2,
      safety_ordinance: legalInfo.safetyOrdinance,
      updated_at: new Date()
    };

    // 既存データの確認
    const { data: existingData, error: existingError } = await supabase
      .from('legal_info')
      .select('id')
      .eq('project_id', projectId)
      .single();

    let result;
    
    if (!existingData) {
      // 新規作成
      dbData.created_at = new Date();
      result = await supabase
        .from('legal_info')
        .insert([dbData])
        .select()
        .single();
    } else {
      // 更新
      result = await supabase
        .from('legal_info')
        .update(dbData)
        .eq('project_id', projectId)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return {
      status: 'success',
      data: legalInfo
    };
  } catch (error) {
    console.error('Error saving legal info:', error);
    throw error;
  }
}

// 告示文一覧を取得する関数
async function getKokujiList(env, projectId) {
  try {
    const supabase = initSupabase(env);
    
    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    if (!project) {
      throw new Error('プロジェクトが見つかりません');
    }

    // プロジェクトに関連する告示文を取得
    const { data: kokujiList, error: kokujiError } = await supabase
      .from('project_kokuji')
      .select(`
        id,
        kokuji_id,
        kokuji_text,
        memo,
        created_at,
        updated_at
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (kokujiError) throw kokujiError;

    return {
      status: 'success',
      data: kokujiList || []
    };
  } catch (error) {
    console.error('Error fetching kokuji list:', error);
    throw error;
  }
}

// 告示文を保存する関数
async function saveKokuji(env, projectId, kokujiData) {
  try {
    const supabase = initSupabase(env);
    
    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('プロジェクトが見つかりません');
    }

    // データベース用に整形
    const dbData = {
      project_id: projectId,
      kokuji_id: kokujiData.kokuji_id,
      kokuji_text: kokujiData.kokuji_text,
      memo: kokujiData.memo || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // 告示文を保存
    const { data, error } = await supabase
      .from('project_kokuji')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;

    return {
      status: 'success',
      data: {
        id: data.id,
        kokuji_id: data.kokuji_id,
        kokuji_text: data.kokuji_text,
        memo: data.memo,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    };
  } catch (error) {
    console.error('Error saving kokuji:', error);
    throw error;
  }
}

// 住所検索関数
async function searchAddress(env, query) {
  try {
    // ZENRINのAPIキーを取得
    const apiKey = env.ZENRIN_API_KEY;
    if (!apiKey) {
      throw new Error('ZENRIN_API_KEYが設定されていません');
    }

    // ZENRINのAPIを呼び出す
    const response = await fetch(
      `https://api.zenrin.jp/address/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('住所検索に失敗しました');
    }

    const data = await response.json();
    return {
      status: 'success',
      data: data.results || []
    };
  } catch (error) {
    console.error('Error searching address:', error);
    throw error;
  }
}

// 用途地域情報取得関数
async function getZoneInfo(env, address) {
  try {
    // ZENRINのAPIキーを取得
    const apiKey = env.ZENRIN_API_KEY;
    if (!apiKey) {
      throw new Error('ZENRIN_API_KEYが設定されていません');
    }

    // ZENRINのAPIを呼び出す
    const response = await fetch(
      `https://api.zenrin.jp/legal/zone/info?address=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('用途地域情報の取得に失敗しました');
    }

    const data = await response.json();
    return {
      status: 'success',
      data: data
    };
  } catch (error) {
    console.error('Error getting zone info:', error);
    throw error;
  }
}

// 建築計算結果を取得する関数
async function getBuildingCalculations(env, projectId) {
  try {
    const supabase = initSupabase(env);
    const { data, error } = await supabase
      .from('building_calculations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      status: 'success',
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching building calculations:', error);
    throw error;
  }
}

// 建築計算を保存する関数
async function saveBuildingCalculation(env, projectId, calculationData) {
  try {
    const supabase = initSupabase(env);
    
    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('プロジェクトが見つかりません');
    }

    // データベース用に整形
    const dbData = {
      project_id: projectId,
      name: calculationData.name,
      input_data: calculationData.input_data,
      result_data: calculationData.result_data,
      created_at: new Date(),
      updated_at: new Date()
    };

    // 計算結果を保存
    const { data, error } = await supabase
      .from('building_calculations')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;

    return {
      status: 'success',
      data: data
    };
  } catch (error) {
    console.error('Error saving building calculation:', error);
    throw error;
  }
}

// 告示文詳細を取得する関数
async function getKokujiById(env, kokujiId) {
  try {
    const supabase = initSupabase(env);
    const { data, error } = await supabase
      .from('kokuji')
      .select('*')
      .eq('kokuji_id', kokujiId)
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('告示文が見つかりません');
    }

    return {
      status: 'success',
      data: {
        kokuji_id: data.kokuji_id,
        kokuji_text: data.kokuji_text
      }
    };
  } catch (error) {
    console.error('Error fetching kokuji:', error);
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

      // プロジェクト詳細エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        const data = await getProjectById(env, id);
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

      // 法令情報取得エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+\/legal-info$/) && request.method === 'GET') {
        const projectId = path.split('/')[4];
        const data = await getLegalInfo(env, projectId);
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

      // 法令情報保存エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+\/legal-info$/) && request.method === 'POST') {
        const projectId = path.split('/')[4];
        const requestData = await request.json();
        const data = await saveLegalInfo(env, projectId, requestData);
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

      // 告示文一覧取得エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+\/kokuji$/) && request.method === 'GET') {
        const projectId = path.split('/')[4];
        const data = await getKokujiList(env, projectId);
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

      // 告示文保存エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+\/kokuji$/) && request.method === 'POST') {
        const projectId = path.split('/')[4];
        const requestData = await request.json();
        const data = await saveKokuji(env, projectId, requestData);
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

      // 告示文詳細取得エンドポイント
      if (path.match(/^\/api\/v1\/kokuji\/[^\/]+$/) && request.method === 'GET') {
        const kokujiId = path.split('/').pop();
        const data = await getKokujiById(env, kokujiId);
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

      // 住所検索エンドポイント
      if (path === '/api/v1/legal/address/search' && request.method === 'GET') {
        const query = url.searchParams.get('q');
        if (!query) {
          return new Response(
            JSON.stringify({ 
              status: 'error',
              error: {
                code: '400',
                message: '検索クエリが指定されていません'
              }
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );
        }
        const data = await searchAddress(env, query);
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

      // 用途地域情報取得エンドポイント
      if (path === '/api/v1/legal/zone/info' && request.method === 'GET') {
        const address = url.searchParams.get('address');
        if (!address) {
          return new Response(
            JSON.stringify({ 
              status: 'error',
              error: {
                code: '400',
                message: '住所が指定されていません'
              }
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );
        }
        const data = await getZoneInfo(env, address);
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

      // 建築計算結果取得エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+\/building-calculations$/) && request.method === 'GET') {
        const projectId = path.split('/')[4];
        const data = await getBuildingCalculations(env, projectId);
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

      // 建築計算保存エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+\/building-calculation$/) && request.method === 'POST') {
        const projectId = path.split('/')[4];
        const requestData = await request.json();
        const data = await saveBuildingCalculation(env, projectId, requestData);
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

      // 建築計算一括保存エンドポイント
      if (path.match(/^\/api\/v1\/projects\/[^\/]+\/building-calculations$/) && request.method === 'POST') {
        const projectId = path.split('/')[4];
        const requestData = await request.json();
        const data = await saveBuildingCalculation(env, projectId, requestData);
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
        JSON.stringify({ 
          status: 'error',
          error: {
            code: '404',
            message: 'Not Found'
          }
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(request)
          }
        }
      );
    } catch (error) {
      console.error('Error handling request:', error);
      
      // エラーメッセージに基づいてステータスコードを設定
      let statusCode = 500;
      if (error.message === 'プロジェクトが見つかりません' || 
          error.message === '告示文が見つかりません') {
        statusCode = 404;
      } else if (error.message.includes('必須フィールド') || 
                error.message.includes('無効な')) {
        statusCode = 400;
      }
      
      // エラーレスポンス
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: {
            code: statusCode.toString(),
            message: error.message || 'Internal Server Error'
          }
        }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(request)
          }
        }
      );
    }
  }
}; 
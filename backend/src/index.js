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
    // kokujiIdの形式を検証
    if (!kokujiId.match(/^412[A-Z][0-9]{12}$/)) {
      throw new Error('不正な告示ID形式です');
    }

    // 外部APIから告示文を取得
    const response = await fetch(`https://kokujiapi.azurewebsites.net/api/v1/getKokuji?kokuji_id=${kokujiId}&response_format=plain`, {
      method: 'GET',
      headers: {
        'accept': 'application/xml'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('指定された告示文が見つかりませんでした');
      }
      throw new Error('告示文の取得中にエラーが発生しました');
    }

    const responseText = await response.text();
    
    if (responseText) {
      let kokujiText = responseText;
      // <Law>タグの中身のみを抽出
      const match = /<Law>([\s\S]*?)<\/Law>/g.exec(kokujiText);
      if (match && match[1]) {
        kokujiText = match[1].trim();
      }

      return {
        status: 'success',
        data: {
          kokuji_text: kokujiText,
          kokuji_id: kokujiId,
          updated_at: new Date().toISOString()
        }
      };
    } else {
      throw new Error('告示文が見つかりません');
    }
  } catch (error) {
    console.error('Error fetching kokuji:', error);
    throw error;
  }
}

// 用途地域情報取得関数（座標指定）
async function getLandUseInfo(env, lat, lng) {
  try {
    // ZENRINのAPIキーを取得
    const apiKey = env.ZENRIN_API_KEY;
    console.log('ZENRIN_API_KEY:', apiKey ? 'APIキーが設定されています' : 'APIキーが設定されていません');
    
    if (!apiKey) {
      throw new Error('ZENRIN_API_KEYが設定されていません');
    }

    // 正しいエンドポイントを使用
    const url = 'https://test-web.zmaps-api.com/map/wms/youto';
    
    // 座標を EPSG:4326 から EPSG:3857 に変換
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const x = longitude * 20037508.34 / 180;
    const y = Math.log(Math.tan((90 + latitude) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
    
    // バッファを追加（約500mの範囲）
    const buffer = 500;
    const xMin = x - buffer;
    const xMax = x + buffer;
    const yMin = y - buffer;
    const yMax = y + buffer;

    const wmsParams = {
      'VERSION': '1.3.0',
      'REQUEST': 'GetFeatureInfo',
      'LAYERS': 'lp1',
      'QUERY_LAYERS': 'lp1',
      'INFO_FORMAT': 'application/json',
      'I': '400',
      'J': '300',
      'WIDTH': '800',
      'HEIGHT': '600',
      'FORMAT': 'image/png',
      'FEATURE_COUNT': '1',
      'BBOX': `${xMin},${yMin},${xMax},${yMax}`,
      'CRS': 'EPSG:3857'
    };

    // 正しい認証ヘッダーを使用
    const queryParams = new URLSearchParams(wmsParams).toString();
    const response = await fetch(
      `${url}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Authorization': 'referer',
          'Referer': 'https://legal-api-frontend.pages.dev/'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zenrin API Error Response:', errorText);
      throw new Error('用途地域情報の取得に失敗しました');
    }

    const data = await response.json();
    console.log('Zenrin API Response:', JSON.stringify(data, null, 2));
    
    // レスポンスデータの整形
    if (!data || !data.features || data.features.length === 0) {
      return {
        type: null,
        fireArea: null,
        buildingCoverageRatio: null,
        buildingCoverageRatio2: null,
        floorAreaRatio: null,
        heightDistrict: null,
        heightDistrict2: null,
        zoneMap: null,
        scenicZoneName: null,
        scenicZoneType: null
      };
    }
    
    const feature = data.features[0];
    const properties = feature.properties;
    
    const formattedData = {
      type: properties.youto?.toString() || null,
      fireArea: properties.bouka?.toString() || null,
      buildingCoverageRatio: (properties.kenpei?.toString() || '60').replace(/%/g, ''),
      floorAreaRatio: (properties.yoseki?.toString() || '200').replace(/%/g, ''),
      heightDistrict: properties.koudo?.toString() || null,
      heightDistrict2: properties.koudo2?.toString() || null,
      zoneMap: properties.map?.toString() || null,
      zoneMap2: properties.map2?.toString() || null,
      buildingCoverageRatio2: properties.kenpei2?.toString() || null,
      scenicZoneName: properties.f_meisho?.toString() || null,
      scenicZoneType: properties.f_shu?.toString() || null
    };
    
    return formattedData;
  } catch (error) {
    console.error('Error getting landuse info:', error);
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
        try {
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
        } catch (error) {
          console.error('Error handling request:', error);
          let status = 500;
          let errorMessage = '告示文の取得に失敗しました';
          
          if (error.message.includes('不正な告示ID形式')) {
            status = 400;
            errorMessage = error.message;
          } else if (error.message.includes('見つかりません')) {
            status = 404;
            errorMessage = error.message;
          }
          
          return new Response(
            JSON.stringify({ 
              status: 'error', 
              error: errorMessage 
            }),
            {
              status,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );
        }
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

      // 用途地域情報取得エンドポイント（座標指定）
      if (path === '/api/v1/legal/landuse' && request.method === 'GET') {
        const lat = url.searchParams.get('lat');
        const lng = url.searchParams.get('lng');
        if (!lat || !lng) {
          return new Response(
            JSON.stringify({ 
              status: 'error',
              error: {
                code: '400',
                message: '緯度・経度が指定されていません'
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
        
        try {
          const data = await getLandUseInfo(env, lat, lng);
          return new Response(
            JSON.stringify(data),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(request)
              }
            }
          );
        } catch (error) {
          console.error('用途地域情報取得エラー:', error);
          return new Response(
            JSON.stringify({ 
              status: 'error',
              error: {
                code: '500',
                message: error.message || '用途地域情報の取得に失敗しました'
              }
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
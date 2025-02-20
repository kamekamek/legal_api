const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

// 法令情報を取得
router.get('/projects/:id/legal-info', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('legal_info')
      .select('*')
      .eq('project_id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: '404',
          message: '法令情報が見つかりません'
        }
      });
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

    res.json({
      status: 'success',
      data: formattedData
    });
  } catch (error) {
    console.error('法令情報取得エラー:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: '500',
        message: '法令情報の取得に失敗しました'
      }
    });
  }
});

// プロジェクトの告示文一覧を取得
router.get('/projects/:id/kokuji', async (req, res) => {
  try {
    const { id } = req.params;

    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: '404',
          message: 'プロジェクトが見つかりません'
        }
      });
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
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (kokujiError) throw kokujiError;

    res.json({
      status: 'success',
      data: kokujiList || []
    });
  } catch (error) {
    console.error('告示文一覧取得エラー:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: '500',
        message: '告示文一覧の取得に失敗しました'
      }
    });
  }
});

// 告示文を保存
router.post('/projects/:id/kokuji', async (req, res) => {
  try {
    const { id } = req.params;
    const { kokuji_id, kokuji_text, memo } = req.body;

    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: '404',
          message: 'プロジェクトが見つかりません'
        }
      });
    }

    // 告示文を保存
    const { data, error } = await supabase
      .from('project_kokuji')
      .insert({
        project_id: id,
        kokuji_id,
        kokuji_text,
        memo
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('告示文保存エラー:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: '500',
        message: '告示文の保存に失敗しました'
      }
    });
  }
});

// 法令情報を保存
router.post('/projects/:id/legal-info', async (req, res) => {
  try {
    const { id } = req.params;
    const legalInfo = req.body;

    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: '404',
          message: 'プロジェクトが見つかりません'
        }
      });
    }

    // 既存の法令情報を確認
    const { data: existingInfo, error: existingError } = await supabase
      .from('legal_info')
      .select('id')
      .eq('project_id', id)
      .single();

    let result;
    if (existingInfo) {
      // 更新
      result = await supabase
        .from('legal_info')
        .update({
          type: legalInfo.type,
          fire_area: legalInfo.fire_area,
          building_coverage_ratio: legalInfo.building_coverage_ratio,
          building_coverage_ratio2: legalInfo.building_coverage_ratio2,
          floor_area_ratio: legalInfo.floor_area_ratio,
          height_district: legalInfo.height_district,
          height_district2: legalInfo.height_district2,
          zone_map: legalInfo.zone_map,
          scenic_zone_name: legalInfo.scenic_zone_name,
          scenic_zone_type: legalInfo.scenic_zone_type,
          article_48: legalInfo.article_48,
          appendix_2: legalInfo.appendix_2,
          safety_ordinance: legalInfo.safety_ordinance,
          updated_at: new Date()
        })
        .eq('project_id', id)
        .select()
        .single();
    } else {
      // 新規作成
      result = await supabase
        .from('legal_info')
        .insert({
          project_id: id,
          type: legalInfo.type,
          fire_area: legalInfo.fire_area,
          building_coverage_ratio: legalInfo.building_coverage_ratio,
          building_coverage_ratio2: legalInfo.building_coverage_ratio2,
          floor_area_ratio: legalInfo.floor_area_ratio,
          height_district: legalInfo.height_district,
          height_district2: legalInfo.height_district2,
          zone_map: legalInfo.zone_map,
          scenic_zone_name: legalInfo.scenic_zone_name,
          scenic_zone_type: legalInfo.scenic_zone_type,
          article_48: legalInfo.article_48,
          appendix_2: legalInfo.appendix_2,
          safety_ordinance: legalInfo.safety_ordinance
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    res.json({
      status: 'success',
      data: result.data
    });
  } catch (error) {
    console.error('法令情報保存エラー:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: '500',
        message: '法令情報の保存に失敗しました'
      }
    });
  }
});

module.exports = router; 
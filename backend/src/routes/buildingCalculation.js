import express from 'express';

const router = express.Router();

// 建築可能面積の計算
const calculateBuildableArea = (siteArea, coverageRatio) => {
  return (siteArea * coverageRatio) / 100;
};

// 延べ床面積の計算（道路幅員制限考慮）
const calculateTotalFloorArea = (siteArea, floorAreaRatio, roadWidth, zoneType) => {
  // 道路幅員による制限
  const roadWidthLimit = zoneType.includes('住居') 
    ? roadWidth * 0.4 * 100
    : roadWidth * 0.6 * 100;

  // 制限値と指定容積率の小さい方を採用
  const effectiveRatio = Math.min(floorAreaRatio, roadWidthLimit);
  return {
    totalFloorArea: (siteArea * effectiveRatio) / 100,
    roadWidthLimit,
    effectiveRatio
  };
};

// 建築計算の実行
router.post('/projects/:id/building-calculation', async (req, res) => {
  try {
    const { siteArea, roadWidth, coverageRatio, floorAreaRatio, zoneType } = req.body;

    // 入力値の検証
    if (!siteArea || !roadWidth || !coverageRatio || !floorAreaRatio) {
      return res.status(400).json({
        status: 'error',
        error: '必要な入力値が不足しています'
      });
    }

    // 建築可能面積の計算
    const buildableArea = calculateBuildableArea(
      parseFloat(siteArea),
      parseFloat(coverageRatio)
    );

    // 延べ床面積の計算
    const { totalFloorArea, roadWidthLimit, effectiveRatio } = calculateTotalFloorArea(
      parseFloat(siteArea),
      parseFloat(floorAreaRatio),
      parseFloat(roadWidth),
      zoneType
    );

    res.json({
      status: 'success',
      data: {
        buildableArea,
        totalFloorArea,
        roadWidthLimit,
        effectiveRatio
      }
    });
  } catch (error) {
    console.error('建築計算エラー:', error);
    res.status(500).json({
      status: 'error',
      error: '計算処理中にエラーが発生しました'
    });
  }
});

// 計算結果の保存
router.post('/projects/:id/building-calculations', async (req, res) => {
  try {
    const projectId = req.params.id;
    const calculationData = {
      project_id: projectId,
      site_area: req.body.siteArea,
      road_width: req.body.roadWidth,
      buildable_area: req.body.buildableArea,
      total_floor_area: req.body.totalFloorArea,
      road_width_limit: req.body.roadWidthLimit,
      effective_ratio: req.body.effectiveRatio
    };

    const { data, error } = await global.supabase
      .from('building_calculations')
      .insert([calculationData]);

    if (error) throw error;

    res.json({
      status: 'success',
      data: data[0]
    });
  } catch (error) {
    console.error('計算結果保存エラー:', error);
    res.status(500).json({
      status: 'error',
      error: '計算結果の保存中にエラーが発生しました'
    });
  }
});

// 計算履歴の取得
router.get('/projects/:id/building-calculations', async (req, res) => {
  try {
    const projectId = req.params.id;

    const { data, error } = await global.supabase
      .from('building_calculations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      status: 'success',
      data: data
    });
  } catch (error) {
    console.error('計算履歴取得エラー:', error);
    res.status(500).json({
      status: 'error',
      error: '計算履歴の取得中にエラーが発生しました'
    });
  }
});

export default router; 
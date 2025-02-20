export const validateRequiredParams = (values) => {
  const { siteArea, coverageRatio, floorAreaRatio, roadWidth, zoneType } = values;
  
  const requiredParams = {
    siteArea: siteArea !== undefined && siteArea !== '',
    coverageRatio: coverageRatio !== undefined && coverageRatio !== '',
    floorAreaRatio: floorAreaRatio !== undefined && floorAreaRatio !== '',
    roadWidth: roadWidth !== undefined && roadWidth !== '',
    zoneType: zoneType !== undefined && zoneType !== '',
  };

  if (Object.values(requiredParams).some(param => !param)) {
    throw new Error('必須パラメータが不足しています');
  }

  return true;
};

export const calculateBuildingLimits = async (values) => {
  validateRequiredParams(values);
  
  const { siteArea, coverageRatio, floorAreaRatio, roadWidth, zoneType } = values;

  try {
    // 建築可能面積の計算
    const buildableArea = (siteArea * coverageRatio) / 100;
    
    // 道路幅員による制限値の計算
    const roadWidthLimit = zoneType.includes('住居') 
      ? roadWidth * 0.4 * 100
      : roadWidth * 0.6 * 100;
    
    // 制限値と指定容積率の小さい方を採用
    const effectiveFloorAreaRatio = Math.min(floorAreaRatio, roadWidthLimit);
    const totalFloorArea = (siteArea * effectiveFloorAreaRatio) / 100;

    return {
      buildableArea,
      totalFloorArea,
      roadWidthLimit,
      effectiveFloorAreaRatio,
    };
  } catch (error) {
    console.error('計算処理エラー:', error);
    throw error;
  }
}; 
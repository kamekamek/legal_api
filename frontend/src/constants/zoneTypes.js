export const YOUTO_MAPPING = {
  11: '第１種低層住居専用地域',
  12: '第２種低層住居専用地域',
  21: '第１種中高層住居専用地域',
  22: '第２種中高層住居専用地域',
  31: '第１種住居地域',
  32: '第２種住居地域',
  40: '準住居地域',
  45: '田園住居地域',
  51: '近隣商業地域',
  52: '商業地域',
  61: '準工業地域',
  62: '工業地域',
  63: '工業専用地域',
  71: '無指定'
};

export const BOUKA_MAPPING = {
  0: '指定なし',
  1: '準防火地域',
  2: '防火地域'
};

export const TOKEI_MAPPING = {
  1: '市街化区域',
  2: '市街化調整区域',
  3: '非線引区域',
  8: '準都市計画区域',
  9: '都市計画区域外'
};

export const ZONE_DIVISION_MAPPING = {
  '市化': '市街化区域',
  '市調': '市街化調整区域',
  '非線': '非線引区域',
  '準都計': '準都市計画区域',
  '都外': '都市計画区域外'
};

export const FIRE_AREA_MAPPING = {
  '準防': '準防火地域',
  '防火': '防火地域',
  '': '指定なし'
};

export const HEIGHT_DISTRICT_MAPPING = {
  '1': '第1種高度地区',
  '2': '第2種高度地区',
  '3': '第3種高度地区',
  '4': '第4種高度地区',
  '5': '第5種高度地区',
  '6': '第6種高度地区',
  '7': '第7種高度地区',
  '8': '第8種高度地区',
  '9': '第9種高度地区',
  '-1': '第1種最低高度地区',
  '-2': '第2種最低高度地区',
  '-3': '第3種最低高度地区',
  '-4': '第4種最低高度地区',
  '-5': '第5種最低高度地区',
  '-6': '第6種最低高度地区',
  '-7': '第7種最低高度地区',
  '-8': '第8種最低高度地区',
  '-9': '第9種最低高度地区'
};

// 高度地区情報を解析する関数
export const parseHeightDistrict = (heightInfo) => {
  console.log('高度地区情報の入力値:', heightInfo);
  
  if (!heightInfo || heightInfo === '0') {
    console.log('高度地区情報なし');
    return null;
  }
  
  // 数値のみの場合は高度地区種別として扱う
  if (!isNaN(heightInfo)) {
    console.log('数値のみの高度地区情報:', heightInfo);
    const result = [`最高高度規制: ${HEIGHT_DISTRICT_MAPPING[heightInfo]}`];
    console.log('解析結果:', result);
    return result;
  }
  
  const parts = heightInfo.split(':');
  console.log('高度地区情報の分割結果:', parts);
  
  const result = [];

  // 最高高度（例: "9m"）
  if (parts[0] && parts[0].includes('m')) {
    result.push(`最高高度: ${parts[0]}`);
  }

  // 最低高度（例: "-9m"）
  if (parts[1] && parts[1].includes('m')) {
    result.push(`最低高度: ${parts[1]}`);
  }

  // 最高高度規制（例: "9" → "第9種高度地区"）
  if (parts[2] && !parts[2].includes('m')) {
    result.push(`最高高度規制: ${HEIGHT_DISTRICT_MAPPING[parts[2]]}`);
  }

  // 最低高度規制（例: "-9" → "第9種最低高度地区"）
  if (parts[3] && !parts[3].includes('m')) {
    result.push(`最低高度規制: ${HEIGHT_DISTRICT_MAPPING[parts[3]]}`);
  }

  console.log('解析結果:', result);
  return result.length > 0 ? result : null;
};

// 区域区分情報を解析する関数
export const parseZoneMap = (mapInfo) => {
  if (!mapInfo) return null;
  
  const parts = mapInfo.split(':');
  return {
    zoneDivision: ZONE_DIVISION_MAPPING[parts[0]] || null,
    useType: YOUTO_MAPPING[parts[1]] || null,
    buildingCoverageRatio: parts[2] ? `${parts[2]}%` : null,
    floorAreaRatio: parts[3] ? `${parts[3]}%` : null,
    fireArea: FIRE_AREA_MAPPING[parts[4]] || null
  };
};

// 風致地区情報を解析する関数
export const parseScenicDistrict = (fMeisho, fShu) => {
  if (!fMeisho && !fShu) return null;
  
  return {
    name: fMeisho || null,
    type: fShu || null
  };
};

// 建ぺい率と容積率の情報を解析する関数
export const parseRatios = (map2) => {
  if (!map2) return null;
  
  const parts = map2.split(':');
  return {
    buildingCoverageRatio: parts[2] ? `${parts[2]}%` : null,
    floorAreaRatio: parts[3] ? `${parts[3]}%` : null
  };
};

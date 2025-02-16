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
  if (!heightInfo || heightInfo === '0') return null;
  
  const parts = heightInfo.split(':');
  return {
    maxHeight: parts[0] || null,
    minHeight: parts[1] || null,
    maxHeightType: parts[2] ? HEIGHT_DISTRICT_MAPPING[parts[2]] : null,
    minHeightType: parts[3] ? HEIGHT_DISTRICT_MAPPING[parts[3]] : null
  };
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

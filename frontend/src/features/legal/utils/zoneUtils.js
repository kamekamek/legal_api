/**
 * 高度地区の情報を解析する
 * @param {string} heightDistrict - 高度地区の文字列
 * @returns {string[]} - 解析された高度地区の情報の配列
 */
export const parseHeightDistrict = (heightDistrict) => {
  if (!heightDistrict || heightDistrict === '0') return null;
  
  const result = [];

  // 数値のみの場合は種別を表す（例: "9" → "第9種高度地区"）
  if (/^\d+$/.test(heightDistrict)) {
    result.push(`第${heightDistrict}種高度地区`);
  } 
  // 数値+mの場合は最高高度を表す（例: "60m" → "最高高度60m"）
  else if (/^(\d+)m$/.test(heightDistrict)) {
    const height = heightDistrict.match(/^(\d+)m$/)[1];
    result.push(`最高高度${height}m`);
  }
  // -数値+mの場合は最低高度を表す（例: "-10m" → "最低高度10m"）
  else if (/^-(\d+)m$/.test(heightDistrict)) {
    const height = heightDistrict.match(/^-(\d+)m$/)[1];
    result.push(`最低高度${height}m`);
  }
  // コロン区切りの場合は複数の情報を含む
  else if (heightDistrict.includes(':')) {
    const parts = heightDistrict.split(':');
    
    // 第一要素が数値のみの場合は種別
    if (parts[0] && /^\d+$/.test(parts[0])) {
      result.push(`第${parts[0]}種高度地区`);
    }
    
    // 第二要素が存在する場合は最高限高度
    if (parts[1]) {
      // 数値+mの形式かチェック
      if (/^(\d+)m$/.test(parts[1])) {
        const height = parts[1].match(/^(\d+)m$/)[1];
        result.push(`最高高度${height}m`);
      } else {
        result.push(`最高限高度: ${parts[1]}`);
      }
    }
    
    // 第三要素が存在する場合は北側斜線
    if (parts[2]) {
      result.push(`北側斜線: ${parts[2]}`);
    }
  }
  // その他の形式はそのまま表示
  else {
    result.push(heightDistrict);
  }

  return result.length > 0 ? result : null;
};

/**
 * 風致地区の情報を解析する
 * @param {string} name - 風致地区の名称
 * @param {string} type - 風致地区の種別
 * @returns {Object} - 解析された風致地区の情報
 */
export const parseScenicDistrict = (name, type) => {
  if (!name && !type) return null;

  return {
    name: name || '',
    type: type || ''
  };
}; 
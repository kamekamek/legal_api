/**
 * 高度地区の情報を解析する
 * @param {string} heightDistrict - 高度地区の文字列
 * @returns {string[]} - 解析された高度地区の情報の配列
 */
export const parseHeightDistrict = (heightDistrict) => {
  if (!heightDistrict) return null;
  
  const parts = heightDistrict.split(':');
  const result = [];

  if (parts[0]) {
    result.push(`第${parts[0]}種高度地区`);
  }

  if (parts[1]) {
    result.push(`最高限高度: ${parts[1]}m`);
  }

  if (parts[2]) {
    result.push(`北側斜線: ${parts[2]}`);
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
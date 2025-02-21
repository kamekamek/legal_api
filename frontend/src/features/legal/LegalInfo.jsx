import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { parseZoneMap, parseHeightDistrict } from '../../constants/zoneTypes';
import { LegalInfoEditor } from './components/LegalInfoEditor';

const LegalInfo = ({ projectData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const zoneInfo = parseZoneMap(projectData?.zoneMap);
  const heightInfo = parseHeightDistrict(projectData?.heightDistrict);

  console.log('LegalInfo render:', {
    projectData,
    zoneInfo,
    heightInfo,
    isEditing
  });

  const handleSave = async (updatedData) => {
    console.log('handleSave called with:', updatedData);
    try {
      await onUpdate(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('更新エラー:', error);
    }
  };

  if (isEditing) {
    return (
      <LegalInfoEditor
        initialData={{
          zoneType: zoneInfo?.useType || '',
          firePrevention: zoneInfo?.fireArea || '',
          coverageRatio: zoneInfo?.buildingCoverageRatio || '',
          floorAreaRatio: zoneInfo?.floorAreaRatio || '',
          heightDistrict: heightInfo?.[0] || '',
          areaClassification: zoneInfo?.zoneDivision || '',
          siteArea: projectData?.siteArea || '',
          roadWidth: projectData?.roadWidth || '',
        }}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          法令情報
        </Typography>
        <Button
          startIcon={<EditIcon />}
          onClick={() => setIsEditing(true)}
          variant="outlined"
          size="small"
        >
          編集
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        {/* 用途地域情報 */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            用途地域情報
          </Typography>
          <Box sx={{ mb: 2 }}>
            {zoneInfo ? (
              <>
                <Typography variant="body1" gutterBottom>
                  区域区分: {zoneInfo.zoneDivision || '未設定'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  用途地域: {zoneInfo.useType || '未設定'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  建ぺい率: {zoneInfo.buildingCoverageRatio || '未設定'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  容積率: {zoneInfo.floorAreaRatio || '未設定'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  防火地域: {zoneInfo.fireArea || '未設定'}
                </Typography>
                {projectData?.calculations && (
                  <>
                    <Typography variant="body1" gutterBottom>
                      建築可能面積: {projectData.calculations.buildableArea.toFixed(2)} ㎡
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      延べ床面積: {projectData.calculations.totalFloorArea.toFixed(2)} ㎡
                    </Typography>
                  </>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                用途地域情報が設定されていません
              </Typography>
            )}
          </Box>
        </Grid>

        {/* 高度地区情報 */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            高度地区情報
          </Typography>
          <Box>
            {heightInfo ? (
              heightInfo.map((info, index) => (
                <Typography key={index} variant="body1" gutterBottom>
                  {info}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                高度地区情報が設定されていません
              </Typography>
            )}
          </Box>
        </Grid>

        {/* 建築制限情報 */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            建築制限情報
          </Typography>
          <Box sx={{ mb: 2 }}>
            {projectData?.buildingRestrictions ? (
              <>
                <Typography variant="body1" gutterBottom>
                  <strong>建築基準法48条による制限：</strong>
                </Typography>
                <Box sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    建築可能用途：
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {projectData.buildingRestrictions.law48.allowedUses.map((use, index) => (
                      <Chip
                        key={index}
                        label={use}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  {projectData.buildingRestrictions.law48.restrictions && (
                    <Typography variant="body2" color="text.secondary">
                      その他の制限：{projectData.buildingRestrictions.law48.restrictions}
                    </Typography>
                  )}
                </Box>

                <Typography variant="body1" gutterBottom>
                  <strong>法別表第2による制限：</strong>
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    区分：{projectData.buildingRestrictions.lawAppendix2.category || '未設定'}
                  </Typography>
                  {projectData.buildingRestrictions.lawAppendix2.restrictions && (
                    <Typography variant="body2" color="text.secondary">
                      制限事項：{projectData.buildingRestrictions.lawAppendix2.restrictions}
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                建築制限情報が設定されていません
              </Typography>
            )}
          </Box>
        </Grid>

        {/* 建物用途制限チェック結果 */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            建物用途制限チェック
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {projectData?.usageRestrictions ? (
              projectData.usageRestrictions.map((restriction, index) => (
                <Chip
                  key={index}
                  label={restriction}
                  color={restriction.includes('制限あり') ? 'error' : 'success'}
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                建物用途制限チェックが実行されていません
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LegalInfo; 
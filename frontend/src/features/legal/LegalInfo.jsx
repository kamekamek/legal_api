import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { parseZoneMap, parseHeightDistrict } from '../../constants/zoneTypes';

const LegalInfo = ({ projectData }) => {
  const zoneInfo = parseZoneMap(projectData?.zoneMap);
  const heightInfo = parseHeightDistrict(projectData?.heightDistrict);

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        法令情報
      </Typography>
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
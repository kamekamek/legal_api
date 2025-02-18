import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { YOUTO_MAPPING, BOUKA_MAPPING, ZONE_DIVISION_MAPPING } from '../../../constants/zoneTypes';
import { parseHeightDistrict, parseScenicDistrict } from '../../../constants/zoneTypes';

const InfoRow = ({ label, value }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      borderBottom: '1px solid #eee', 
      py: 1.5,
      '&:last-child': {
        borderBottom: 'none'
      }
    }}>
      <Typography 
        component="div" 
        sx={{ 
          width: '35%', 
          color: 'text.secondary',
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      <Typography 
        component="div" 
        sx={{ 
          width: '65%',
          whiteSpace: 'pre-line'
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

const ZoneInfoDisplay = ({ address, landUseInfo }) => {
  return (
    <Paper 
      elevation={3}
      sx={{ 
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'white',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ 
        p: 3,
        width: '100%'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 4, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            flex: '1 1 400px',
            maxWidth: '100%'
          }}>
            <Box sx={{ 
              display: 'grid', 
              gap: 2,
              width: '100%'
            }}>
              <InfoRow label="所在地" value={address} />
              <InfoRow 
                label="用途地域" 
                value={landUseInfo?.type ? YOUTO_MAPPING[landUseInfo.type] || '−' : '−'} 
              />
              <InfoRow 
                label="防火地域" 
                value={landUseInfo?.fireArea ? BOUKA_MAPPING[landUseInfo.fireArea] || '−' : '−'} 
              />
              <InfoRow 
                label="建蔽率" 
                value={landUseInfo?.buildingCoverageRatio ? `${landUseInfo.buildingCoverageRatio}%` : '−'} 
              />
              <InfoRow 
                label="建蔽率（制限値）" 
                value={landUseInfo?.buildingCoverageRatio2 ? `${landUseInfo.buildingCoverageRatio2}%` : '−'} 
              />
              <InfoRow 
                label="容積率" 
                value={landUseInfo?.floorAreaRatio ? `${landUseInfo.floorAreaRatio}%` : '−'} 
              />
              <InfoRow 
                label="高度地区" 
                value={landUseInfo?.heightDistrict ? (() => {
                  const height = parseHeightDistrict(landUseInfo.heightDistrict);
                  if (!height) return '−';
                  return height.join('\n');
                })() : '−'} 
              />
              <InfoRow 
                label="高度地区（制限値）" 
                value={landUseInfo?.heightDistrict2 ? (() => {
                  const height = parseHeightDistrict(landUseInfo.heightDistrict2);
                  if (!height) return '−';
                  return height.join('\n');
                })() : '−'} 
              />
              <InfoRow 
                label="区域区分" 
                value={landUseInfo?.zoneMap ? (() => {
                  const parts = landUseInfo.zoneMap.split(':');
                  return ZONE_DIVISION_MAPPING[parts[0]] || '−';
                })() : '−'} 
              />
              <InfoRow 
                label="風致地区" 
                value={(() => {
                  const scenic = parseScenicDistrict(landUseInfo?.f_meisho, landUseInfo?.f_shu);
                  if (!scenic) return '−';
                  return [
                    scenic.name,
                    scenic.type && `第${scenic.type}種`
                  ].filter(Boolean).join(' ');
                })()} 
              />
              <InfoRow label="建築基準法48条" value="準備中" />
              <InfoRow label="法別表第２" value="準備中" />
              <InfoRow label="告示文" value="準備中" />
              <InfoRow label="東京都建築安全条例" value="準備中" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ZoneInfoDisplay; 
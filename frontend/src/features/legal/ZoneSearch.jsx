import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  IconButton,
  Container,
  Box,
  Typography,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import {
  YOUTO_MAPPING,
  BOUKA_MAPPING,
  TOKEI_MAPPING,
  parseHeightDistrict,
  parseZoneMap,
  parseScenicDistrict,
  parseRatios,
  ZONE_DIVISION_MAPPING
} from '../../constants/zoneTypes';

const ZoneSearch = () => {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [landUseInfo, setLandUseInfo] = useState(null);
  const [error, setError] = useState('');
  const [kokujiInfo, setKokujiInfo] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // 地図の初期化
    if (mapRef.current && !mapInstanceRef.current && window.ZMALoader) {
      window.ZMALoader.setOnLoad((mapOptions, error) => {
        if (error) {
          console.error('Map initialization error:', error);
          setError('地図の初期化に失敗しました');
          return;
        }

        try {
          // 初期位置（東京駅）
          const lat = 35.681406;
          const lng = 139.767132;

          // MapOptionsを設定
          mapOptions.center = new window.ZDC.LatLng(lat, lng);
          mapOptions.zoom = 14;
          mapOptions.auth = 'referer';
          mapOptions.types = ['base'];
          mapOptions.mouseWheelReverseZoom = true;

          // 地図を生成
          mapInstanceRef.current = new window.ZDC.Map(
            mapRef.current,
            mapOptions,
            () => {
              // Success callback
              console.log('Map initialized successfully');
              mapInstanceRef.current.addControl(new window.ZDC.ZoomButton('bottom-right'));
              mapInstanceRef.current.addControl(new window.ZDC.Compass('top-right'));
              mapInstanceRef.current.addControl(new window.ZDC.ScaleBar('bottom-left'));
            },
            () => {
              // Failure callback
              console.error('Map creation failed');
              setError('地図の作成に失敗しました');
            }
          );
        } catch (e) {
          console.error('Map creation error:', e);
          setError('地図の作成に失敗しました');
        }
      });
    }
  }, []);

  const handleSearch = async () => {
    try {
      setError('');
      
      if (!address) {
        setError('住所を入力してください');
        return;
      }

      // 住所検索APIを呼び出し
      const response = await fetch('https://test-web.zmaps-api.com/search/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': import.meta.env.VITE_ZENRIN_API_KEY,
          'Authorization': 'referer'
        },
        body: new URLSearchParams({
          word: address,
          word_match_type: '3'
        })
      });

      if (!response.ok) {
        throw new Error(`検索に失敗しました: ${response.status}`);
      }

      const data = await response.json();
      console.log('検索結果:', data);

      if (data.status === "OK" && data.result.info.hit > 0) {
        const item = data.result.item[0];
        const [lng, lat] = item.position;

        const newLocation = { lat, lng };
        setLocation(newLocation);

        if (mapInstanceRef.current) {
          // 地図の更新
          const latLng = new window.ZDC.LatLng(lat, lng);
          mapInstanceRef.current.setCenter(latLng);
          mapInstanceRef.current.setZoom(16);

          // 既存のマーカーを削除
          if (markerRef.current) {
            mapInstanceRef.current.removeWidget(markerRef.current);
          }

          // 新しいマーカーを作成
          markerRef.current = new window.ZDC.Marker(latLng);
          mapInstanceRef.current.addWidget(markerRef.current);
        }

        // 用途地域情報の取得
        const landUseResponse = await axios.get('http://localhost:3001/api/landuse', {
          params: newLocation
        });
        
        // APIレスポンスの詳細ログ
        console.log('APIリクエスト:', {
          lat: newLocation.lat,
          lng: newLocation.lng
        });
        
        console.log('API Response:', {
          ...landUseResponse.data,
          高度地区: landUseResponse.data.koudo,
          高度地区制限値: landUseResponse.data.koudo2
        });
        
        setLandUseInfo(landUseResponse.data);
      } else {
        throw new Error('住所が見つかりませんでした');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('検索中にエラーが発生しました。' + (error.message || ''));
    }
  };

  const fetchKokujiInfo = async (kokujiId) => {
    try {
      setError('');
      const response = await axios.get(`http://localhost:3001/api/kokuji/${kokujiId}`);
      if (response.data.status === 'success') {
        setKokujiInfo(response.data.data);
      } else {
        throw new Error(response.data.message || '告示文の取得に失敗しました');
      }
    } catch (error) {
      console.error('告示文取得エラー:', error);
      setError('告示文の取得に失敗しました。' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    if (landUseInfo?.kokujiId) {
      fetchKokujiInfo(landUseInfo.kokujiId);
    } else {
      setKokujiInfo(null);
    }
  }, [landUseInfo?.kokujiId]);

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

  return (
    <Box sx={{ 
      bgcolor: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Container 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '800px !important',
          p: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          用途地域検索
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          住所を入力して地図と用途地域情報を確認できます
        </Typography>

        <Box sx={{ 
          width: '100%',
          position: 'relative',
          paddingTop: '56.25%',
          mb: 4,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 1
        }}>
          <Box
            ref={mapRef}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          bgcolor: 'white',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 1,
          mb: 4
        }}>
          <TextField
            fullWidth
            placeholder="住所を入力（例：東京都千代田区丸の内1丁目）"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-input': {
                p: 2,
              }
            }}
          />
          <IconButton 
            onClick={handleSearch}
            sx={{ 
              bgcolor: '#1a237e',
              borderRadius: 1,
              color: 'white',
              m: 1,
              '&:hover': {
                bgcolor: '#000051'
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {landUseInfo && (
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
                    <InfoRow label="用途地域" value={landUseInfo?.type ? YOUTO_MAPPING[landUseInfo.type] || '−' : '−'} />
                    <InfoRow label="防火地域" value={landUseInfo?.fireArea ? BOUKA_MAPPING[landUseInfo.fireArea] || '−' : '−'} />
                    <InfoRow label="建蔽率" value={landUseInfo?.buildingCoverageRatio ? `${landUseInfo.buildingCoverageRatio}%` : '−'} />
                    <InfoRow label="建蔽率（制限値）" value={landUseInfo?.buildingCoverageRatio2 ? `${landUseInfo.buildingCoverageRatio2}%` : '−'} />
                    <InfoRow label="容積率" value={landUseInfo?.floorAreaRatio ? `${landUseInfo.floorAreaRatio}%` : '−'} />
                    <InfoRow label="高度地区" value={landUseInfo?.heightDistrict ? (() => {
                      const height = parseHeightDistrict(landUseInfo.heightDistrict);
                      if (!height) return '−';
                      return height.join('\n');
                    })() : '−'} />
                    <InfoRow label="高度地区（制限値）" value={landUseInfo?.heightDistrict2 ? (() => {
                      const height = parseHeightDistrict(landUseInfo.heightDistrict2);
                      if (!height) return '−';
                      return height.join('\n');
                    })() : '−'} />
                    <InfoRow label="区域区分" value={landUseInfo?.zoneMap ? (() => {
                      const parts = landUseInfo.zoneMap.split(':');
                      return ZONE_DIVISION_MAPPING[parts[0]] || '−';
                    })() : '−'} />
                    <InfoRow label="風致地区" value={(() => {
                      const scenic = parseScenicDistrict(landUseInfo?.f_meisho, landUseInfo?.f_shu);
                      if (!scenic) return '−';
                      return [
                        scenic.name,
                        scenic.type && `第${scenic.type}種`
                      ].filter(Boolean).join(' ');
                    })()} />
                    <InfoRow label="建築基準法48条" value="準備中" />
                    <InfoRow label="法別表第２" value="準備中" />
                    <InfoRow 
                      label="告示文" 
                      value={kokujiInfo ? kokujiInfo.kokuji_text : '−'} 
                    />
                    <InfoRow label="東京都建築安全条例" value="準備中" />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ZoneSearch; 
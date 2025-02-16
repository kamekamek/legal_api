import { useState, useEffect, useRef } from 'react'
import { TextField, IconButton, Container, Box, Typography, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import axios from 'axios'

function App() {
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState(null)
  const [landUseInfo, setLandUseInfo] = useState(null)
  const [error, setError] = useState('')
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

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
          const initialLat = 35.681236;
          const initialLng = 139.767125;

          // 地図オプションの設定
          mapOptions.center = new window.ZDC.LatLng(initialLat, initialLng);
          mapOptions.zoom = 11;

          // 地図を生成
          mapInstanceRef.current = new window.ZDC.Map(
            mapRef.current,
            mapOptions,
            () => {
              // 成功時のコールバック
              // コントロールを追加
              mapInstanceRef.current.addControl(new window.ZDC.ZoomButton('top-left'));
              mapInstanceRef.current.addControl(new window.ZDC.Compass('top-right'));
              mapInstanceRef.current.addControl(new window.ZDC.ScaleBar('bottom-left'));
            },
            () => {
              // 失敗時のコールバック
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

      if (!window.ZDC) {
        setError('地図APIの初期化に失敗しました');
        return;
      }

      // 住所検索
      const searchResult = await new Promise((resolve, reject) => {
        const search = new window.ZDC.Search();
        search.getLatLonByAddr({
          address: address,
          success: function(result) {
            resolve(result);
          },
          error: function(error) {
            reject(new Error('住所検索に失敗しました'));
          }
        });
      });

      if (!searchResult || !searchResult.status || searchResult.status.code !== '000') {
        throw new Error('住所が見つかりませんでした');
      }

      const newLocation = {
        lat: searchResult.latlon.lat,
        lng: searchResult.latlon.lon
      };
      setLocation(newLocation);

      // 地図の更新
      const latlon = new window.ZDC.LatLng(newLocation.lat, newLocation.lng);
      mapInstanceRef.current.setCenter(latlon);
      mapInstanceRef.current.setZoom(16);

      // マーカーの更新
      if (markerRef.current) {
        mapInstanceRef.current.removeWidget(markerRef.current);
      }
      markerRef.current = new window.ZDC.Marker(latlon);
      mapInstanceRef.current.addWidget(markerRef.current);

      // 用途地域情報の取得
      const landUseResponse = await axios.get('http://localhost:3001/api/landuse', {
        params: newLocation
      });
      setLandUseInfo(landUseResponse.data);
    } catch (error) {
      setError('検索中にエラーが発生しました。' + (error.message || ''));
      console.error('Search error:', error);
    }
  };

  return (
    <Box sx={{ 
      bgcolor: '#F5F5F5', 
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            住所検索
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            住所を入力して地図と用途地域情報を確認できます
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            maxWidth: 600,
            mx: 'auto',
            bgcolor: 'white',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 1
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
        </Box>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Paper 
          elevation={3}
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'white'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {/* 地図 */}
              <Box sx={{ flex: '1 1 400px', minHeight: 300 }}>
                <div ref={mapRef} style={{ width: '100%', height: '300px' }}></div>
              </Box>

              {/* 法規制情報 */}
              <Box sx={{ flex: '1 1 400px' }}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <InfoRow label="所在地" value={address} />
                  <InfoRow label="用途地域" value={landUseInfo?.type || '−'} />
                  <InfoRow label="防火地域" value={landUseInfo?.fireArea || '−'} />
                  <InfoRow label="建蔽率" value={landUseInfo?.buildingCoverageRatio ? `${landUseInfo.buildingCoverageRatio}%` : '−'} />
                  <InfoRow label="容積率" value={landUseInfo?.floorAreaRatio ? `${landUseInfo.floorAreaRatio}%` : '−'} />
                  <InfoRow label="建築基準法48条" value="準備中" />
                  <InfoRow label="法別表第２" value="準備中" />
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ 
      display: 'flex',
      borderBottom: '1px solid #eee',
      py: 2
    }}>
      <Typography sx={{ 
        width: 120,
        color: 'text.secondary',
        fontWeight: 500
      }}>
        {label}
      </Typography>
      <Typography sx={{ flex: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default App

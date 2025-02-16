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
        setLandUseInfo(landUseResponse.data);
      } else {
        throw new Error('住所が見つかりませんでした');
      }
    } catch (error) {
      setError('検索中にエラーが発生しました。' + (error.message || ''));
      console.error('Search error:', error);
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px'
  }

  const searchBoxStyle = {
    width: '100%',
    maxWidth: '600px',
    marginBottom: '20px'
  }

  const mapContainerStyle = {
    width: '100%',
    maxWidth: '800px',
    height: '500px',
    position: 'relative'
  }

  return (
    <Box sx={containerStyle}>
      <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: '800px' }}>
        <Box sx={searchBoxStyle}>
          <TextField
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="住所を入力（例：東京都千代田区丸の内）"
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
        
        <Box sx={mapContainerStyle}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {landUseInfo && (
          <Box sx={{ mt: 2 }}>
            <InfoRow label="所在地" value={landUseInfo.address || '-'} />
            <InfoRow label="用途地域" value={landUseInfo.landUse || '-'} />
            <InfoRow label="防火地域" value={landUseInfo.firePreventionZone || '-'} />
            <InfoRow label="建蔽率" value={landUseInfo.buildingCoverageRatio ? `${landUseInfo.buildingCoverageRatio}%` : '-'} />
            <InfoRow label="容積率" value={landUseInfo.floorAreaRatio ? `${landUseInfo.floorAreaRatio}%` : '-'} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ 
      display: 'flex',
      borderBottom: '1px solid #eee',
      py: 2,
      width: '100%'
    }}>
      <Typography sx={{ 
        minWidth: 150,
        color: 'text.secondary',
        fontWeight: 500
      }}>
        {label}
      </Typography>
      <Typography sx={{ 
        flex: 1,
        pl: 2
      }}>
        {value}
      </Typography>
    </Box>
  );
}

export default App

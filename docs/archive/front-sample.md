```
import { useState, useEffect, useRef } from 'react'
import { TextField, IconButton, Container, Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { YOUTO_MAPPING, BOUKA_MAPPING, TOKEI_MAPPING, parseHeightDistrict, parseZoneMap, parseScenicDistrict, parseRatios, ZONE_DIVISION_MAPPING } from './constants/zoneTypes';

// コンポーネントをApp関数の外に移動
const KokujiDialog = ({ open, onClose, kokujiText }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>
        告示文
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ 
          fontFamily: 'serif',
          fontSize: '1.1rem',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          overflowY: 'auto',
          padding: 2
        }}>
          {kokujiText}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

function App() {
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState(null)
  const [landUseInfo, setLandUseInfo] = useState(null)
  const [error, setError] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const youtoOverlayRef = useRef(null)
  const [youtoVisible, setYoutoVisible] = useState(false)
  const [balloon, setBalloon] = useState(null)
  const [currentZoom, setCurrentZoom] = useState(17)
  const [kokujiText, setKokujiText] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false);

  // 固定の告示ID
  const FIXED_KOKUJI_ID = '412K500040001453';

  useEffect(() => {
    // 初期表示時に告示文を取得
    fetchKokujiText(FIXED_KOKUJI_ID);
  }, []); // コンポーネントマウント時のみ実行

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
              mapInstanceRef.current.addControl(new window.ZDC.ZoomButton('top-left'));
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

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    const setYouto = () => {
      const map = mapInstanceRef.current;
      
      // バルーンを削除
      if (balloon) {
        map.removeWidget(balloon);
        setBalloon(null);
      }

      // 既存の用途地域オーバーレイを削除
      if (youtoOverlayRef.current) {
        map.removeWidget(youtoOverlayRef.current);
        youtoOverlayRef.current = null;
      }

      const size = map.getMapSize();
      const zoom = map.getZoom();
      setCurrentZoom(zoom);

      // ズームレベルが15未満の場合は表示しない
      if (zoom < 15) {
        return;
      }

      const data = {
        'VERSION': '1.3.0',
        'REQUEST': 'GetMap',
        'LAYERS': zoom >= 17 ? 'lp1,ll1' : 'lp1',
        'CRS': 'EPSG:3857',
        'BBOX': getBBOX(map),
        'WIDTH': size.width,
        'HEIGHT': size.height,
        'FORMAT': 'image/png',
        'INFO_FORMAT': 'application/json'
      };

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://test-web.zmaps-api.com/map/wms/youto');
      xhr.setRequestHeader('x-api-key', '4ljryyuYKp3pdOu0ipaSinCXdrZbY1wSSnqILF30');
      xhr.setRequestHeader('Authorization', 'referer');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.responseType = 'blob';
      
      xhr.onload = function() {
        if (this.status === 200) {
          const widget = new window.ZDC.UserWidget(
            map.getLatLngBounds().getNorthWest(),
            {
              htmlSource: '<img id="youto" src="">',
              propagation: true
            }
          );
          map.addWidget(widget);
          youtoOverlayRef.current = widget; // 参照を保存

          const url = window.URL || window.webkitURL;
          const img = document.getElementById("youto");
          img.src = url.createObjectURL(this.response);
        }
      };
      xhr.send(encodeData(data));
    };

    const getFeatureInfo = (ev) => {
      const zoom = map.getZoom();
      // ズームレベルが15未満の場合は情報を表示しない
      if (zoom < 15) {
        return;
      }

      const size = map.getMapSize();
      const data = {
        'VERSION': '1.3.0',
        'REQUEST': 'GetFeatureInfo',
        'LAYERS': zoom >= 17 ? 'lp1,ll1' : 'lp1',
        'QUERY_LAYERS': zoom >= 17 ? 'lp1,ll1' : 'lp1',
        'CRS': 'EPSG:3857',
        'BBOX': getBBOX(map),
        'WIDTH': size.width,
        'HEIGHT': size.height,
        'FORMAT': 'image/png',
        'INFO_FORMAT': 'application/json',
        'FEATURE_COUNT': 1,
        'I': ev.point.x,
        'J': ev.point.y,
      };

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://test-web.zmaps-api.com/map/wms/youto');
      xhr.setRequestHeader('x-api-key', '4ljryyuYKp3pdOu0ipaSinCXdrZbY1wSSnqILF30');
      xhr.setRequestHeader('Authorization', 'referer');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.responseType = 'json';
      
      xhr.onload = function() {
        if (this.status === 200 && this.response && this.response.features && this.response.features.length > 0) {
          if (balloon) {
            map.removeWidget(balloon);
          }

          const feature = this.response.features[0];
          if (feature.properties) {
            const newBalloon = new window.ZDC.UserWidget(
              new window.ZDC.LatLng(ev.latlng.lat, ev.latlng.lng),
              {
                htmlSource: `<div class="balloon"><p>${feature.properties.map || ''} ${feature.properties.koudo || ''}</p></div>`,
                propagation: true
              }
            );
            map.addWidget(newBalloon);
            setBalloon(newBalloon);
          }
        }
      };

      xhr.onerror = function() {
        console.error('用途地域情報の取得に失敗しました');
      };

      xhr.send(encodeData(data));
    };

    const redrawLayer = () => {
      if (youtoVisible) {
        setYouto();
      }
    };

    map.addEventListener('idle', redrawLayer);
    map.addEventListener('click', async (e) => {
      try {
        // 既存のマーカーがある場合は削除（他のウィジェットは保持）
        if (markerRef.current) {
          map.removeWidget(markerRef.current);
        }

        // クリックされた座標を取得（ZDCマップの形式に合わせて修正）
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // 新しいマーカーを作成
        markerRef.current = new window.ZDC.Marker(new window.ZDC.LatLng(lat, lng));
        map.addWidget(markerRef.current);

        // 用途地域情報の取得
        const landUseResponse = await axios.get('http://localhost:3001/api/landuse', {
          params: {
            lat: lat,
            lng: lng
          }
        });

        setLandUseInfo(landUseResponse.data);
        
        // APIレスポンスの詳細ログ
        console.log('APIリクエスト:', {
          lat: lat,
          lng: lng
        });
        
        console.log('API Response:', {
          ...landUseResponse.data,
          高度地区: landUseResponse.data.koudo,
          高度地区制限値: landUseResponse.data.koudo2
        });
        
        setLandUseInfo(landUseResponse.data);
      } catch (error) {
        console.error('Search error:', error);
        setError('検索中にエラーが発生しました。' + (error.message || ''));
      }
    });

    return () => {
      map.removeEventListener('idle', redrawLayer);
      map.removeEventListener('click');
    };
  }, [youtoVisible]);

  const getBBOX = (map) => {
    const bound = map.getLatLngBounds();
    const p1 = bound.getSouthWest();
    const p2 = bound.getNorthEast();

    const p1Mercator = map.latlngToWebMercator(p1);
    const p2Mercator = map.latlngToWebMercator(p2);
    return p1Mercator.concat(p2Mercator).join(',');
  };

  const encodeData = (data) => {
    const params = [];
    for (const name in data) {
      const value = data[name];
      const param = encodeURIComponent(name) + '=' + encodeURIComponent(value);
      params.push(param);
    }
    return params.join('&').replace(/%20/g, '+');
  };

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (mapInstanceRef.current) {
      // 地図のサイズを再計算
      setTimeout(() => {
        const map = mapInstanceRef.current;
        const container = mapRef.current;
        if (container) {
          // コンテナのスタイルを更新
          container.style.width = '100%';
          container.style.height = '100%';
          // 地図を更新
          map.refreshSize();
        }
      }, 100);
    }
  };

  const fetchKokujiText = async (kokujiId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/kokuji/${kokujiId}`);
      if (response.data.status === 'success') {
        setKokujiText(response.data.data.kokuji_text);
      }
    } catch (error) {
      console.error('告示文取得エラー:', error);
      setKokujiText('取得に失敗しました');
    }
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
          maxWidth: isFullscreen ? '100% !important' : '800px !important',
          p: isFullscreen ? 0 : 2
        }}
      >
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          ...(isFullscreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            bgcolor: 'white'
          } : {})
        }}>
          {!isFullscreen && (
            <>
              <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                用途地域検索
              </Typography>
              <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                住所を入力して地図と用途地域情報を確認できます
              </Typography>
            </>
          )}

          <Box sx={{ 
            width: '100%',
            position: 'relative',
            paddingTop: isFullscreen ? '100vh' : '56.25%', // フルスクリーン時は100vh、通常時は16:9
            ...(isFullscreen ? {
              height: '100vh',
              paddingTop: 0
            } : {
              mb: 4,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 1
            })
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
            {/* 全画面表示時のコントロールパネル */}
            {isFullscreen && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 80,
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxWidth: '400px',
                  width: 'calc(100% - 160px)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  width: '100%',
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
                        bgcolor: 'white'
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

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  width: '100%',
                  bgcolor: 'white',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 1,
                  p: 1
                }}>
                  <div className="form-check form-switch form-switch-custom py-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="youtoSwitch"
                      checked={youtoVisible}
                      onChange={(e) => setYoutoVisible(e.target.checked)}
                      disabled={currentZoom < 15}
                    />
                    <label className="form-check-label" htmlFor="youtoSwitch">
                      用途地域 {currentZoom < 15 && '(ズームインしてください)'}
                    </label>
                  </div>
                </Box>
              </Box>
            )}

            <IconButton
              onClick={toggleFullscreen}
              sx={{
                position: 'absolute',
                top: 16,
                right: 60,
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.8)'
                },
                zIndex: 1
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>

          {!isFullscreen && (
            <>
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
                <div className="form-check form-switch form-switch-custom py-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="youtoSwitch"
                    checked={youtoVisible}
                    onChange={(e) => setYoutoVisible(e.target.checked)}
                    disabled={currentZoom < 15}
                  />
                  <label className="form-check-label" htmlFor="youtoSwitch">
                    用途地域 {currentZoom < 15 && '(ズームインしてください)'}
                  </label>
                </div>
              </Box>
            </>
          )}

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
              bgcolor: 'white',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '100%'  // 最大幅を100%に設定
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
                {/* 法規制情報 */}
                <Box sx={{ 
                  flex: '1 1 100%',  // 幅を100%に変更
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
                      value={
                        kokujiText ? (
                          <Button
                            variant="contained"
                            onClick={() => setDialogOpen(true)}
                            size="small"
                            sx={{ ml: 'auto' }}
                          >
                            告示文を表示
                          </Button>
                        ) : '−'
                      }
                    />
                    <InfoRow label="東京都建築安全条例" value="準備中" />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
      <KokujiDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        kokujiText={kokujiText}
      />
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },  
      borderBottom: '1px solid #eee', 
      py: 1.5,
      '&:last-child': {
        borderBottom: 'none'
      }
    }}>
      <Typography 
        component="div" 
        sx={{ 
          width: { xs: '100%', sm: '25%' },  
          color: 'text.secondary',
          fontWeight: 500,
          mb: { xs: 1, sm: 0 }  
        }}
      >
        {label}
      </Typography>
      <Typography 
        component="div" 
        sx={{ 
          width: { xs: '100%', sm: '75%' },  
          whiteSpace: 'pre-line',
          lineHeight: 1.5,  
          fontSize: 'inherit',  
          letterSpacing: 'inherit',  
          '& > p': {
            marginBottom: 0  
          }
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

```






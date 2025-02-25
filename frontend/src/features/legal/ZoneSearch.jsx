import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  IconButton,
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Fade,
  useMediaQuery,
  useTheme,
  Backdrop
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
import { API_URL } from '../../config/api';

// 告示文ダイアログコンポーネントを汎用的な法令テキストダイアログに変更
const LegalTextDialog = ({ open, onClose, title, content }) => {
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
        {title}
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
          {content}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000; // 1秒

const ErrorDisplay = ({ error, onRetry }) => (
  <Box sx={{ 
    p: 2, 
    bgcolor: 'error.light', 
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    <Typography color="error.dark">
      {error}
    </Typography>
    {onRetry && (
      <Button 
        variant="contained" 
        color="error" 
        size="small" 
        onClick={onRetry}
        sx={{ ml: 2 }}
      >
        再試行
      </Button>
    )}
  </Box>
);

// キャッシュの設定
const CACHE_DURATION = 1000 * 60 * 5; // 5分
const cache = new Map();

// ヘルプダイアログコンポーネント
const HelpDialog = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      地図の使い方
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>基本操作</Typography>
        <Typography paragraph>
          • ズーム: マウスホイールまたは画面左上のボタン<br />
          • 移動: ドラッグまたは矢印キー<br />
          • 地点選択: クリック
        </Typography>
        <Typography variant="h6" gutterBottom>用途地域の表示</Typography>
        <Typography paragraph>
          • ズームレベル15以上で用途地域を表示可能<br />
          • 右上のスイッチで表示/非表示を切り替え
        </Typography>
        <Typography variant="h6" gutterBottom>情報の取得</Typography>
        <Typography>
          • 地点をクリックして法令情報を取得<br />
          • 住所検索で特定の場所を検索<br />
          • 取得した情報はプロジェクトに保存可能
        </Typography>
      </Box>
    </DialogContent>
  </Dialog>
);

// ローディングコンポーネント
const LoadingOverlay = ({ message }) => (
  <Backdrop
    sx={{
      color: '#fff',
      zIndex: (theme) => theme.zIndex.drawer + 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}
    open={true}
  >
    <CircularProgress color="inherit" />
    <Typography>{message}</Typography>
  </Backdrop>
);

// sleepユーティリティ関数の追加
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchBuildingRegulations = async (youtoType) => {
  try {
    console.log('建築規制情報取得開始:', { youtoType, targetArea: YOUTO_MAPPING[youtoType] });
    
    if (!youtoType || !YOUTO_MAPPING[youtoType]) {
      console.warn('用途地域情報が不正です:', youtoType);
      return {
        '建築基準法第48条本文': null,
        '法別表第2本文': null
      };
    }
    
    const response = await axios.get('https://script.google.com/macros/s/AKfycbxI3QyrADAp4PbSssg1QFbdlgQEYOVFrnmCjCjc9I55QOTJHz3LHLzTCUAsDhfvTAH8ng/exec', {
      params: {
        targetArea: YOUTO_MAPPING[youtoType]
      },
      timeout: 10000 // 10秒でタイムアウト
    });
    
    console.log('建築規制情報取得レスポンス:', response.data);
    
    if (!response.data) {
      return {
        '建築基準法第48条本文': null,
        '法別表第2本文': null
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('建築規制情報の取得に失敗しました:', error);
    return {
      '建築基準法第48条本文': null,
      '法別表第2本文': null
    };
  }
};

const ZoneSearch = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [landUseInfo, setLandUseInfo] = useState(null);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [youtoVisible, setYoutoVisible] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(17);
  const [kokujiText, setKokujiText] = useState(null);
  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    content: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const youtoOverlayRef = useRef(null);
  const [balloon, setBalloon] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastAction, setLastAction] = useState(null);
  const [loading, setLoading] = useState({ status: false, message: '' });
  const [helpOpen, setHelpOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const debounceTimeout = useRef(null);
  const [buildingRegulations, setBuildingRegulations] = useState(null);

  // APIリクエストの最適化
  const fetchWithCache = async (key, fetchFn) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const data = await fetchFn();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  };

  // 検索処理の最適化
  const debouncedSearch = (searchTerm) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
  };

  const handleError = async (error, action, retryFn) => {
    console.error(`Error during ${action}:`, error);
    
    let errorMessage = '';
    if (error.response) {
      // APIからのエラーレスポンス
      switch (error.response.status) {
        case 400:
          errorMessage = '入力内容が正しくありません';
          break;
        case 401:
          errorMessage = 'APIキーが無効です';
          break;
        case 404:
          errorMessage = '指定された情報が見つかりませんでした';
          break;
        case 429:
          errorMessage = 'リクエストが多すぎます。しばらく待ってから再試行してください';
          break;
        case 500:
          errorMessage = 'サーバーエラーが発生しました';
          break;
        default:
          errorMessage = `エラーが発生しました (${error.response.status})`;
      }
    } else if (error.request) {
      // リクエストは送信されたがレスポンスが受信できない
      errorMessage = 'サーバーからの応答がありません';
    } else {
      // リクエストの作成中にエラーが発生
      errorMessage = error.message || 'エラーが発生しました';
    }

    if (retryCount < MAX_RETRY_COUNT && retryFn) {
      setError(`${errorMessage} - 再試行中... (${retryCount + 1}/${MAX_RETRY_COUNT})`);
      setLastAction({ action, retryFn });
      setRetryCount(prev => prev + 1);
      await sleep(RETRY_DELAY);
      await retryFn();
    } else {
      setError(errorMessage);
    }
  };

  const handleSearch = async () => {
    try {
      setError('');
      setRetryCount(0);
      setLoading({ status: true, message: '住所を検索中...' });
      
      if (!address) {
        setError('住所を入力してください');
        setLoading({ status: false, message: '' });
        return;
      }

      const searchFn = async () => {
        const cacheKey = `address_${address}`;
        const searchResult = await fetchWithCache(cacheKey, async () => {
          const response = await fetch('https://test-web.zmaps-api.com/search/address', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-api-key': import.meta.env.VITE_ZENRIN_API_KEY || 'test-api-key',
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

          return response.json();
        });

        if (searchResult.status === "OK" && searchResult.result.info.hit > 0) {
          const item = searchResult.result.item[0];
          const [lng, lat] = item.position;
          return { lat, lng };
        } else {
          throw new Error('住所が見つかりませんでした');
        }
      };

      const locationData = await searchFn();
      setLocation(locationData);
      setLoading({ status: true, message: '地図を更新中...' });

      if (mapInstanceRef.current) {
        const latLng = new window.ZDC.LatLng(locationData.lat, locationData.lng);
        mapInstanceRef.current.setCenter(latLng);
        mapInstanceRef.current.setZoom(16);

        if (markerRef.current) {
          mapInstanceRef.current.removeWidget(markerRef.current);
        }

        markerRef.current = new window.ZDC.Marker(latLng);
        mapInstanceRef.current.addWidget(markerRef.current);

        setLoading({ status: true, message: '法令情報を取得中...' });
        await fetchLandUseInfo(locationData.lat, locationData.lng);
      }
    } catch (error) {
      await handleError(error, 'search', handleSearch);
    } finally {
      setLoading({ status: false, message: '' });
    }
  };

  const fetchLandUseInfo = async (lat, lng) => {
    try {
      console.log('用途地域情報取得開始:', { lat, lng });
      
      const response = await axios.get(`${API_URL}/api/v1/legal/landuse`, {
        params: { lat, lng },
        timeout: 10000 // 10秒でタイムアウト
      });

      console.log('用途地域情報取得レスポンス:', response.data);
      
      // レスポンスデータの確認
      if (!response.data) {
        setError('用途地域情報の取得に失敗しました');
        return;
      }
      
      setLandUseInfo(response.data);
      
      // 用途地域情報が取得できた場合、建築規制情報も取得
      if (response.data.type) {
        try {
          const regulations = await fetchBuildingRegulations(response.data.type);
          setBuildingRegulations(regulations);
        } catch (error) {
          console.error('建築規制情報の取得に失敗しました:', error);
          setError('建築規制情報の取得に失敗しました');
        }
      } else {
        console.warn('用途地域情報が取得できませんでした');
        setBuildingRegulations({
          '建築基準法第48条本文': null,
          '法別表第2本文': null
        });
      }
      
      // 固定の告示ID「412K500040001453」で告示文を取得する
      try {
        const kokujiId = '412K500040001453';
        console.log('告示文取得開始:', { kokujiId });
        await fetchKokujiText(kokujiId);
      } catch (error) {
        console.error('告示文取得エラー:', error);
        setError('告示文の取得に失敗しました');
      }
    } catch (error) {
      console.error('用途地域情報取得エラー:', error);
      setError('用途地域情報の取得に失敗しました');
      
      // エラー時にも空のデータをセットして表示を更新
      setLandUseInfo(null);
      setBuildingRegulations({
        '建築基準法第48条本文': null,
        '法別表第2本文': null
      });
    }
  };

  const fetchKokujiText = async (kokujiId) => {
    try {
      console.log('告示文取得開始:', { kokujiId });
      
      // kokuji_idの形式を確認
      if (!kokujiId.match(/^412[A-Z][0-9]{12}$/)) {
        console.error('不正な告示ID形式:', kokujiId);
        setKokujiText('告示IDの形式が不正です');
        return;
      }

      const response = await axios.get(`${API_URL}/api/v1/kokuji/${kokujiId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10秒でタイムアウト
      });

      console.log('告示文取得レスポンス:', response.data);
      
      if (response.data.status === 'success' && response.data.data?.kokuji_text) {
        setKokujiText(response.data.data.kokuji_text);
      } else {
        console.warn('告示文データが不正:', response.data);
        setKokujiText(response.data.error || '告示文の取得に失敗しました');
      }
    } catch (error) {
      console.error('告示文取得エラー:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      let errorMessage = '告示文の取得に失敗しました';
      if (error.code === 'ECONNABORTED') {
        errorMessage = '告示文の取得がタイムアウトしました';
      } else if (error.response?.status === 404) {
        errorMessage = '指定された告示文が見つかりませんでした';
      }

      setKokujiText(errorMessage);
      setError(errorMessage);
    }
  };

  const handleRetry = async () => {
    if (lastAction) {
      setError('');
      await lastAction.retryFn();
    }
  };

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
    console.log('Map instance:', map); // デバッグログ追加
    
    const setYouto = () => {
      console.log('setYouto called, youtoVisible:', youtoVisible); // デバッグログ追加
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
      console.log('Current zoom level:', zoom); // デバッグログ追加

      // ズームレベルが15未満の場合は表示しない
      if (zoom < 15) {
        console.log('Zoom level too low, not displaying youto'); // デバッグログ追加
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
      console.log('WMS request data:', data); // デバッグログ追加

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://test-web.zmaps-api.com/map/wms/youto');
      xhr.setRequestHeader('x-api-key', import.meta.env.VITE_ZENRIN_API_KEY);
      xhr.setRequestHeader('Authorization', 'referer');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.responseType = 'blob';
      
      xhr.onload = function() {
        console.log('WMS response status:', this.status); // デバッグログ追加
        if (this.status === 200) {
          const widget = new window.ZDC.UserWidget(
            map.getLatLngBounds().getNorthWest(),
            {
              htmlSource: '<img id="youto" src="">',
              propagation: true
            }
          );
          map.addWidget(widget);
          youtoOverlayRef.current = widget;

          const url = window.URL || window.webkitURL;
          const img = document.getElementById("youto");
          img.src = url.createObjectURL(this.response);
          console.log('Youto overlay added successfully'); // デバッグログ追加
        }
      };
      xhr.send(encodeData(data));
    };

    // イベントリスナーの設定
    console.log('Setting up event listeners'); // デバッグログ追加
    
    const handleIdle = () => {
      console.log('Idle event triggered, youtoVisible:', youtoVisible); // デバッグログ追加
      if (youtoVisible) {
        setYouto();
      }
    };

    const handleClick = async (e) => {
      console.log('Click event triggered at:', e.latlng); // デバッグログ追加
      try {
        if (markerRef.current) {
          map.removeWidget(markerRef.current);
        }

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        markerRef.current = new window.ZDC.Marker(new window.ZDC.LatLng(lat, lng));
        map.addWidget(markerRef.current);

        const landUseResponse = await axios.get(`${API_URL}/api/v1/legal/landuse`, {
          params: {
            lat: lat,
            lng: lng
          }
        });
        console.log('Land use response:', landUseResponse.data); // デバッグログ追加

        setLandUseInfo(landUseResponse.data);

        // 告示文の取得（固定値を使用）
        try {
          const kokujiId = '412K500040001453';
          console.log('告示文取得開始:', { kokuji_id: kokujiId });
          await fetchKokujiText(kokujiId);
        } catch (kokujiError) {
          console.warn('告示文取得エラー:', kokujiError);
          setError('告示文の取得に失敗しました。');
        }
      } catch (error) {
        console.error('Search error:', error);
        setError('検索中にエラーが発生しました。' + (error.message || ''));
      }
    };

    map.addEventListener('idle', handleIdle);
    map.addEventListener('click', handleClick);

    return () => {
      console.log('Cleaning up event listeners'); // デバッグログ追加
      map.removeEventListener('idle', handleIdle);
      map.removeEventListener('click', handleClick);
    };
  }, [youtoVisible, balloon]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (mapInstanceRef.current) {
      // 地図のサイズを再計算（要素のマウント完了を待つ）
      setTimeout(() => {
        const map = mapInstanceRef.current;
        const container = mapRef.current;
        if (container && map) {
          try {
            // コンテナのスタイルを更新
            container.style.width = '100%';
            container.style.height = '100%';
            // 地図を更新（エラーハンドリング追加）
            if (typeof map.refreshSize === 'function') {
              map.refreshSize();
            } else {
              console.warn('map.refreshSize is not available');
            }
          } catch (error) {
            console.error('Map refresh error:', error);
          }
        }
      }, 200); // タイミングを少し遅らせる
    }
  };

  const handleSaveToProject = async () => {
    if (!landUseInfo || !projectId) {
      console.error('保存できません: landUseInfo または projectId が未設定です', { landUseInfo, projectId });
      return;
    }

    try {
      console.log('保存開始: 法令情報データ', landUseInfo);
      console.log('保存開始: 建築規制情報', buildingRegulations);
      
      // APIの期待する形式にデータを変換
      const legalInfoData = {
        type: landUseInfo.type,
        fireArea: landUseInfo.fireArea,
        buildingCoverageRatio: parseFloat(landUseInfo.buildingCoverageRatio),
        buildingCoverageRatio2: parseFloat(landUseInfo.buildingCoverageRatio2),
        floorAreaRatio: parseFloat(landUseInfo.floorAreaRatio),
        heightDistrict: landUseInfo.heightDistrict,
        heightDistrict2: landUseInfo.heightDistrict2,
        zoneMap: landUseInfo.zoneMap,
        scenicZoneName: landUseInfo.scenicZoneName,
        scenicZoneType: landUseInfo.scenicZoneType,
        article48: buildingRegulations ? buildingRegulations['建築基準法第48条本文'] : null,
        appendix2: buildingRegulations ? buildingRegulations['法別表第2本文'] : null,
        safetyOrdinance: null  // 現時点では未実装
      };

      console.log('APIリクエスト用データ:', legalInfoData);
      console.log('APIエンドポイント:', `${API_URL}/api/v1/projects/${projectId}/legal-info`);

      // 法令情報を保存
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/legal-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(legalInfoData),
      });

      const responseData = await response.json();
      console.log('法令情報保存レスポンス:', responseData);
      console.log('レスポンスステータス:', response.status, response.ok);

      if (!response.ok) {
        throw new Error(responseData.error?.message || '法令情報の更新に失敗しました');
      }

      // 告示文を保存（存在する場合）
      if (kokujiText) {
        console.log('告示文保存開始:', { kokuji_id: '412K500040001453' });
        
        const kokujiResponse = await fetch(`${API_URL}/api/v1/projects/${projectId}/kokuji`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kokuji_id: '412K500040001453',  // 固定の告示ID
            kokuji_text: kokujiText,
            memo: '用途地域検索から自動保存'
          }),
        });

        const kokujiResponseData = await kokujiResponse.json();
        console.log('告示文保存レスポンス:', kokujiResponseData);
        console.log('告示文レスポンスステータス:', kokujiResponse.status, kokujiResponse.ok);

        if (!kokujiResponse.ok) {
          console.warn('告示文の保存に失敗しました:', kokujiResponseData);
        }
      }

      setSnackbar({
        open: true,
        message: 'プロジェクトに法令情報を保存しました',
        severity: 'success'
      });

      // 3秒後にプロジェクト詳細画面に戻る
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 3000);
    } catch (error) {
      console.error('法令情報保存エラー:', error);
      setSnackbar({
        open: true,
        message: error.message || '法令情報の保存に失敗しました',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const InfoRow = ({ label, value }) => {
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
  };

  // モバイル向けのスタイル調整
  const mobileStyles = useMemo(() => ({
    searchBox: {
      width: '100%',
      maxWidth: 'none',
      margin: theme.spacing(1)
    },
    mapContainer: {
      height: isMobile ? 'calc(100vh - 120px)' : '100%'
    }
  }), [isMobile, theme]);

  const mapContainerStyle = {
    width: '70%',  // 全画面から70%に変更
    height: '100vh',
    float: 'left'
  };

  const sidePanelStyle = {
    width: '30%',
    height: '100vh',
    float: 'right',
    padding: '20px',
    overflowY: 'auto'
  };

  const handleOpenDialog = (title, content) => {
    setDialogState({
      open: true,
      title,
      content
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      open: false,
      title: '',
      content: ''
    });
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', p: 0 }}>
      <Box sx={{ 
        position: 'relative', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ヘッダー部分 */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate(`/projects/${projectId}`)}
              aria-label="戻る"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">用途地域検索</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="ヘルプを表示">
              <IconButton onClick={() => setHelpOpen(true)}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            {landUseInfo && projectId && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveToProject}
              >
                プロジェクトに保存
              </Button>
            )}
            <IconButton
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? '全画面解除' : '全画面表示'}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* 検索バーとマップコンテンツ */}
        <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* 検索バー */}
          <Box sx={{ 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              width: '100%',
              maxWidth: '600px',
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
              maxWidth: '600px',
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

          {/* マップ */}
          <Box sx={{ 
            flex: 1,
            position: 'relative',
            height: isFullscreen ? '100vh' : 'calc(100vh - 250px)',
            minHeight: '400px',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 1,
            mb: 2
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

          {error && (
            <Box sx={{ mb: 2 }}>
              <ErrorDisplay 
                error={error} 
                onRetry={retryCount < MAX_RETRY_COUNT ? handleRetry : null} 
              />
            </Box>
          )}

          {/* 法令情報表示部分 */}
          {landUseInfo && (
            <Paper 
              elevation={3}
              sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'white',
                width: '100%',
                mb: 2
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
                        value={landUseInfo?.heightDistrict && landUseInfo.heightDistrict !== '0' ? (() => {
                          const height = parseHeightDistrict(landUseInfo.heightDistrict);
                          if (!height) return '−';
                          return height.join('\n');
                        })() : '−'} 
                      />
                      <InfoRow 
                        label="高度地区（制限値）" 
                        value={landUseInfo?.heightDistrict2 && landUseInfo.heightDistrict2 !== '0' ? (() => {
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
                          const scenic = parseScenicDistrict(landUseInfo?.scenicZoneName, landUseInfo?.scenicZoneType);
                          if (!scenic) return '−';
                          return [
                            scenic.name,
                            scenic.type && `第${scenic.type}種`
                          ].filter(Boolean).join(' ');
                        })()} 
                      />
                      <InfoRow 
                        label="建築基準法48条" 
                        value={
                          buildingRegulations ? (
                            buildingRegulations['建築基準法第48条本文'] ? (
                              <Button
                                variant="contained"
                                onClick={() => handleOpenDialog('建築基準法48条', buildingRegulations['建築基準法第48条本文'])}
                                size="small"
                                sx={{ ml: 'auto' }}
                              >
                                条文を表示
                              </Button>
                            ) : '条文なし'
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                              取得中...
                            </Box>
                          )
                        } 
                      />
                      <InfoRow 
                        label="法別表第２" 
                        value={
                          buildingRegulations ? (
                            buildingRegulations['法別表第2本文'] ? (
                              <Button
                                variant="contained"
                                onClick={() => handleOpenDialog('法別表第2', buildingRegulations['法別表第2本文'])}
                                size="small"
                                sx={{ ml: 'auto' }}
                              >
                                条文を表示
                              </Button>
                            ) : '条文なし'
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                              取得中...
                            </Box>
                          )
                        } 
                      />
                      <InfoRow 
                        label="告示文" 
                        value={
                          kokujiText ? (
                            <Button
                              variant="contained"
                              onClick={() => handleOpenDialog('告示文', kokujiText)}
                              size="small"
                              sx={{ ml: 'auto' }}
                            >
                              告示文を表示
                            </Button>
                          ) : '−'
                        }
                      />
                      <InfoRow 
                        label="東京都建築安全条例" 
                        value={
                          <Button
                            variant="contained"
                            onClick={() => handleOpenDialog('東京都建築安全条例', '準備中')}
                            size="small"
                            sx={{ ml: 'auto' }}
                          >
                            条文を表示
                          </Button>
                        } 
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        {/* ローディング表示 */}
        {loading.status && <LoadingOverlay message={loading.message} />}

        {/* ヘルプダイアログ */}
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

        {/* スナックバー */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* 法令テキストダイアログ */}
        <LegalTextDialog
          open={dialogState.open}
          onClose={handleCloseDialog}
          title={dialogState.title}
          content={dialogState.content}
        />
      </Box>
    </Container>
  );
};

export default ZoneSearch; 
import React, { useEffect, useRef, forwardRef } from 'react';
import { Box } from '@mui/material';

const ZenrinMap = forwardRef(({ location, onMapInitialized }, ref) => {
  const markerRef = useRef(null);

  useEffect(() => {
    // 地図の初期化
    if (ref.current && window.ZMALoader) {
      window.ZMALoader.setOnLoad((mapOptions, error) => {
        if (error) {
          console.error('Map initialization error:', error);
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
          const mapInstance = new window.ZDC.Map(
            ref.current,
            mapOptions,
            () => {
              // Success callback
              console.log('Map initialized successfully');
              mapInstance.addControl(new window.ZDC.ZoomButton('bottom-right'));
              mapInstance.addControl(new window.ZDC.Compass('top-right'));
              mapInstance.addControl(new window.ZDC.ScaleBar('bottom-left'));
              onMapInitialized(mapInstance);
            },
            () => {
              // Failure callback
              console.error('Map creation failed');
            }
          );
        } catch (e) {
          console.error('Map creation error:', e);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (location && window.ZDC && ref.current) {
      const { lat, lng } = location;
      const latLng = new window.ZDC.LatLng(lat, lng);
      
      // 地図の中心を移動
      ref.current.setCenter(latLng);
      ref.current.setZoom(16);

      // 既存のマーカーを削除
      if (markerRef.current) {
        ref.current.removeWidget(markerRef.current);
      }

      // 新しいマーカーを作成
      markerRef.current = new window.ZDC.Marker(latLng);
      ref.current.addWidget(markerRef.current);
    }
  }, [location]);

  return (
    <Box sx={{ 
      width: '100%',
      position: 'relative',
      paddingTop: '56.25%', // 16:9のアスペクト比
      mb: 4,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 1
    }}>
      <Box
        ref={ref}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </Box>
  );
});

ZenrinMap.displayName = 'ZenrinMap';

export default ZenrinMap; 
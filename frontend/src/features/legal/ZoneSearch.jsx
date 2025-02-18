import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  IconButton,
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseHeightDistrict, parseZoneMap, parseScenicDistrict } from '../../constants/zoneTypes';
import ZoneInfoDisplay from './components/ZoneInfoDisplay';
import ZenrinMap from './components/ZenrinMap';
import SearchBar from './components/SearchBar';

const ZoneSearch = () => {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [landUseInfo, setLandUseInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const handleSearch = async () => {
    try {
      setError('');
      setLoading(true);
      
      if (!address) {
        setError('住所を入力してください');
        return;
      }

      // 住所検索APIを呼び出し
      const response = await fetch('http://localhost:3001/api/legal/address/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '検索に失敗しました');
      }

      if (data.location && data.landUseInfo) {
        setLocation(data.location);
        setLandUseInfo(data.landUseInfo);
      } else {
        throw new Error('住所が見つかりませんでした');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || '検索中にエラーが発生しました');
    } finally {
      setLoading(false);
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

        <ZenrinMap 
          ref={mapRef}
          location={location}
          onMapInitialized={(instance) => {
            mapInstanceRef.current = instance;
          }}
        />

        <SearchBar
          address={address}
          onAddressChange={setAddress}
          onSearch={handleSearch}
          error={error}
          loading={loading}
        />

        {landUseInfo && (
          <ZoneInfoDisplay
            address={address}
            landUseInfo={landUseInfo}
          />
        )}
      </Container>
    </Box>
  );
};

export default ZoneSearch; 
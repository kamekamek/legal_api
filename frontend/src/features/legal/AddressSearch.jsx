import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Autocomplete,
  Paper
} from '@mui/material';
import { API_URL } from '../../config/api';

const AddressSearch = ({ onZoneInfoFound }) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddressSearch = async (searchText) => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // ZENRIN APIを使用して住所検索
      const response = await fetch(`${API_URL}/api/v1/legal/address/search?q=${encodeURIComponent(searchText)}`);
      if (!response.ok) {
        throw new Error('住所検索に失敗しました');
      }
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      setError(error.message);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = async (selectedAddress) => {
    if (!selectedAddress) return;

    try {
      setLoading(true);
      setError(null);

      // 選択された住所の用途地域情報を取得
      const response = await fetch(`${API_URL}/api/v1/legal/zone/info?address=${encodeURIComponent(selectedAddress)}`);
      if (!response.ok) {
        throw new Error('用途地域情報の取得に失敗しました');
      }

      const zoneInfo = await response.json();
      onZoneInfoFound(zoneInfo);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" color="primary" gutterBottom>
        住所から用途地域情報を取得
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Autocomplete
          freeSolo
          options={suggestions}
          loading={loading}
          onInputChange={(_, newValue) => {
            setAddress(newValue);
            handleAddressSearch(newValue);
          }}
          onChange={(_, newValue) => handleAddressSelect(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="住所を入力"
              variant="outlined"
              error={!!error}
              helperText={error}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>
    </Paper>
  );
};

export default AddressSearch; 
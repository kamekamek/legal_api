import React from 'react';
import { Box, TextField, IconButton, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ address, onAddressChange, onSearch, error, loading }) => {
  return (
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
          onChange={(e) => onAddressChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading) {
              onSearch();
            }
          }}
          disabled={loading}
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
          onClick={onSearch}
          disabled={loading}
          sx={{ 
            bgcolor: loading ? 'grey.300' : '#1a237e',
            borderRadius: 1,
            color: 'white',
            m: 1,
            '&:hover': {
              bgcolor: loading ? 'grey.300' : '#000051'
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
        </IconButton>
      </Box>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
    </>
  );
};

export default SearchBar; 
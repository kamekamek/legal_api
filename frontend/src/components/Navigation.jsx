import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ホームページにいる場合はナビゲーションを表示しない
  if (location.pathname === '/' || location.pathname === '/projects') {
    return null;
  }

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid #e0e0e0',
        mb: 2,
        backgroundColor: 'white'
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            ホームへ戻る
          </Button>
        </Box>
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          component="div" 
          sx={{ 
            color: 'text.primary',
            fontWeight: 'normal'
          }}
        >
          Legal API
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 
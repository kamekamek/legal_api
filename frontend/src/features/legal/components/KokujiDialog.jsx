import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { API_URL } from '../../../config/api';

const KokujiDialog = ({ kokujiId, open, onClose }) => {
  const [kokujiData, setKokujiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKokujiData = async () => {
      if (!kokujiId || !open) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/v1/kokuji/${kokujiId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '告示文の取得に失敗しました');
        }
        const data = await response.json();
        setKokujiData(data.data);
      } catch (error) {
        console.error('告示文取得エラー:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKokujiData();
  }, [kokujiId, open]);

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : kokujiData ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {kokujiData.title}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              告示ID: {kokujiData.kokuji_id}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              施行日: {kokujiData.effective_date}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              区分: {kokujiData.category}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ 
              fontFamily: 'serif',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              mt: 2
            }}>
              {kokujiData.kokuji_text}
            </Box>
            {kokujiData.related_laws?.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  関連法令
                </Typography>
                {kokujiData.related_laws.map((law, index) => (
                  <Typography key={index} variant="body2" gutterBottom>
                    {law.law_name} {law.article}
                  </Typography>
                ))}
              </>
            )}
          </Box>
        ) : (
          <Typography sx={{ p: 2 }}>
            告示文が見つかりません
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KokujiDialog; 
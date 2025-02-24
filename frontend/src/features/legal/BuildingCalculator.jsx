import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import { API_URL } from '../../config/api';

const BuildingCalculator = ({ projectId, legalInfo }) => {
  const [formData, setFormData] = useState({
    siteArea: '',
    roadWidth: '',
    coverageRatio: legalInfo?.buildingCoverageRatio || '',
    floorAreaRatio: legalInfo?.floorAreaRatio || ''
  });

  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [openHistory, setOpenHistory] = useState(false);

  useEffect(() => {
    if (legalInfo) {
      setFormData(prev => ({
        ...prev,
        coverageRatio: legalInfo.buildingCoverageRatio || prev.coverageRatio,
        floorAreaRatio: legalInfo.floorAreaRatio || prev.floorAreaRatio
      }));
    }
  }, [legalInfo]);

  useEffect(() => {
    fetchCalculationHistory();
  }, [projectId]);

  const fetchCalculationHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/building-calculations`);
      if (!response.ok) throw new Error('計算履歴の取得に失敗しました');
      const data = await response.json();
      setHistory(data.data || []);
    } catch (error) {
      console.error('履歴取得エラー:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/building-calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          zoneType: legalInfo?.type
        }),
      });

      if (!response.ok) throw new Error('計算に失敗しました');
      
      const result = await response.json();
      setCalculationResult(result.data);
      fetchCalculationHistory(); // 履歴を更新
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!calculationResult) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/building-calculations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...calculationResult
        }),
      });

      if (!response.ok) throw new Error('保存に失敗しました');
      
      fetchCalculationHistory();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        建築計算
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="敷地面積 (m²)"
            name="siteArea"
            type="number"
            value={formData.siteArea}
            onChange={handleInputChange}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="前面道路幅員 (m)"
            name="roadWidth"
            type="number"
            value={formData.roadWidth}
            onChange={handleInputChange}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="建ぺい率 (%)"
            name="coverageRatio"
            type="number"
            value={formData.coverageRatio}
            onChange={handleInputChange}
            InputProps={{
              inputProps: { min: 0, max: 100 }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="容積率 (%)"
            name="floorAreaRatio"
            type="number"
            value={formData.floorAreaRatio}
            onChange={handleInputChange}
            InputProps={{
              inputProps: { min: 0, max: 1000 }
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleCalculate}
          startIcon={<CalculateIcon />}
          disabled={loading}
        >
          計算する
        </Button>
        <Button
          variant="outlined"
          onClick={() => setOpenHistory(true)}
          startIcon={<HistoryIcon />}
        >
          計算履歴
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {calculationResult && (
        <Box sx={{ mt: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              計算結果
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  建築可能面積
                </Typography>
                <Typography variant="h6">
                  {calculationResult.buildableArea.toFixed(2)} m²
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  延べ床面積
                </Typography>
                <Typography variant="h6">
                  {calculationResult.totalFloorArea.toFixed(2)} m²
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  道路幅員による制限
                </Typography>
                <Typography variant="h6">
                  {calculationResult.roadWidthLimit.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  実効容積率
                </Typography>
                <Typography variant="h6">
                  {calculationResult.effectiveRatio.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                結果を保存
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Dialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>計算履歴</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日時</TableCell>
                  <TableCell>敷地面積</TableCell>
                  <TableCell>建築可能面積</TableCell>
                  <TableCell>延べ床面積</TableCell>
                  <TableCell>実効容積率</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                    <TableCell>{record.site_area} m²</TableCell>
                    <TableCell>{record.buildable_area} m²</TableCell>
                    <TableCell>{record.total_floor_area} m²</TableCell>
                    <TableCell>{record.effective_ratio}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BuildingCalculator; 
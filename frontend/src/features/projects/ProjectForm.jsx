import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
  Grid
} from '@mui/material';
import { YOUTO_MAPPING } from '../../constants/zoneTypes';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    zoneMap: '',
    heightDistrict: '',
    buildingUsage: ''
  });

  useEffect(() => {
    if (isEditMode) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/projects/${id}`);
      if (!response.ok) {
        throw new Error('プロジェクトの取得に失敗しました');
      }
      const data = await response.json();
      setFormData({
        name: data.name || '',
        description: data.description || '',
        status: data.status || 'planning',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        zoneMap: data.zoneMap || '',
        heightDistrict: data.heightDistrict || '',
        buildingUsage: data.buildingUsage || ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `http://localhost:3001/api/v1/projects/${id}`
        : 'http://localhost:3001/api/v1/projects';
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'プロジェクトの更新に失敗しました' : 'プロジェクトの作成に失敗しました');
      }

      navigate('/projects');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditMode ? 'プロジェクト編集' : '新規プロジェクト作成'}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="プロジェクト名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="説明"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ステータス"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="planning">計画中</MenuItem>
                <MenuItem value="in_progress">進行中</MenuItem>
                <MenuItem value="completed">完了</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="建物用途"
                name="buildingUsage"
                value={formData.buildingUsage}
                onChange={handleChange}
              >
                {Object.entries(YOUTO_MAPPING).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="開始日"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="終了日"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="用途地域情報"
                name="zoneMap"
                value={formData.zoneMap}
                onChange={handleChange}
                helperText="形式: 区域区分:用途地域:建ぺい率:容積率:防火地域"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="高度地区情報"
                name="heightDistrict"
                value={formData.heightDistrict}
                onChange={handleChange}
                helperText="形式: 最高高度:最低高度:最高高度規制:最低高度規制"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {isEditMode ? '更新' : '作成'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                >
                  キャンセル
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm; 
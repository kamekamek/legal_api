import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  CircularProgress
} from '@mui/material';

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
    end_date: ''
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
        end_date: data.end_date || ''
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
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
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
          <TextField
            fullWidth
            label="プロジェクト名"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="説明"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            select
            label="ステータス"
            name="status"
            value={formData.status}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="planning">計画中</MenuItem>
            <MenuItem value="in_progress">進行中</MenuItem>
            <MenuItem value="completed">完了</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="開始日"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="終了日"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
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
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm; 
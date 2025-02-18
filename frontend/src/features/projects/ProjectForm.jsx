import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  FormHelperText
} from '@mui/material';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    address: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

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
          address: data.address || ''
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'プロジェクト名は必須です';
    }
    if (!formData.status) {
      errors.status = 'ステータスは必須です';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = id
        ? `http://localhost:3001/api/v1/projects/${id}`
        : 'http://localhost:3001/api/v1/projects';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('プロジェクトの保存に失敗しました');
      }

      navigate('/projects');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {id ? 'プロジェクト編集' : '新規プロジェクト作成'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="プロジェクト名"
        name="name"
        value={formData.name}
        onChange={handleChange}
        margin="normal"
        error={!!validationErrors.name}
        helperText={validationErrors.name}
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

      <FormControl fullWidth margin="normal" error={!!validationErrors.status}>
        <InputLabel id="status-label">ステータス</InputLabel>
        <Select
          labelId="status-label"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          label="ステータス"
          aria-label="ステータス"
        >
          <MenuItem value="planning">計画中</MenuItem>
          <MenuItem value="in_progress">進行中</MenuItem>
          <MenuItem value="completed">完了</MenuItem>
          <MenuItem value="on_hold">保留中</MenuItem>
        </Select>
        {validationErrors.status && (
          <FormHelperText>{validationErrors.status}</FormHelperText>
        )}
      </FormControl>

      <TextField
        fullWidth
        label="住所"
        name="address"
        value={formData.address}
        disabled
        margin="normal"
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          保存
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/projects')}
          disabled={loading}
        >
          キャンセル
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectForm; 
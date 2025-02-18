import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
  Grid,
  Skeleton,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LegalInfo from '../legal/LegalInfo';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openLegalEditDialog, setOpenLegalEditDialog] = useState(false);
  const [legalInfo, setLegalInfo] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          throw new Error('プロジェクトの取得に失敗しました');
        }
        const { project: projectData } = await response.json();
        
        try {
          const legalResponse = await fetch(`/api/projects/${id}/legal`);
          if (!legalResponse.ok) {
            throw new Error('法令情報の取得に失敗しました');
          }
          const legalInfo = await legalResponse.json();
          setProject({ ...projectData, legalInfo });
        } catch (legalError) {
          console.error('Legal info error:', legalError);
          setProject(projectData);
          setError(legalError.message);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('プロジェクトの削除に失敗しました');
      }
      navigate('/projects');
    } catch (error) {
      setError(error.message);
    }
    setOpenDeleteDialog(false);
  };

  const handleLegalInfoUpdate = async (updatedInfo) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/legal/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInfo),
      });

      if (!response.ok) {
        throw new Error('法令情報の更新に失敗しました');
      }

      const updatedData = await response.json();
      setLegalInfo(updatedData);
      setProject(prev => ({ ...prev, legalInfo: updatedData }));
      setOpenLegalEditDialog(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || '法令情報の更新に失敗しました');
    }
  };

  const handleAddressSearch = async () => {
    if (!project?.location) {
      setError('住所が設定されていません');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v1/legal/zone/info?address=${encodeURIComponent(project.location)}`);
      if (!response.ok) {
        throw new Error('用途地域情報の取得に失敗しました');
      }

      const zoneInfo = await response.json();
      await handleLegalInfoUpdate(zoneInfo);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || '用途地域情報の取得に失敗しました');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'planning':
        return '計画中';
      case 'in_progress':
        return '進行中';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 4 } }}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography>プロジェクトが見つかりませんでした。</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 4 } }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h4" component="h1">
                  {project.name}
                </Typography>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={getStatusColor(project.status)}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" paragraph>
                {project.description}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/projects/${id}/edit`)}
                >
                  プロジェクトを編集
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  削除する
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              法令情報
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleAddressSearch}
              >
                住所から取得
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenLegalEditDialog(true)}
              >
                法令情報を編集
              </Button>
            </Box>
          </Box>
          <LegalInfo legalInfo={project.legalInfo} />
        </Paper>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          プロジェクトを削除しますか？
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            この操作は取り消すことができません。本当にプロジェクトを削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            削除する
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openLegalEditDialog}
        onClose={() => setOpenLegalEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>法令情報の編集</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="用途地域"
                  value={legalInfo?.zoneMap || ''}
                  onChange={(e) => setLegalInfo(prev => ({ ...prev, zoneMap: e.target.value }))}
                >
                  <MenuItem value="第一種低層住居専用地域">第一種低層住居専用地域</MenuItem>
                  <MenuItem value="第一種中高層住居専用地域">第一種中高層住居専用地域</MenuItem>
                  <MenuItem value="第一種住居地域">第一種住居地域</MenuItem>
                  <MenuItem value="近隣商業地域">近隣商業地域</MenuItem>
                  <MenuItem value="商業地域">商業地域</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="高度地区"
                  value={legalInfo?.heightDistrict || ''}
                  onChange={(e) => setLegalInfo(prev => ({ ...prev, heightDistrict: e.target.value }))}
                >
                  <MenuItem value="第一種高度地区">第一種高度地区</MenuItem>
                  <MenuItem value="第二種高度地区">第二種高度地区</MenuItem>
                  <MenuItem value="第三種高度地区">第三種高度地区</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLegalEditDialog(false)}>
            キャンセル
          </Button>
          <Button onClick={() => handleLegalInfoUpdate(legalInfo)} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail; 
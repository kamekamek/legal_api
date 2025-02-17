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
  Skeleton
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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/projects/${id}`);
        if (!response.ok) {
          throw new Error('プロジェクトの取得に失敗しました');
        }
        const data = await response.json();
        
        // 法令情報の取得
        const legalResponse = await fetch(`http://localhost:3001/api/v1/legal/check?projectId=${id}`);
        if (legalResponse.ok) {
          const legalData = await legalResponse.json();
          setProject({ ...data.project, ...legalData });
        } else {
          setProject(data.project);
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
      const response = await fetch(`http://localhost:3001/api/v1/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('プロジェクトの削除に失敗しました');
      }
      navigate('/projects');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
    setOpenDeleteDialog(false);
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
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 4 } }}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
            <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 4 } }}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
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
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                mb: 3
              }}>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  component="h1"
                  sx={{ 
                    wordBreak: 'break-word',
                    mb: { xs: 1, sm: 0 }
                  }}
                >
                  {project.name}
                </Typography>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={getStatusColor(project.status)}
                  size={isMobile ? "small" : "medium"}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {project.description}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                開始日
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(project.startDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                終了日
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(project.endDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                mt: { xs: 2, sm: 3 }
              }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  fullWidth={isMobile}
                >
                  編集
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDeleteDialog(true)}
                  fullWidth={isMobile}
                >
                  削除
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <LegalInfo projectData={project} />
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
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail; 
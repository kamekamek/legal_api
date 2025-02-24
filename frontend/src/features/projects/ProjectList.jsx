import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Chip,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { API_URL } from '../../config/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/projects`);
        if (!response.ok) {
          throw new Error('プロジェクトの取得に失敗しました');
        }
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error('Error:', error);
        // TODO: エラーハンドリングの実装
      }
    };

    fetchProjects();
  }, []);

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        mt: { xs: 2, sm: 4 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1"
            sx={{ mb: { xs: 1, sm: 0 } }}
          >
            プロジェクト一覧
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
            fullWidth={isMobile}
          >
            新規プロジェクト
          </Button>
        </Box>
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6
                  },
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="h2" 
                    gutterBottom
                    sx={{
                      fontSize: {
                        xs: '1.1rem',
                        sm: '1.3rem',
                        md: '1.5rem'
                      }
                    }}
                  >
                    {project.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: isMobile ? 2 : 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
                    }}
                  >
                    {project.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProjectList; 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './components/ProjectCard';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError(null);
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('プロジェクト一覧の取得に失敗しました');
        }
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = () => {
    navigate('/projects/new');
  };

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            プロジェクト一覧
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddProject}
          >
            新規プロジェクト
          </Button>
        </Box>
        {error && (
          <Alert severity="error" role="alert" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProjectList; 
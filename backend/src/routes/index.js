import express from 'express';
import projectRoutes from './projects.js';

const router = express.Router();
router.use('/api/v1/projects', projectRoutes);

export default router; 
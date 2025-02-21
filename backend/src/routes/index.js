import express from 'express';
import projectsRouter from './projects.js';

const router = express.Router();

router.use('/projects', projectsRouter);

export default router; 
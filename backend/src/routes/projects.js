'use strict';

import express from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController.js';

const router = express.Router();

// プロジェクト一覧を取得
router.get('/', getProjects);

// プロジェクトを作成
router.post('/', createProject);

// プロジェクトを更新
router.put('/:id', updateProject);

// プロジェクトを削除
router.delete('/:id', deleteProject);

export default router; 
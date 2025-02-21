'use strict';

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// プロジェクト一覧の取得
router.get('/', projectController.getProjects);

// プロジェクトの作成
router.post('/', projectController.createProject);

// プロジェクト詳細の取得
router.get('/:id', projectController.getProject);

// プロジェクトの更新
router.put('/:id', projectController.updateProject);

// プロジェクトの削除
router.delete('/:id', projectController.deleteProject);

module.exports = router; 
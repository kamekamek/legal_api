'use strict';

const { Project } = require('../models');
const { ValidationError, DatabaseError } = require('sequelize');

// プロジェクト一覧の取得
exports.getProjects = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }

    const projects = await Project.findAll({ where });
    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

// プロジェクト詳細の取得
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// プロジェクトの作成
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// プロジェクトの更新
exports.updateProject = async (req, res, next) => {
  try {
    const [updated] = await Project.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });

    if (!updated) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }

    const project = await Project.findByPk(req.params.id);
    res.json(project);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// プロジェクトの削除
exports.deleteProject = async (req, res, next) => {
  try {
    const deleted = await Project.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 
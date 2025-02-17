'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // 将来的な関連付けをここに定義
    }
  }

  Project.init({
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'プロジェクト名は必須です'
        },
        len: {
          args: [1, 255],
          msg: 'プロジェクト名は1〜255文字で入力してください'
        }
      }
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scale: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    usage_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'completed', 'suspended'),
      defaultValue: 'planning',
      allowNull: false,
      validate: {
        isIn: {
          args: [['planning', 'active', 'completed', 'suspended']],
          msg: '無効なステータスです'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    underscored: true,
    timestamps: true
  });

  return Project;
}; 
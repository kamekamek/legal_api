'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scale: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      usage_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('planning', 'active', 'completed', 'suspended'),
        defaultValue: 'planning',
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // インデックスの作成
    await queryInterface.addIndex('projects', ['status']);
    await queryInterface.addIndex('projects', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('projects');
  }
}; 
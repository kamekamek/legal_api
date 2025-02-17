const express = require('express');
const router = express.Router();
const projectRoutes = require('./projects');

router.use('/projects', projectRoutes);

module.exports = router; 
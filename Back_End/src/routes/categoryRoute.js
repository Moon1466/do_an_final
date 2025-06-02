const express = require('express');
const router = express.Router();
const { getCategory } = require('../controllers/homeControllers');
const setAdminName = require('../middleware/setAdminName');

router.get('/', setAdminName, getCategory);

module.exports = router; 
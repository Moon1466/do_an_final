const express = require('express');
const router = express.Router();
const { getHome } = require('../controllers/homeControllers');
const setAdminName = require('../middleware/setAdminName');

router.get('/', setAdminName, getHome);

module.exports = router; 
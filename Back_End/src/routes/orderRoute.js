const express = require('express');
const router = express.Router();
const { getOrder } = require('../controllers/homeControllers');
const setAdminName = require('../middleware/setAdminName');

router.get('/', setAdminName, getOrder);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { getSetting } = require('../controllers/homeControllers');
const setAdminName = require('../middleware/setAdminName');

router.get('/', setAdminName, getSetting);

module.exports = router; 
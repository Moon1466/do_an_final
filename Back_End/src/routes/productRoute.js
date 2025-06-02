const express = require('express');
const router = express.Router();
const { getProduct } = require('../controllers/homeControllers');
const setAdminName = require('../middleware/setAdminName');

router.get('/', setAdminName, getProduct);

module.exports = router; 
const express = require('express');
const router = express.Router();
const basketController = require('../controllers/apiBasketController');

// ...existing routes...

// Thêm route mới cho update số lượng
router.post('/update-quantity', basketController.updateQuantity);

module.exports = router;
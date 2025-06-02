const express = require('express');
const router = express.Router();
const { getAccountPage } = require('../controllers/accountController');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');
const setAdminName = require('../middleware/setAdminName');

// Route hiển thị trang tài khoản - chỉ admin mới có quyền truy cập
router.get('/', isAuthenticated, isAdmin, setAdminName, getAccountPage);

module.exports = router; 
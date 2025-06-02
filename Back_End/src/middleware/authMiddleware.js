const jwt = require('jsonwebtoken');
const Account = require('../model/Accounts');

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    try {
        // Kiểm tra session user
        if (!req.session || !req.session.user) {
            return res.status(403).json({
                success: false,
                message: 'Bạn cần đăng nhập để truy cập'
            });
        }

        // Kiểm tra user có tồn tại trong database không
        const user = await Account.findById(req.session.user._id);
        if (!user) {
            // Xóa session nếu user không tồn tại
            req.session.destroy();
            return res.status(403).json({
                success: false,
                message: 'Phiên đăng nhập đã hết hạn'
            });
        }
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại'
        });
    }
};

// Middleware to protect admin routes
const isAdmin = async (req, res, next) => {
    try {
        // Kiểm tra session user
        if (!req.session || !req.session.user) {
            return res.status(403).json({
                success: false,
                message: 'Bạn cần đăng nhập để truy cập'
            });
        }

        // Kiểm tra role admin
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập vào trang này'
            });
        }

        // Kiểm tra user có tồn tại trong database không
        const user = await Account.findById(req.session.user._id);
        if (!user || user.role !== 'admin') {
            // Xóa session nếu user không tồn tại hoặc không còn quyền admin
            req.session.destroy();
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn không còn quyền truy cập'
            });
        }
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại'
        });
    }
};

module.exports = {
    isAuthenticated,
    isAdmin
}; 
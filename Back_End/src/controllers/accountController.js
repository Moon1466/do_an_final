const Account = require('../model/Accounts');

// Hiển thị trang tài khoản
const getAccountPage = async (req, res) => {
    try {
        // Kiểm tra đăng nhập và quyền admin
        if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập vào trang này'
            });
        }

        let query = {};
        
        // Xử lý tìm kiếm
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query = {
                $or: [
                    { username: searchRegex },
                    { email: searchRegex },
                    { fullName: searchRegex },
                    { phone: searchRegex }
                ]
            };
        }

        // Xử lý lọc theo vai trò
        if (req.query.role && req.query.role !== 'all') {
            query.role = req.query.role;
        }

        // Lấy danh sách tài khoản từ database
        const users = await Account.find(query).sort({ createdAt: -1 });

        // Render trang với dữ liệu
        res.render('account', {
            users,
            searchTerm: req.query.search || '',
            roleFilter: req.query.role || '',
            adminName: req.session.user.fullName || req.session.user.username,
            adminRole: req.session.user.role,
            adminAvatar: req.session.user.avatar || '/images/logo/logo_user_empty.png'
        });
    } catch (error) {
        console.error('Error in getAccountPage:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tải trang tài khoản'
        });
    }
};

module.exports = {
    getAccountPage
}; 
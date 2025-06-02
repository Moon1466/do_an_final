// Middleware để set tên admin cho views
const setAdminName = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.adminName = req.session.user.fullName || req.session.user.username;
        res.locals.adminRole = req.session.user.role;
        res.locals.adminAvatar = req.session.user.avatar || '/images/logo/logo_user_empty.png';
    }
    next();
};

module.exports = setAdminName; 
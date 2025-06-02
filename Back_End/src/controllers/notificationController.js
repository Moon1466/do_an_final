const Notification = require('../model/Notifications');

const createNotification = async (userId, title, message, type = 'info') => {
    try {
        const notification = new Notification({
            userId,
            title,
            message,
            type
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông báo',
            error: error.message
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thông báo',
            error: error.message
        });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead
}; 
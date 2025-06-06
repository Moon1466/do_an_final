const Order = require('../model/Orders');
const Product = require('../model/Products');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');

const getOrders = async (req, res) => {
    try {
        let query = {};
        
        // Xử lý tìm kiếm theo mã đơn hàng
        if (req.query.search) {
            query.orderCode = { 
                $regex: new RegExp(req.query.search, 'i')
            };
        }

        // Xử lý lọc theo trạng thái
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        // Lấy tất cả đơn hàng và sắp xếp theo thời gian tạo mới nhất
        const orders = await Order.find(query).sort({ createdAt: -1 });
        
        // Render trang order với dữ liệu đơn hàng
        res.render('order', { 
            orders: orders,
            moment: require('moment'), // Để format thời gian
            currentSearch: req.query.search || '',
            currentStatus: req.query.status || 'all'
        });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).send('Lỗi khi lấy danh sách đơn hàng');
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error getting order:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin đơn hàng',
            error: error.message
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        // Ép productId về ObjectId
        if (orderData.products && Array.isArray(orderData.products)) {
            orderData.products = orderData.products.map(item => ({
                ...item,
                productId: new mongoose.Types.ObjectId(item.productId)
            }));
        }
        // Tạo mã đơn hàng tự động theo format ORDER + timestamp
        orderData.orderCode = 'ORDER' + Date.now();
        // Tạo đơn hàng mới
        const newOrder = new Order(orderData);
        await newOrder.save();

        // Tạo thông báo cho người dùng
        await createNotification(
            orderData.customer._id,
            'Đặt hàng thành công',
            `Đơn hàng ${orderData.orderCode} đã được tạo thành công. Chúng tôi sẽ sớm xử lý đơn hàng của bạn.`,
            'success'
        );

        return res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            data: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        
        // Tạo thông báo lỗi nếu có userId
        if (req.body.customer && req.body.customer._id) {
            await createNotification(
                req.body.customer._id,
                'Đặt hàng thất bại',
                'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.',
                'error'
            );
        }

        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng',
            error: error.message
        });
    }
};

const processPayment = async (req, res) => {
    try {
        const { orderCode, paymentMethod, paymentStatus } = req.body;

        // Validate required fields
        if (!orderCode || !paymentMethod || !paymentStatus) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        // Find the order
        const order = await Order.findOne({ orderCode });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Update payment information
        order.paymentMethod = paymentMethod;
        order.paymentStatus = paymentStatus;
        
        // Nếu thanh toán thành công và chưa cập nhật tồn kho
        if (paymentStatus === 'Đã thanh toán' && !order.stockUpdated) {
            // Cập nhật số lượng tồn kho cho từng sản phẩm
            for (const item of order.products) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Không tìm thấy sản phẩm với ID ${item.productId}`
                    });
                }

                // Kiểm tra số lượng tồn
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho`
                    });
                }

                // Cập nhật số lượng tồn
                product.stock -= item.quantity;
                await product.save();
                console.log(`Đã cập nhật tồn kho sản phẩm ${product.name}: ${product.stock}`);
            }
            
            // Đánh dấu đã cập nhật tồn kho
            order.stockUpdated = true;
            order.status = 'Đã xác nhận';
        }

        // Save the updated order
        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thanh toán thành công',
            data: order
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Chấp nhận các trạng thái hợp lệ
        const validStatuses = ['Đã xác nhận', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        // Nếu đơn hàng được xác nhận và chưa cập nhật tồn kho
        if ((status === 'Đã xác nhận' || status === 'Đang giao hàng' || status === 'Đã giao hàng') 
            && !order.stockUpdated) {
            
            // Cập nhật số lượng tồn kho cho từng sản phẩm
            for (const item of order.products) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Không tìm thấy sản phẩm với ID ${item.productId}`
                    });
                }

                // Kiểm tra số lượng tồn
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho`
                    });
                }

                // Cập nhật số lượng tồn
                product.stock -= item.quantity;
                await product.save();
                console.log(`Đã cập nhật tồn kho sản phẩm ${product.name}: ${product.stock}`);
            }
            
            // Đánh dấu đã cập nhật tồn kho
            order.stockUpdated = true;
        }

        // Cập nhật trạng thái đơn hàng
        order.status = status;
        
        // Tạo thông báo dựa trên trạng thái mới
        let notificationTitle = '';
        let notificationMessage = '';
        let notificationType = 'info';

        switch (status) {
            case 'Đã xác nhận':
                notificationTitle = 'Đơn hàng đã được xác nhận';
                notificationMessage = `Đơn hàng ${order.orderCode} đã được xác nhận.`;
                notificationType = 'success';
                break;
            case 'Đang giao hàng':
                notificationTitle = 'Đơn hàng đang được giao';
                notificationMessage = `Đơn hàng ${order.orderCode} đang được giao đến bạn.`;
                notificationType = 'info';
                break;
            case 'Đã giao hàng':
                notificationTitle = 'Đơn hàng đã giao thành công';
                notificationMessage = `Đơn hàng ${order.orderCode} đã được giao thành công.`;
                notificationType = 'success';
                break;
            case 'Đã hủy':
                notificationTitle = 'Đơn hàng đã bị hủy';
                notificationMessage = `Đơn hàng ${order.orderCode} đã bị hủy.`;
                notificationType = 'error';
                break;
        }

        // Tạo thông báo cho người dùng
        if (order.customer && order.customer._id) {
            await createNotification(
                order.customer._id,
                notificationTitle,
                notificationMessage,
                notificationType
            );
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái đơn hàng',
            error: error.message
        });
    }
};

const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.query.userId;
        let orders;
        if (userId) {
            orders = await Order.find({ 'customer._id': userId }).sort({ createdAt: -1 });
        } else {
            // Nếu không có userId, trả về tất cả đơn hàng
            orders = await Order.find().sort({ createdAt: -1 });
        }
        console.log("API /orders trả về:", orders);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

const updateAllPaidOrdersStatus = async (req, res) => {
    try {
        // Tìm tất cả đơn hàng đã thanh toán nhưng chưa ở trạng thái "Đã giao hàng"
        const result = await Order.updateMany(
            { 
                paymentStatus: 'Đã thanh toán',
                status: { $ne: 'Đã giao hàng' }
            },
            { 
                $set: { status: 'Đã giao hàng' } 
            }
        );

        return res.status(200).json({
            success: true,
            message: `Đã cập nhật ${result.modifiedCount} đơn hàng đã thanh toán thành "Đã giao hàng"`,
            data: result
        });
    } catch (error) {
        console.error('Error updating paid orders status:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái đơn hàng',
            error: error.message
        });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    processPayment,
    updateOrderStatus,
    getOrdersByUser,
    updateAllPaidOrdersStatus
};


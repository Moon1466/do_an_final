const Product = require('../model/Products');
const Category = require('../model/Categories');
const Order = require('../model/Orders');
const User = require('../model/Accounts');
const Settings = require('../model/Settings');
const bcrypt = require('bcrypt');

const getHome = async (req, res) => {
    try {
        // Cập nhật tổng doanh thu: Lấy từ tất cả đơn hàng đã thanh toán thành công
        const totalRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'Đã thanh toán' } }, // Thay đổi từ status: 'Đã giao hàng' thành paymentStatus: 'Đã thanh toán'
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        // Lấy tổng số đơn hàng
        const totalOrders = await Order.countDocuments();
        
        // Lấy tổng số sản phẩm
        const totalProducts = await Product.countDocuments();
        
        // Lấy tổng số người dùng
        const totalUsers = await User.countDocuments();
        
        // Lấy doanh thu theo tháng
        const monthlyRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'Đã thanh toán' } }, // Thay đổi từ status: 'Đã giao hàng' thành paymentStatus: 'Đã thanh toán'
            { $group: { 
                _id: { $month: '$createdAt' },
                total: { $sum: '$totalAmount' }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Nhóm lại trạng thái đơn hàng thành 3 nhóm chính dựa trên trạng thái đơn hàng và trạng thái thanh toán
        const simplifiedOrderStatus = {
            'Đang xử lý': 0,
            'Hoàn thành': 0,
            'Đã hủy': 0
        };

        // Truy vấn đếm số lượng đơn hàng đang xử lý (chưa thanh toán)
        const ordersInProgress = await Order.countDocuments({
            status: { $in: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng'] },
            paymentStatus: 'Chưa thanh toán'
        });
        
        // Truy vấn đếm số lượng đơn hàng đã hoàn thành (đã thanh toán hoặc đã giao hàng)
        const completedOrders = await Order.countDocuments({
            $or: [
                { status: 'Đã giao hàng' },
                { paymentStatus: 'Đã thanh toán' }
            ]
        });
        
        // Truy vấn đếm số lượng đơn hàng đã hủy
        const cancelledOrders = await Order.countDocuments({
            status: 'Đã hủy'
        });
        
        simplifiedOrderStatus['Đang xử lý'] = ordersInProgress;
        simplifiedOrderStatus['Hoàn thành'] = completedOrders;
        simplifiedOrderStatus['Đã hủy'] = cancelledOrders;

        // Thêm mới: Lấy thông tin thanh toán
        const paidOrders = await Order.countDocuments({ paymentStatus: 'Đã thanh toán' });
        const unpaidOrders = await Order.countDocuments({ paymentStatus: 'Chưa thanh toán' });
        const paymentRate = totalOrders > 0 ? (paidOrders / totalOrders * 100).toFixed(1) : 0;

        // Thêm mới: Thống kê phương thức thanh toán
        const paymentMethods = await Order.aggregate([
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Chuyển đổi thành đối tượng
        const paymentMethodObj = {
            'Tiền mặt': 0,
            'Chuyển khoản': 0,
            'Thẻ tín dụng': 0
        };
        paymentMethods.forEach(item => {
            if (item._id) {
                paymentMethodObj[item._id] = item.count;
            }
        });
        
        // Lấy danh sách đơn hàng gần đây
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Format đơn hàng gần đây
        const formattedRecentOrders = recentOrders.map(order => {
            // Phân loại trạng thái đơn hàng dựa trên cả trạng thái đơn hàng và trạng thái thanh toán
            let simplifiedStatus;
            
            if (order.status === 'Đã hủy') {
                simplifiedStatus = 'Đã hủy';
            } else if (order.status === 'Đã giao hàng' || order.paymentStatus === 'Đã thanh toán') {
                simplifiedStatus = 'Hoàn thành';
            } else {
                simplifiedStatus = 'Đang xử lý';
            }
            
            return {
                _id: order._id,
                customerName: order.customer ? order.customer.name : 'Khách vãng lai',
                items: Array.isArray(order.products) ? order.products : [],
                totalAmount: order.totalAmount,
                status: simplifiedStatus,
                originalStatus: order.status,
                paymentStatus: order.paymentStatus || 'Chưa thanh toán',
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt
            };
        });
        
        res.render('dashboard', {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalProducts,
            totalUsers,
            paidOrders,
            unpaidOrders,
            paymentRate,
            paymentMethodObj,
            monthlyRevenue: Array(12).fill(0).map((_, i) => {
                const monthData = monthlyRevenue.find(m => m._id === i + 1);
                return monthData ? monthData.total : 0;
            }),
            orderStatusCount: simplifiedOrderStatus,
            recentOrders: formattedRecentOrders,
            adminName: req.user.fullName || req.user.username
        });
    } catch (error) {
        console.error('Lỗi khi tải trang Dashboard:', error);
        res.render('dashboard', {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: 0,
            paidOrders: 0,
            unpaidOrders: 0,
            paymentRate: 0,
            paymentMethodObj: {
                'Tiền mặt': 0,
                'Chuyển khoản': 0,
                'Thẻ tín dụng': 0
            },
            monthlyRevenue: Array(12).fill(0),
            orderStatusCount: {
                'Đang xử lý': 0,
                'Hoàn thành': 0,
                'Đã hủy': 0
            },
            recentOrders: [],
            adminName: req.user?.fullName || req.user?.username || 'Admin'
        });
    }
}

const getProduct = async (req, res) => {
    try {
        let query = {};
        
        // Nếu có tham số tìm kiếm
        if (req.query.search) {
            query = {
                name: { 
                    $regex: new RegExp(req.query.search, 'i') // Tìm kiếm không phân biệt hoa thường và dấu
                }
            };
        }
        
        const products = await Product.find(query).populate({
            path: 'category',
            populate: {
                path: 'parent'
            }
        });
        
        // Lấy tất cả categories và phân loại
        const allCategories = await Category.find();
        const parentCategories = allCategories.filter(cat => !cat.parent);
        const childCategories = allCategories.filter(cat => cat.parent);
        
        res.render('product', { 
            products, 
            categories: allCategories,
            parentCategories,
            childCategories,
            searchTerm: req.query.search || '',
            adminName: req.user?.fullName || req.user?.username || 'Admin'
        });
    } catch (error) {
        res.render('product', { 
            products: [],
            categories: [],
            parentCategories: [],
            childCategories: [],
            searchTerm: req.query.search || '',
            error: 'Có lỗi xảy ra khi tìm kiếm sản phẩm',
            adminName: req.user?.fullName || req.user?.username || 'Admin'
        });
    }
}

const getOrder = async (req, res) => {
    try {
        // Kiểm tra session
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        let query = {};
        
        // Xử lý tìm kiếm
        if (req.query.search) {
            query.$or = [
                { orderCode: { $regex: new RegExp(req.query.search, 'i') } },
                { 'customer.name': { $regex: new RegExp(req.query.search, 'i') } },
                { 'customer.phone': { $regex: new RegExp(req.query.search, 'i') } }
            ];
        }

        // Xử lý lọc theo trạng thái
        if (req.query.status) {
            if (req.query.status === 'processing') {
                query.status = { $in: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng'] };
            } else if (req.query.status === 'completed') {
                query.status = 'Đã giao hàng';
            } else if (req.query.status === 'cancelled') {
                query.status = 'Đã hủy';
            }
        }

        // Xử lý lọc theo trạng thái thanh toán
        if (req.query.paymentStatus) {
            query.paymentStatus = req.query.paymentStatus;
        }

        // Phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Lấy danh sách đơn hàng
        const orders = await Order.find(query)
            .populate('customer._id', 'name email phone')
            .populate('products.productId', 'name price images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Tính tổng số đơn hàng để phân trang
        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        // Format đơn hàng để hiển thị
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderCode: order.orderCode,
            customer: {
                name: order.customer.name,
                email: order.customer.email,
                phone: order.customer.phone,
                address: order.customer.address
            },
            products: order.products.map(product => ({
                name: product.name,
                price: product.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }),
                quantity: product.quantity,
                image: product.image,
                subtotal: (product.price * product.quantity).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                })
            })),
            totalAmount: order.totalAmount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }),
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            createdAt: new Date(order.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            statusClass: getStatusClass(order.status),
            paymentStatusClass: getPaymentStatusClass(order.paymentStatus),
            notes: order.notes || ''
        }));

        // Lấy thống kê
        const orderStats = {
            total: totalOrders,
            processing: await Order.countDocuments({ 
                status: { $in: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng'] }
            }),
            completed: await Order.countDocuments({ status: 'Đã giao hàng' }),
            cancelled: await Order.countDocuments({ status: 'Đã hủy' }),
            paid: await Order.countDocuments({ paymentStatus: 'Đã thanh toán' }),
            unpaid: await Order.countDocuments({ paymentStatus: 'Chưa thanh toán' })
        };

        res.render('order', {
            orders: formattedOrders,
            currentPage: page,
            totalPages,
            orderStats,
            searchTerm: req.query.search || '',
            statusFilter: req.query.status || '',
            paymentStatusFilter: req.query.paymentStatus || '',
            adminName: req.session.user.fullName || req.session.user.username,
            adminRole: req.session.user.role,
            adminAvatar: req.session.user.avatar || '/images/logo/logo_user_empty.png'
        });

    } catch (error) {
        console.error('Error in getOrder:', error);
        res.status(500).render('error', {
            message: 'Có lỗi xảy ra khi tải trang đơn hàng',
            adminName: req.session.user?.fullName || req.session.user?.username,
            adminRole: req.session.user?.role,
            adminAvatar: req.session.user?.avatar || '/images/logo/logo_user_empty.png'
        });
    }
};

// Hàm helper để xác định class CSS cho trạng thái đơn hàng
function getStatusClass(status) {
    switch (status) {
        case 'Chờ xác nhận':
            return 'status-pending';
        case 'Đã xác nhận':
            return 'status-confirmed';
        case 'Đang giao hàng':
            return 'status-shipping';
        case 'Đã giao hàng':
            return 'status-delivered';
        case 'Đã hủy':
            return 'status-cancelled';
        default:
            return '';
    }
}

// Hàm helper để xác định class CSS cho trạng thái thanh toán
function getPaymentStatusClass(paymentStatus) {
    switch (paymentStatus) {
        case 'Đã thanh toán':
            return 'payment-paid';
        case 'Chưa thanh toán':
            return 'payment-unpaid';
        default:
            return '';
    }
}

const getAccount = (req, res) => {
    // Kiểm tra session và quyền truy cập
    if (!req.session || !req.session.user || !['admin', 'staff'].includes(req.session.user.role)) {
        return res.redirect('/login');
    }
    
    res.render('account', {
        adminRole: req.session.user.role,
        adminName: req.session.user.fullName || req.session.user.username,
        adminAvatar: req.session.user.avatar || '/images/logo/logo_user_empty.png'
    });
}

const getComment = async (req, res) => {
    try {
        // Lấy danh sách sản phẩm, có thể chọn trường cần thiết
        const products = await Product.find().lean();

        // Nếu sản phẩm chưa có rating, bạn có thể gán mặc định để test
        const productsWithRating = products.map(p => ({
            ...p,
            rating: p.rating || 5, // hoặc lấy rating thực tế nếu có
            image: p.images && p.images.length > 0 ? p.images[0] : '/images/default.jpg'
        }));

        res.render('comment', { products: productsWithRating });
    } catch (error) {
        res.render('comment', { products: [] });
    }
};

const getCategory = async (req, res) => {
    try {
      // Lấy danh sách danh mục cha
      const categories = await Category.find({ parent: null }).lean();
  
      // Đếm số lượng danh mục con cho từng danh mục cha
      const categoriesWithSubCount = await Promise.all(
        categories.map(async (cat) => {
          const subCategoriesCount = await Category.countDocuments({ parent: cat._id });
          return { ...cat, subCategoriesCount };
        })
      );
  
      res.render('category', { categories: categoriesWithSubCount });
    } catch (err) {
      console.error('Lỗi fetch categories:', err);
      res.status(500).send('Server Error');
    }
  };

const getSetting = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.render('setting', { settings });
    } catch (error) {
        res.render('setting', { settings: null });
    }
}

// Hiển thị trang đăng nhập
const getLogin = (req, res) => {
    // Nếu đã đăng nhập, chuyển hướng về trang home
    if (req.session && req.session.user) {
        return res.redirect('/home');
    }
    res.render('login');
};

// Xử lý đăng nhập
const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm tài khoản theo email
        const account = await User.findOne({ email });
        if (!account) {
            return res.render('login', { error: 'Email hoặc mật khẩu không đúng' });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            return res.render('login', { error: 'Email hoặc mật khẩu không đúng' });
        }

        // Kiểm tra role admin hoặc staff
        if (!['admin', 'staff'].includes(account.role)) {
            return res.render('login', { error: 'Bạn không có quyền truy cập trang quản trị' });
        }

        // Lưu thông tin user vào session
        req.session.user = {
            _id: account._id,
            username: account.username,
            email: account.email,
            fullName: account.fullName,
            role: account.role,
            avatar: account.avatar || '/images/logo/logo_user_empty.png'
        };

        // Chuyển hướng đến trang home
        res.redirect('/home');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Có lỗi xảy ra khi đăng nhập' });
    }
};

module.exports = {
    getHome,
    getProduct,
    getOrder,
    getAccount,
    getComment,
    getCategory,
    getSetting,
    getLogin,
    postLogin
}
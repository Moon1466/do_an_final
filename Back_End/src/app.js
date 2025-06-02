const express = require('express')
const path = require('path')
require('dotenv').config()
const EventEmitter = require('events');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express()

const configViewEngine = require('./config/viewEngine')
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api')
const accountRoute = require('./routes/accountRoute');
const homeRoute = require('./routes/homeRoute');
const productRoute = require('./routes/productRoute');
const categoryRoute = require('./routes/categoryRoute');
const orderRoute = require('./routes/orderRoute');
const settingRoute = require('./routes/settingRoute');
const connection = require('./config/database')
const addressRouter = require('./routes/address');
const { isAuthenticated } = require('./middleware/authMiddleware');

const port = process.env.PORT || 3000
const hostname = process.env.HOST_NAME || 'localhost'

// Middleware để parse JSON và dữ liệu từ form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Static files
app.use(express.static('src/public'));

// Cấu hình view engine
configViewEngine(app)

// API routes
app.use('/api/address', addressRouter);
app.use('/api', apiRoutes);

// Page routes
app.use('/account', accountRoute);
app.use('/home', isAuthenticated, homeRoute);
app.use('/product', isAuthenticated, productRoute);
app.use('/category', isAuthenticated, categoryRoute);
app.use('/order', isAuthenticated, orderRoute);
app.use('/setting', isAuthenticated, settingRoute);
app.use('/', webRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', {
        message: err.message || 'Có lỗi xảy ra trong quá trình xử lý'
    });
});

// Kết nối database và khởi động server
(async () => {
    try {
        await connection();
        app.listen(port, () => {
            console.log(`Server is running at http://${hostname}:${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
})();
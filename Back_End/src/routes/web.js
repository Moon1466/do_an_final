const express = require('express')
const router = express.Router();
const Category = require('../model/Categories');
const { getOrders } = require('../controllers/apiOrderController');
const { isAdmin } = require('../middleware/authMiddleware');
const setAdminName = require('../middleware/setAdminName');
const bookshelfController = require('../controllers/bookshelfController');

const {getHome, getProduct, getComment, getSetting, getLogin, postLogin} = require('../controllers/homeControllers')
const {getCategories, newCategory, showCategory} = require('../controllers/apiCategoryController')

// Trang đăng nhập ở route gốc
router.get('/', getLogin);
router.post('/', postLogin);

// Route đăng xuất
router.post('/logout', (req, res) => {
    // Xóa session
    req.session.destroy();
    res.redirect('/');
});

// Các route admin được bảo vệ bởi middleware isAdmin
router.get('/home', isAdmin, setAdminName, getHome)
router.get('/product', isAdmin, setAdminName, getProduct)
router.get('/order', isAdmin, setAdminName, getOrders)
router.get('/category', isAdmin, setAdminName, getCategories)
router.get('/categories/new', isAdmin, setAdminName, newCategory);
router.get('/comment', isAdmin, setAdminName, getComment)
router.get('/setting', isAdmin, setAdminName, getSetting)

// Route hiển thị chi tiết danh mục
router.get('/category/:slugPath', isAdmin, setAdminName, showCategory);

router.get('/product/:slug', isAdmin, setAdminName, (req, res) => {
    const slug = req.params.slug
    res.send(`Product detail for ${slug}`)
})

router.get('/bookshelf', bookshelfController.getBookshelfPage);

module.exports = router;
 
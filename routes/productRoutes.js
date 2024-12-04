const express = require('express');
const { addToCart, removeFromCart, getOrders, completeOrders, getProducts } = require('../controllers/productController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/add-to-cart', addToCart);
router.delete('/remove-from-cart', authenticateToken, removeFromCart);
router.get('/get-orders', authenticateToken, getOrders );
router.post('/complete-order', authenticateToken, completeOrders);
router.get('/get-products', getProducts);

module.exports = router;

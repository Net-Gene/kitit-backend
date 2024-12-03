const express = require('express');
const { addToCart, removeFromCart, getOrders, completeOrders, getProducts } = require('../controllers/productController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/add-to-cart', addToCart);
router.delete('/remove-from-cart', removeFromCart, authenticateToken);
router.get('/get-orders', getOrders, authenticateToken);
router.post('/complete-order', completeOrders, authenticateToken);
router.get('/get-products', getProducts);

module.exports = router;

const express = require('express');
const { register, login, clearCookie, checkAuthToken } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/clearCookie', clearCookie);
router.get('/check-auth-token', authenticateToken, checkAuthToken);

module.exports = router;

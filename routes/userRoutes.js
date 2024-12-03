const express = require('express');
const { updateUsername, updatePassword, updateEmail, deleteAccount } = require('../controllers/userController');

const router = express.Router();

router.post('/update-username', updateUsername);
router.post('/update-password', updatePassword);
router.post('/update-email', updateEmail);
router.delete('/delete-account', deleteAccount);


module.exports = router;

const express = require('express');
const { getReservedAppointments, bookAppointment } = require('../controllers/appointmentController');

const router = express.Router();

router.get('/reserved-appointments', getReservedAppointments);
router.post('/book-appointment', bookAppointment);

module.exports = router;

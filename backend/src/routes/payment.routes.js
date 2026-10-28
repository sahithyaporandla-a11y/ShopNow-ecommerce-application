const express = require('express');
const router = express.Router();
const { getKey, createRazorpayOrder, verifyPayment } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// Public – frontend needs to know if Razorpay is configured
router.get('/key', protect, getKey);

// Protected – all payment actions require login
router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;

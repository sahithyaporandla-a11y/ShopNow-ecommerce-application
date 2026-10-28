const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, markAsPaid, cancelOrder } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/pay', markAsPaid);
router.put('/:id/cancel', cancelOrder);

module.exports = router;

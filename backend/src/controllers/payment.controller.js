const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order.model');

// ── Lazy Razorpay instance (reads env at request-time) ──
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxx')) {
    throw Object.assign(new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env'), { statusCode: 503 });
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// ── @GET /api/payment/key ────────────────────────────────
// Returns the publishable key for the frontend
exports.getKey = (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxx')) {
    return res.status(503).json({ success: false, message: 'Razorpay not configured' });
  }
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
};

// ── @POST /api/payment/create-order ─────────────────────
// Step 1: Creates a Razorpay order for the given amount (in ₹)
// Returns: { order: { id, amount, currency }, key }
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const razorpay = getRazorpay();

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${orderId || Date.now()}`,
      notes: {
        orderId: orderId || '',
        userId: req.user._id.toString()
      }
    });

    res.json({
      success: true,
      rpOrder,          // { id, amount, currency, receipt, ... }
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

// ── @POST /api/payment/verify ────────────────────────────
// Step 2: Verifies HMAC signature and marks DB order as paid
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // ── Verify HMAC-SHA256 signature ──────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
    }

    // ── Confirm order belongs to this user ────────────────
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.json({ success: true, order, message: 'Already paid' });
    }

    // ── Mark as paid ──────────────────────────────────────
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = 'processing';
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price:    { type: Number, required: true },
  image:    { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      default: 'razorpay'
    },
    paymentInfo: {
      razorpay_order_id:   { type: String },
      razorpay_payment_id: { type: String },
      razorpay_signature:  { type: String }
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    itemsPrice:    { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice:      { type: Number, default: 0 },
    totalPrice:    { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    deliveredAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price:    { type: Number, required: true }  // Snapshot price at time of adding
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true   // One cart per user
    },
    items: [cartItemSchema],
    totalPrice: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ── Auto-calculate total before saving ──────────────────
cartSchema.pre('save', async function () {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

module.exports = mongoose.model('Cart', cartSchema);

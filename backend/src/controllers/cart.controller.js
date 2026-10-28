const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

// ── @GET /api/cart ───────────────────────────────────────
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock isActive');
    if (!cart) {
      return res.json({ success: true, cart: { items: [], totalPrice: 0 } });
    }
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// ── @POST /api/cart/add ──────────────────────────────────
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      if (existingItem.quantity > product.stock) {
        existingItem.quantity = product.stock;
      }
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price: product.discountPrice > 0 ? product.discountPrice : product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name images price stock isActive');

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// ── @PUT /api/cart/update ────────────────────────────────
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      item.quantity = Math.min(Number(quantity), product.stock);
    }

    await cart.save();
    await cart.populate('items.product', 'name images price stock isActive');

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// ── @DELETE /api/cart/remove/:productId ─────────────────
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.product', 'name images price stock isActive');

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// ── @DELETE /api/cart/clear ──────────────────────────────
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

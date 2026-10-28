const Wishlist = require('../models/Wishlist.model');

// ── @GET /api/wishlist ───────────────────────────────────
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name images price discountPrice rating numReviews brand stock isActive');

    if (!wishlist) {
      return res.json({ success: true, wishlist: { products: [] } });
    }

    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

// ── @POST /api/wishlist/add ──────────────────────────────
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products', 'name images price discountPrice rating numReviews brand stock isActive');

    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

// ── @DELETE /api/wishlist/remove/:productId ──────────────
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
    await wishlist.save();
    await wishlist.populate('products', 'name images price discountPrice rating numReviews brand stock isActive');

    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

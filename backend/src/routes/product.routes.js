const express = require('express');
const router = express.Router();
const { getProducts, getProduct, addReview, getCategories } = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, updateUser,
  getAllOrders, updateOrderStatus,
  createProduct, updateProduct, deleteProduct, getAllProducts,
  createCategory, getAdminCategories, updateCategory, deleteCategory
} = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Products
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;

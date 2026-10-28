const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error.middleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // React dev server port
  credentials: true
}));

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',      require('./src/routes/auth.routes'));
app.use('/api/products',  require('./src/routes/product.routes'));
app.use('/api/cart',      require('./src/routes/cart.routes'));
app.use('/api/wishlist',  require('./src/routes/wishlist.routes'));
app.use('/api/orders',    require('./src/routes/order.routes'));
app.use('/api/payment',   require('./src/routes/payment.routes'));
app.use('/api/admin',     require('./src/routes/admin.routes'));

// ── Health Check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 E-Commerce API is running!' });
});

// ── Global Error Handler ────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

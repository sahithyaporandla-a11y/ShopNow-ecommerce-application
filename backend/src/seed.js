/**
 * Seed script - populates the database with sample data
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');
const Category = require('./models/Category.model');
const Product = require('./models/Product.model');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany()
  ]);
  console.log('🗑  Cleared existing data');

  // Create categories
  const categories = await Category.insertMany([
    { name: 'Electronics', description: 'Gadgets and tech', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
    { name: 'Fashion',     description: 'Clothing and accessories', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400' },
    { name: 'Home & Living', description: 'Furniture and decor', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
    { name: 'Sports',      description: 'Sports and fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' },
    { name: 'Books',       description: 'Books and stationery', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' }
  ]);
  console.log('📂 Categories created');

  const [electronics, fashion, home, sports, books] = categories;

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword  = await bcrypt.hash('user123', 10);

  const users = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@shopnow.com',
      password: adminPassword,
      role: 'admin',
      phone: '9876543210'
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'customer',
      phone: '9123456789',
      address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      role: 'customer',
      phone: '9234567890'
    }
  ]);
  console.log('👤 Users created');

  // Create products
  const products = [
    {
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Industry-leading noise canceling with Speak-to-Chat technology. Premium sound quality with 30-hour battery life.',
      price: 34990,
      discountPrice: 29990,
      category: electronics._id,
      brand: 'Sony',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
      ],
      stock: 50,
      featured: true,
      tags: ['headphones', 'wireless', 'noise-canceling']
    },
    {
      name: 'Apple iPhone 15 Pro',
      description: 'Titanium design, A17 Pro chip, Pro camera system with 48MP main camera. Available in 128GB, 256GB, 512GB.',
      price: 134900,
      discountPrice: 124900,
      category: electronics._id,
      brand: 'Apple',
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500',
        'https://images.unsplash.com/photo-1523475496153-3506a0f47898?w=500'
      ],
      stock: 30,
      featured: true,
      tags: ['smartphone', 'apple', 'iphone']
    },
    {
      name: 'Samsung 4K OLED Smart TV 55"',
      description: 'Quantum HDR OLED, Dolby Atmos, smart features with built-in streaming apps. Crystal clear 4K resolution.',
      price: 89999,
      discountPrice: 74999,
      category: electronics._id,
      brand: 'Samsung',
      images: ['https://images.unsplash.com/photo-1593784991095-a205069533cd?w=500'],
      stock: 15,
      featured: true,
      tags: ['tv', 'oled', '4k', 'samsung']
    },
    {
      name: 'MacBook Air M3',
      description: 'Supercharged by M3 chip. Up to 18 hours battery life. Incredibly thin and light design with stunning Liquid Retina display.',
      price: 114900,
      discountPrice: 109900,
      category: electronics._id,
      brand: 'Apple',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
      stock: 20,
      featured: true,
      tags: ['laptop', 'macbook', 'apple', 'm3']
    },
    {
      name: 'Nike Air Max 270',
      description: 'Lightweight and breathable with Max Air unit in the heel. Perfect for everyday wear and casual workouts.',
      price: 12995,
      discountPrice: 9999,
      category: fashion._id,
      brand: 'Nike',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500'
      ],
      stock: 100,
      featured: true,
      tags: ['shoes', 'nike', 'sneakers', 'airmax']
    },
    {
      name: 'Levi\'s 511 Slim Jeans',
      description: 'Classic slim fit jeans. Sits below waist, slim through thigh and leg. 99% Cotton, 1% Elastane.',
      price: 3999,
      discountPrice: 2999,
      category: fashion._id,
      brand: 'Levi\'s',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
      stock: 200,
      tags: ['jeans', 'denim', 'levis', 'pants']
    },
    {
      name: 'Prestige IRIS 750W Mixer Grinder',
      description: '3 stainless steel jars, 750W motor, 3 speed control with incher. 2-year warranty.',
      price: 3599,
      discountPrice: 2799,
      category: home._id,
      brand: 'Prestige',
      images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'],
      stock: 75,
      tags: ['kitchen', 'mixer', 'grinder', 'appliance']
    },
    {
      name: 'Wooden Study Desk',
      description: 'Solid wood study desk with cable management, drawer, and monitor shelf. 120cm x 60cm surface.',
      price: 12999,
      discountPrice: 10499,
      category: home._id,
      brand: 'Durian',
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'],
      stock: 25,
      featured: true,
      tags: ['desk', 'furniture', 'wood', 'study']
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Extra thick 6mm anti-slip yoga mat with carrying strap. Made from eco-friendly TPE material.',
      price: 1999,
      discountPrice: 1499,
      category: sports._id,
      brand: 'Boldfit',
      images: ['https://images.unsplash.com/photo-1601925228032-e73e238f5b1d?w=500'],
      stock: 150,
      tags: ['yoga', 'fitness', 'mat', 'exercise']
    },
    {
      name: 'Atomic Habits',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. Bestselling self-help book.',
      price: 799,
      discountPrice: 499,
      category: books._id,
      brand: 'Penguin',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'],
      stock: 300,
      featured: true,
      tags: ['book', 'self-help', 'habits', 'productivity']
    },
    {
      name: 'boAt Rockerz 450 Bluetooth Headphone',
      description: 'Super extra bass, 15-hour playback, padded ear cushions. Foldable design for easy portability.',
      price: 2990,
      discountPrice: 1799,
      category: electronics._id,
      brand: 'boAt',
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'],
      stock: 80,
      tags: ['headphones', 'bluetooth', 'boat', 'wireless']
    },
    {
      name: 'Smart Water Bottle',
      description: 'Temperature display, LED hydration reminder, BPA-free insulated stainless steel. 500ml capacity.',
      price: 1299,
      discountPrice: 999,
      category: sports._id,
      brand: 'HydroFlask',
      images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500'],
      stock: 200,
      tags: ['water bottle', 'sports', 'hydration', 'smart']
    }
  ];

  await Product.insertMany(products);
  console.log('📦 Products created');

  console.log('\n✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login:');
  console.log('  Email:    admin@shopnow.com');
  console.log('  Password: admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('User Login:');
  console.log('  Email:    john@example.com');
  console.log('  Password: user123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
};

seedData().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

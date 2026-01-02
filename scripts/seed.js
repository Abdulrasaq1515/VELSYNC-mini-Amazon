const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-amazon';

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Sample products with placeholder images - covering all categories
const sampleProducts = [
  // Electronics
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    price: 79.99,
    category: 'Electronics',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking, heart rate monitor, GPS, and smartphone notifications. Water-resistant up to 50m.',
    price: 199.99,
    category: 'Electronics',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
  },
  
  // Clothing
  {
    name: 'Classic Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt. Available in multiple colors. Perfect for casual wear.',
    price: 19.99,
    category: 'Clothing',
    stock: 200,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
  },
  {
    name: 'Denim Jeans - Slim Fit',
    description: 'Premium quality denim jeans with a modern slim fit. Durable and stylish for everyday wear.',
    price: 49.99,
    category: 'Clothing',
    stock: 150,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
  },
  {
    name: 'Winter Jacket',
    description: 'Warm and waterproof winter jacket with insulated lining. Perfect for cold weather.',
    price: 89.99,
    category: 'Clothing',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
  },
  
  // Home & Kitchen
  {
    name: 'Stainless Steel Cookware Set',
    description: '10-piece professional cookware set with non-stick coating. Dishwasher safe and oven safe up to 500°F.',
    price: 129.99,
    category: 'Home & Kitchen',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500'],
  },
  {
    name: 'Coffee Maker Machine',
    description: 'Programmable coffee maker with 12-cup capacity, auto-brew feature, and keep-warm function.',
    price: 59.99,
    category: 'Home & Kitchen',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
  },
  {
    name: 'Decorative Throw Pillows Set',
    description: 'Set of 4 soft decorative pillows with removable covers. Perfect for sofa, couch, or bed.',
    price: 34.99,
    category: 'Home & Kitchen',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'],
  },
  
  // Sports
  {
    name: 'Yoga Mat with Carrying Strap',
    description: 'Extra thick yoga mat with non-slip surface. Includes carrying strap and storage bag.',
    price: 29.99,
    category: 'Sports',
    stock: 120,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
  },
  {
    name: 'Adjustable Dumbbells Set',
    description: 'Space-saving adjustable dumbbells from 5 to 52.5 lbs. Perfect for home gym workouts.',
    price: 149.99,
    category: 'Sports',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
  },
  {
    name: 'Professional Basketball',
    description: 'Official size and weight basketball with superior grip. Indoor and outdoor use.',
    price: 24.99,
    category: 'Sports',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500'],
  },
  
  // Books
  {
    name: 'The Art of Programming',
    description: 'Comprehensive guide to modern programming practices. Perfect for beginners and professionals.',
    price: 39.99,
    category: 'Books',
    stock: 90,
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'],
  },
  {
    name: 'Cookbook: Healthy Meals',
    description: '100+ delicious and healthy recipes for everyday cooking. Includes nutritional information.',
    price: 27.99,
    category: 'Books',
    stock: 110,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'],
  },
  {
    name: 'Mystery Novel Collection',
    description: 'Bestselling mystery novel with thrilling plot twists. Perfect for mystery lovers.',
    price: 14.99,
    category: 'Books',
    stock: 150,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
  },
  
  // Toys
  {
    name: 'Building Blocks Set - 500 Pieces',
    description: 'Creative building blocks set with 500 colorful pieces. Develops creativity and motor skills.',
    price: 34.99,
    category: 'Toys',
    stock: 85,
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'],
  },
  {
    name: 'Remote Control Car',
    description: 'High-speed RC car with rechargeable battery. Suitable for indoor and outdoor play.',
    price: 44.99,
    category: 'Toys',
    stock: 65,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
  },
  {
    name: 'Educational Puzzle Game',
    description: 'Fun and educational puzzle game for kids ages 5+. Improves problem-solving skills.',
    price: 19.99,
    category: 'Toys',
    stock: 130,
    images: ['https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500'],
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert sample products
    console.log('Inserting sample products...');
    await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${sampleProducts.length} sample products`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample products added:');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

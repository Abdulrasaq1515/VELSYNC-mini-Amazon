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

async function debugProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const allProducts = await Product.find({});
    console.log(`📦 Total products in database: ${allProducts.length}\n`);

    if (allProducts.length === 0) {
      console.log('❌ No products found! Run: npm run seed\n');
      process.exit(0);
    }

    // Group by category
    const categories = {};
    allProducts.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });

    console.log('📊 Products by category:');
    Object.keys(categories).forEach(category => {
      console.log(`\n${category}: ${categories[category].length} products`);
      categories[category].forEach(product => {
        console.log(`  - ${product.name} ($${product.price})`);
      });
    });

    // Test category query
    console.log('\n\n🔍 Testing category filter for "Home & Kitchen":');
    const homeKitchenProducts = await Product.find({ category: 'Home & Kitchen' });
    console.log(`Found ${homeKitchenProducts.length} products`);
    homeKitchenProducts.forEach(product => {
      console.log(`  - ${product.name}`);
    });

    console.log('\n✅ Debug complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugProducts();

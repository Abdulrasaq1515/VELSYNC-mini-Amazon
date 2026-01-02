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

async function testCategoryQuery() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Test different category query formats
    const testCategories = [
      'Home & Kitchen',
      'Home &amp; Kitchen',
      'Home%20%26%20Kitchen',
      'Home%20&%20Kitchen',
    ];

    for (const cat of testCategories) {
      console.log(`\n🔍 Testing category: "${cat}"`);
      const products = await Product.find({ category: cat });
      console.log(`   Found: ${products.length} products`);
      if (products.length > 0) {
        products.forEach(p => console.log(`   - ${p.name}`));
      }
    }

    // Show all unique categories
    console.log('\n\n📊 All unique categories in database:');
    const categories = await Product.distinct('category');
    categories.forEach(cat => {
      console.log(`   - "${cat}"`);
    });

    // Count products per category
    console.log('\n\n📈 Products per category:');
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat });
      console.log(`   ${cat}: ${count} products`);
    }

    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCategoryQuery();

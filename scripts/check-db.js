const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-amazon';

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check products
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const productCount = await Product.countDocuments();
    console.log(`📦 Products in database: ${productCount}`);
    
    if (productCount > 0) {
      console.log('\nSample products:');
      const products = await Product.find().limit(3);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price}`);
      });
    } else {
      console.log('⚠️  No products found! Run: npm run seed');
    }

    // Check users
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const userCount = await User.countDocuments();
    console.log(`\n👥 Users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().select('email role');
      console.log('\nUsers:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role})`);
      });
    } else {
      console.log('⚠️  No users found! Run: npm run create-admin');
    }

    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.log('\n💡 Make sure MongoDB is running in MongoDB Compass');
    process.exit(1);
  }
}

checkDatabase();

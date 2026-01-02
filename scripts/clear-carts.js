const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-amazon';

async function clearCarts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Clear all carts
    const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false }));
    
    const result = await Cart.deleteMany({});
    console.log(`🧹 Cleared ${result.deletedCount} carts\n`);

    console.log('✅ All carts cleared!');
    console.log('\nYou can now:');
    console.log('1. Logout (if logged in)');
    console.log('2. Clear browser localStorage (F12 > Application > Local Storage > Clear)');
    console.log('3. Refresh the page');
    console.log('4. Try adding items to cart again');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearCarts();

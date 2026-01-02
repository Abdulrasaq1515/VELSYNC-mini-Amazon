const { execSync } = require('child_process');

console.log('🔧 Fixing miniAmazon - Running all setup scripts...\n');

try {
  console.log('1️⃣ Seeding products...');
  execSync('node scripts/seed.js', { stdio: 'inherit' });
  
  console.log('\n2️⃣ Creating admin user...');
  execSync('node scripts/create-admin.js', { stdio: 'inherit' });
  
  console.log('\n3️⃣ Checking database...');
  execSync('node scripts/check-db.js', { stdio: 'inherit' });
  
  console.log('\n✅ All done! Now run: npm run dev');
  console.log('\n📧 Login with:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123\n');
  
} catch (error) {
  console.error('\n❌ Error during setup:', error.message);
  console.log('\n💡 Make sure MongoDB is running in MongoDB Compass');
  process.exit(1);
}

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const products = await mongoose.connection.db.collection('products').find({}).toArray();
  
  console.log(`Found ${products.length} products\n`);
  
  products.forEach(p => {
    console.log(`Product: ${p.name}`);
    if (p.image) {
      if (p.image.startsWith('data:')) {
        console.log('❌ Image: BASE64 DATA (BAD!)');
        console.log(`   Length: ${p.image.length} characters`);
      } else if (p.image.startsWith('http')) {
        console.log('✅ Image: URL -', p.image);
      } else {
        console.log('✅ Image: PATH -', p.image);
      }
    } else {
      console.log('⚠️  Image: null');
    }
    console.log('---\n');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

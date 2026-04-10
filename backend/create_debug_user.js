const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Delete if exists and re-create
  await mongoose.connection.db.collection('users').deleteOne({ email: 'debug@redbank.com' });
  
  await mongoose.connection.db.collection('users').insertOne({
    name: 'Debug Seller',
    email: 'debug@redbank.com',
    password: hashedPassword,
    role: 'seller',
    phone: '0000000000',
    createdAt: new Date(),
    __v: 0
  });
  
  console.log('Debug user created successfully');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

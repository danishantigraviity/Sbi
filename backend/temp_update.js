const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'seller@gmail.com' },
    { $set: { password: hashedPassword } }
  );
  console.log('Password updated successfully');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

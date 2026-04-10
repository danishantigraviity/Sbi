const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({ 
    name: String, 
    email: String,
    faceEncodings: Array 
  }));
  
  const users = await User.find({ faceEncodings: { $exists: true, $not: { $size: 0 } } });
  console.log('--- USERS WITH BIOMETRICS ---');
  users.forEach(u => console.log(`- ${u.name} (${u.email}): ${u.faceEncodings.length} samples`));
  process.exit(0);
}

checkUsers();

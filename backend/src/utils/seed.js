require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('✅ Admin already exists:', existing.email);
    process.exit(0);
  }

  await User.create({
    name: 'Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@rentpro.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    phone: '+919999999999',
    isActive: true,
  });

  console.log('✅ Admin seeded successfully!');
  console.log('   Email:', process.env.ADMIN_EMAIL || 'admin@rentpro.com');
  console.log('   Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

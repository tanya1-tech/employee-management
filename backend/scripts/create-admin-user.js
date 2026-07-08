const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'hr' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`📋 Username: ${existingAdmin.username}`);
      console.log('💡 To change password, use the reset password feature');
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      name: 'Administrator',
      password: hashedPassword,
      role: 'hr',
      isActive: true,
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📋 Username: admin');
    console.log('📋 Password: admin123');
    console.log('💡 Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdminUser();
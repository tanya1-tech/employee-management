const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    let admin = await User.findOne({ role: 'hr' });
    
    if (!admin) {
      console.log('❌ Admin user not found! Creating new admin...');
      
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        name: 'Administrator',
        password: hashedPassword,
        role: 'hr',
        isActive: true,
      });
      
      await admin.save();
      console.log('✅ Admin user created!');
      console.log('📋 Username: admin');
      console.log('📋 Password: admin123');
      
      // Verify
      const testMatch = await bcrypt.compare('admin123', admin.password);
      console.log(`🔍 Verification: ${testMatch ? '✅ SUCCESS' : '❌ FAILED - But should work'}`);
      
      process.exit(0);
    }

    console.log(`🔍 Found admin: ${admin.username} (${admin.email})`);
    console.log(`   Current hash: ${admin.password.substring(0, 30)}...`);
    
    // IMPORTANT: Directly set password and let the pre-save hook handle hashing
    // Or manually hash it
    console.log('🔄 Resetting password...');
    
    // Method 1: Let the pre-save hook handle it (recommended)
    admin.password = 'admin123';
    await admin.save();
    
    console.log('✅ Password reset via pre-save hook');
    
    // Verify the password works
    const testMatch = await bcrypt.compare('admin123', admin.password);
    console.log(`🔍 Verification: ${testMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!testMatch) {
      console.log('⚠️ Pre-save hook failed. Trying manual hash...');
      
      // Method 2: Manual hash (fallback)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      admin.password = hashedPassword;
      await admin.save();
      
      const finalMatch = await bcrypt.compare('admin123', admin.password);
      console.log(`🔍 Final Verification: ${finalMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    console.log('\n💡 Now try logging in with: admin / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
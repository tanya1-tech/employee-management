const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
require('dotenv').config();

const fixEmployeePasswords = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    // Get all employee users
    const users = await User.find({ role: 'employee' });
    console.log(`📋 Found ${users.length} employee users\n`);

    if (users.length === 0) {
      console.log('❌ No employee users found!');
      console.log('💡 First create employees with: node scripts/create-employees-correct.js');
      process.exit(1);
    }

    let updated = 0;

    for (const user of users) {
      console.log(`🔍 Processing: ${user.username} (${user.name})`);
      console.log(`   Current hash: ${user.password.substring(0, 30)}...`);
      
      // IMPORTANT: Hash password directly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update using findByIdAndUpdate to bypass pre-save hook issues
      await User.findByIdAndUpdate(
        user._id,
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log(`   ✅ Updated password for: ${user.username}`);
      
      // Verify by fetching fresh
      const freshUser = await User.findById(user._id);
      const testMatch = await bcrypt.compare('password123', freshUser.password);
      console.log(`   🔍 Verification: ${testMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log('   ─────────────────────────────');
      
      updated++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Updated ${updated} employee passwords to: password123`);
    console.log('='.repeat(50));

    console.log('\n✅ EMPLOYEE LOGIN CREDENTIALS:');
    console.log('='.repeat(35));
    const allUsers = await User.find({ role: 'employee' });
    allUsers.forEach(u => {
      console.log(`Username: ${u.username.padEnd(15)} | Password: password123`);
    });
    console.log('='.repeat(35));
    console.log('\n💡 Try logging in with: tanya / password123');
    console.log('💡 Admin: admin / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixEmployeePasswords();
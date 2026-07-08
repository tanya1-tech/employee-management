const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
require('dotenv').config();

const resetPasswords = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({ role: 'employee' });
    console.log(`📋 Found ${users.length} employee users\n`);

    let updated = 0;

    for (const user of users) {
      // Hash the password directly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update password
      user.password = hashedPassword;
      await user.save();
      
      console.log(`✅ Reset password for: ${user.username} (${user.name})`);
      updated++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Reset ${updated} passwords to: password123`);
    console.log('='.repeat(50));

    console.log('\n✅ ALL EMPLOYEE LOGIN CREDENTIALS:');
    console.log('='.repeat(30));
    const updatedUsers = await User.find({ role: 'employee' });
    updatedUsers.forEach(u => {
      console.log(`Username: ${u.username} | Password: password123`);
    });
    console.log('='.repeat(30));
    console.log('\n💡 Now try logging in!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPasswords();
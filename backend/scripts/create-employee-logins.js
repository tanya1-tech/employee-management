const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
require('dotenv').config();

const createEmployeeLogins = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    // Check existing employee users
    const existingUsers = await User.find({ role: 'employee' });
    console.log(`📋 Found ${existingUsers.length} existing employee users`);

    if (existingUsers.length > 0) {
      console.log('\n✅ Employee users already exist!');
      console.log('📋 Existing users:');
      existingUsers.forEach(u => {
        console.log(`  - ${u.username} | ${u.name} | ${u.employeeId}`);
      });
      console.log('\n💡 Try logging in with:');
      console.log(`   Username: ${existingUsers[0].username}`);
      console.log(`   Password: password123`);
      console.log(`   Role: Employee`);
      process.exit(0);
    }

    // Get all employees
    const employees = await Employee.find({});
    console.log(`\n📋 Found ${employees.length} employees in database`);

    if (employees.length === 0) {
      console.log('\n❌ No employees found! Please add employees first.');
      console.log('💡 Login as admin and add employees, or run the bulk add script.');
      process.exit(1);
    }

    // Create users for each employee
    let created = 0;
    let skipped = 0;

    console.log('\n📝 Creating employee users...\n');

    for (const employee of employees) {
      // Generate username from email
      const username = employee.email.split('@')[0];
      
      // Check if user already exists
      const existing = await User.findOne({ 
        $or: [{ email: employee.email }, { username: username }] 
      });

      if (existing) {
        console.log(`⏭️ User already exists for ${employee.name} (${employee.employeeId})`);
        skipped++;
        continue;
      }

      // Hash default password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Create user
      const user = new User({
        username: username,
        email: employee.email,
        name: employee.name,
        password: hashedPassword,
        role: 'employee',
        employeeId: employee.employeeId,
        isActive: true,
      });

      await user.save();
      console.log(`✅ Created: ${username} | ${employee.name} | ${employee.employeeId}`);
      created++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Summary: Created ${created} users, Skipped ${skipped}`);
    console.log(`👤 Total users: ${await User.countDocuments()}`);
    console.log('='.repeat(50));

    if (created > 0) {
      console.log('\n✅ ALL EMPLOYEE LOGIN CREDENTIALS:');
      console.log('='.repeat(40));
      
      const users = await User.find({ role: 'employee' });
      users.forEach(u => {
        console.log(`Username: ${u.username} | Password: password123`);
      });
      console.log('='.repeat(40));
      console.log('\n💡 Go to http://localhost:3000 and login with these credentials');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createEmployeeLogins();
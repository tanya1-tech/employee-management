const mongoose = require('mongoose');
const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
require('dotenv').config();

const linkEmployeesToUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`📋 Found ${employees.length} employees\n`);

    let linked = 0;
    let skipped = 0;

    for (const employee of employees) {
      // Find user by email
      let user = await User.findOne({ email: employee.email });
      
      // If not found by email, try by employeeId
      if (!user) {
        user = await User.findOne({ employeeId: employee.employeeId });
      }
      
      // If still not found, try by username (first name)
      if (!user) {
        const firstName = employee.name.split(' ')[0].toLowerCase();
        user = await User.findOne({ username: firstName });
      }

      if (user) {
        // Link user to employee
        employee.userId = user._id;
        await employee.save();
        console.log(`✅ Linked: ${employee.name} → ${user.username}`);
        linked++;
      } else {
        console.log(`⚠️ No user found for: ${employee.name} (${employee.email})`);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Linked ${linked} employees, Skipped ${skipped}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

linkEmployeesToUsers();
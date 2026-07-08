const mongoose = require('mongoose');
const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
require('dotenv').config();

const createAdminEmployee = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const adminUser = await User.findOne({ role: 'hr' });
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('💡 First create admin user with: node scripts/create-admin-user.js');
      process.exit(1);
    }

    console.log('✅ Admin user found:', adminUser.username);

    // Check if admin already has employee profile
    const existingEmployee = await Employee.findOne({ userId: adminUser._id });
    if (existingEmployee) {
      console.log('✅ Admin employee profile already exists:');
      console.log(`   Name: ${existingEmployee.name}`);
      console.log(`   Employee ID: ${existingEmployee.employeeId}`);
      console.log(`   Department: ${existingEmployee.department}`);
      console.log(`   Role: ${existingEmployee.role || 'hr'}`);
      process.exit(0);
    }

    // Check if employee exists by email
    const existingByEmail = await Employee.findOne({ email: adminUser.email });
    if (existingByEmail) {
      console.log('✅ Employee profile exists for admin email:');
      console.log(`   Name: ${existingByEmail.name}`);
      console.log(`   Employee ID: ${existingByEmail.employeeId}`);
      
      // Link to admin user
      existingByEmail.userId = adminUser._id;
      existingByEmail.role = 'hr';
      await existingByEmail.save();
      console.log('✅ Linked admin user to existing employee profile');
      process.exit(0);
    }

    // Generate employee ID
    const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
    let employeeId = 'EMP001';
    if (lastEmployee) {
      const lastId = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      employeeId = `EMP${String(lastId + 1).padStart(3, '0')}`;
    }

    // Create employee profile for admin
    const employee = new Employee({
      employeeId: employeeId,
      name: adminUser.name || 'Administrator',
      department: 'Human Resources',
      email: adminUser.email,
      position: 'HR Manager',
      status: 'active',
      role: 'hr', // Set role as HR
      userId: adminUser._id,
      joiningDate: new Date(),
    });

    await employee.save();

    console.log('\n✅ Admin employee profile created successfully!');
    console.log('='.repeat(50));
    console.log(`📋 Name: ${employee.name}`);
    console.log(`📋 Employee ID: ${employee.employeeId}`);
    console.log(`📋 Department: ${employee.department}`);
    console.log(`📋 Role: ${employee.role}`);
    console.log(`📋 Email: ${employee.email}`);
    console.log('='.repeat(50));
    console.log('\n💡 Now you can:');
    console.log('   - Login as admin');
    console.log('   - Go to Attendance');
    console.log('   - Click "Check In" to mark your attendance');
    console.log('   - Click "Check Out" when leaving');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdminEmployee();
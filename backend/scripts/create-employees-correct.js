const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
require('dotenv').config();

const employees = [
  { name: 'Tanya Poojari', department: 'Engineering', email: 'tanyapoojari@gmail.com' },
  { name: 'Aisha Khan', department: 'Marketing', email: 'aishakhan@gmail.com' },
  { name: 'Rahul Sharma', department: 'Engineering', email: 'rahulsharma@gmail.com' },
  { name: 'Priya Patel', department: 'Sales', email: 'priyapatel@gmail.com' },
  { name: 'Amit Kumar', department: 'IT', email: 'amitkumar@gmail.com' },
  { name: 'Sneha Reddy', department: 'HR', email: 'snehareddy@gmail.com' },
  { name: 'Vikram Joshi', department: 'Operations', email: 'vikramjoshi@gmail.com' },
  { name: 'Ananya Iyer', department: 'Design', email: 'ananyaiyer@gmail.com' },
  { name: 'Arjun Nair', department: 'Engineering', email: 'arjunnair@gmail.com' },
  { name: 'Kavya Menon', department: 'Marketing', email: 'kavyamenon@gmail.com' },
  { name: 'Ravi Desai', department: 'Sales', email: 'ravidesai@gmail.com' },
  { name: 'Meera Krishnan', department: 'HR', email: 'meerakrishnan@gmail.com' },
  { name: 'Suresh Reddy', department: 'IT', email: 'sureshreddy@gmail.com' },
  { name: 'Deepa Nair', department: 'Finance', email: 'deepanair@gmail.com' },
  { name: 'Sanjay Kapoor', department: 'Operations', email: 'sanjaykapoor@gmail.com' },
];

const createEmployeesWithUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB\n');

    // Delete existing employee users
    await User.deleteMany({ role: 'employee' });
    console.log('🗑️ Deleted existing employee users\n');

    let created = 0;
    let skipped = 0;

    for (const empData of employees) {
      // Check if employee exists
      let employee = await Employee.findOne({ email: empData.email });
      
      // If employee doesn't exist, create one
      if (!employee) {
        const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
        let employeeId = 'EMP001';
        if (lastEmployee) {
          const lastId = parseInt(lastEmployee.employeeId.replace('EMP', ''));
          employeeId = `EMP${String(lastId + 1).padStart(3, '0')}`;
        }

        employee = new Employee({
          ...empData,
          employeeId,
          status: 'active',
          joiningDate: new Date(),
        });
        await employee.save();
        console.log(`📝 Created employee: ${empData.name} (${employeeId})`);
      }

      // Create user with first name as username
      const username = empData.name.split(' ')[0].toLowerCase();
      
      // Check if user already exists
      const existing = await User.findOne({ username });
      if (existing) {
        console.log(`⏭️ User ${username} already exists`);
        skipped++;
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Create user
      const user = new User({
        username: username,
        email: empData.email,
        name: empData.name,
        password: hashedPassword,
        role: 'employee',
        employeeId: employee.employeeId,
        isActive: true,
      });

      await user.save();
      console.log(`✅ Created: ${username} | ${empData.name}`);
      created++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Created ${created} users, Skipped ${skipped}`);
    console.log(`👤 Total users: ${await User.countDocuments()}`);
    console.log('='.repeat(50));

    console.log('\n✅ ALL EMPLOYEE LOGIN CREDENTIALS:');
    console.log('='.repeat(30));
    const users = await User.find({ role: 'employee' });
    users.forEach(u => {
      console.log(`Username: ${u.username} | Password: password123`);
    });
    console.log('='.repeat(30));
    console.log('\n💡 Login with your FIRST NAME (e.g., tanya)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createEmployeesWithUsers();
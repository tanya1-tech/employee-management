const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee.model');
const User = require('../models/User.model');
require('dotenv').config();

const employees = [
  { name: 'Tanya Poojari', department: 'Engineering', email: 'tanya.poojari@gmail.com' },
  { name: 'Aisha Khan', department: 'Marketing', email: 'aisha.khan@gmail.com' },
  { name: 'Rahul Sharma', department: 'Engineering', email: 'rahul.sharma@gmail.com' },
  { name: 'Priya Patel', department: 'Sales', email: 'priya.patel@gmail.com' },
  { name: 'Amit Kumar', department: 'IT', email: 'amit.kumar@gmail.com' },
  { name: 'Sneha Reddy', department: 'HR', email: 'sneha.reddy@gmail.com' },
  { name: 'Vikram Joshi', department: 'Operations', email: 'vikram.joshi@gmail.com' },
  { name: 'Ananya Iyer', department: 'Design', email: 'ananya.iyer@gmail.com' },
  { name: 'Arjun Nair', department: 'Engineering', email: 'arjun.nair@gmail.com' },
  { name: 'Kavya Menon', department: 'Marketing', email: 'kavya.menon@gmail.com' },
  { name: 'Ravi Desai', department: 'Sales', email: 'ravi.desai@gmail.com' },
  { name: 'Meera Krishnan', department: 'HR', email: 'meera.krishnan@gmail.com' },
  { name: 'Suresh Reddy', department: 'IT', email: 'suresh.reddy@gmail.com' },
  { name: 'Deepa Nair', department: 'Finance', email: 'deepa.nair@gmail.com' },
  { name: 'Sanjay Kapoor', department: 'Operations', email: 'sanjay.kapoor@gmail.com' },
  { name: 'Neha Gupta', department: 'Finance', email: 'neha.gupta@gmail.com' },
  { name: 'Manish Sharma', department: 'Engineering', email: 'manish.sharma@gmail.com' },
  { name: 'Pooja Deshmukh', department: 'Marketing', email: 'pooja.deshmukh@gmail.com' },
  { name: 'Vivek Agarwal', department: 'IT', email: 'vivek.agarwal@gmail.com' },
  { name: 'Anjali Nair', department: 'HR', email: 'anjali.nair@gmail.com' },
];

const addEmployeesWithLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB');

    let added = 0;
    let skipped = 0;
    const credentials = [];

    for (const empData of employees) {
      // Check if employee exists
      const existingEmp = await Employee.findOne({ email: empData.email });
      if (existingEmp) {
        console.log(`⏭️ Skipped ${empData.name} - employee already exists`);
        skipped++;
        continue;
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: empData.email });
      if (existingUser) {
        console.log(`⏭️ Skipped ${empData.name} - user already exists`);
        skipped++;
        continue;
      }

      // Generate employee ID
      const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
      let employeeId = 'EMP001';
      if (lastEmployee) {
        const lastId = parseInt(lastEmployee.employeeId.replace('EMP', ''));
        employeeId = `EMP${String(lastId + 1).padStart(3, '0')}`;
      }

      // Generate username and password
      const username = empData.email.split('@')[0];
      const defaultPassword = 'password123';

      // Hash password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create user
      const user = new User({
        username,
        email: empData.email,
        name: empData.name,
        password: hashedPassword,
        role: 'employee',
        employeeId,
        isActive: true,
      });
      await user.save();

      // Create employee
      const employee = new Employee({
        ...empData,
        employeeId,
        status: 'active',
        userId: user._id,
        joiningDate: new Date(),
      });
      await employee.save();

      credentials.push({
        name: empData.name,
        username,
        password: defaultPassword,
        email: empData.email,
        employeeId,
      });

      console.log(`✅ Added ${empData.name} (${employeeId})`);
      added++;
    }

    console.log(`\n📊 Summary: Added ${added} employees, Skipped ${skipped} existing`);
    console.log(`👥 Total employees: ${await Employee.countDocuments()}`);
    console.log(`👤 Total users: ${await User.countDocuments()}`);
    
    if (credentials.length > 0) {
      console.log('\n📋 Login Credentials:');
      console.log('='.repeat(60));
      credentials.forEach(c => {
        console.log(`${c.name}: ${c.username} / ${c.password}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addEmployeesWithLogin();
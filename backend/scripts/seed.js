const mongoose = require('mongoose');
const Employee = require('../models/Employee.model');
const Attendance = require('../models/Attendance.model');
require('dotenv').config();

const seedData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing data
  await Employee.deleteMany();
  await Attendance.deleteMany();

  // Add employees
  const employees = [
    { employeeId: 'EMP001', name: 'John Doe', department: 'Engineering', email: 'john@example.com', status: 'active' },
    { employeeId: 'EMP002', name: 'Jane Smith', department: 'Marketing', email: 'jane@example.com', status: 'active' },
    { employeeId: 'EMP003', name: 'Bob Johnson', department: 'Sales', email: 'bob@example.com', status: 'active' },
  ];

  const createdEmployees = await Employee.insertMany(employees);

  // Add attendance for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Attendance.insertMany([
    { employeeId: createdEmployees[0]._id, date: today, status: 'present', checkInTime: new Date() },
    { employeeId: createdEmployees[1]._id, date: today, status: 'absent' },
    { employeeId: createdEmployees[2]._id, date: today, status: 'present', checkInTime: new Date() },
  ]);

  console.log('✅ Seed data added successfully');
  process.exit();
};

seedData().catch(console.error);
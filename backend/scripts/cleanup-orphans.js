const mongoose = require('mongoose');
const Employee = require('../models/Employee.model');
const Attendance = require('../models/Attendance.model');
require('dotenv').config();

const cleanupOrphans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB');

    // Get all employee IDs
    const employees = await Employee.find({}, '_id');
    const employeeIds = employees.map(emp => emp._id.toString());
    console.log(`👥 Found ${employeeIds.length} employees`);

    // Find all attendance records
    const allAttendance = await Attendance.find();
    console.log(`📋 Found ${allAttendance.length} attendance records`);

    let deleted = 0;
    for (const record of allAttendance) {
      const employeeId = record.employeeId.toString();
      if (!employeeIds.includes(employeeId)) {
        // This attendance record has no matching employee
        await Attendance.findByIdAndDelete(record._id);
        console.log(`🗑️ Deleted orphaned attendance: ${record._id}`);
        deleted++;
      }
    }

    console.log(`✅ Cleaned up ${deleted} orphaned attendance records`);
    console.log(`📊 Remaining attendance: ${await Attendance.countDocuments()}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupOrphans();
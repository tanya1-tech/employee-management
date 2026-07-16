const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: String,  // ✅ Stored as string "YYYY-MM-DD"
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'not-marked'],
    default: 'not-marked',
  },
  checkInTime: {
    type: Date,
  },
  checkOutTime: {
    type: Date,
  },
  duration: {
    hours: Number,
    minutes: Number,
  },
  remarks: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
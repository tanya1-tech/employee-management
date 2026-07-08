const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
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
  remarks: {
    type: String,
    trim: true,
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

// Compound index to ensure unique attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
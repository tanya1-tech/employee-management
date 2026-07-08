const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active',
  },
  role: {
    type: String,
    enum: ['hr', 'employee'],
    default: 'employee',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('Employee', employeeSchema);
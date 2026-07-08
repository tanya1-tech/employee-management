const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authMiddleware, hrOnly } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// ============================================
// GET ROUTES
// ============================================

// Get attendance by date
router.get('/', attendanceController.getAttendance);

// Get today's status (check-in/out status)
router.get('/today-status', attendanceController.getTodayStatus);

// Export attendance to CSV (HR only)
router.get('/export', hrOnly, attendanceController.exportAttendanceCSV);

// Get today's attendance (HR only)
router.get('/today', hrOnly, attendanceController.getTodayAttendance);

// Get attendance summary (HR only)
router.get('/summary', hrOnly, attendanceController.getAttendanceSummary);

// Get attendance stats for dashboard
router.get('/stats', attendanceController.getAttendanceStats);

// Get attendance for a specific employee
router.get('/employee/:employeeId', attendanceController.getEmployeeAttendance);

// ============================================
// POST ROUTES
// ============================================

// Check-in
router.post('/check-in', attendanceController.checkIn);

// Check-out
router.post('/check-out', attendanceController.checkOut);

// Mark attendance with date
router.post('/', attendanceController.markAttendance);

// ============================================
// PUT ROUTES
// ============================================

// Update attendance (HR only)
router.put('/:id', hrOnly, attendanceController.updateAttendance);

// ============================================
// DELETE ROUTES
// ============================================

// Delete attendance (HR only)
router.delete('/:id', hrOnly, attendanceController.deleteAttendance);

module.exports = router;
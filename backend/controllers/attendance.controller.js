const Attendance = require('../models/Attendance.model');
const Employee = require('../models/Employee.model');

// ============================================
// GET ATTENDANCE BY DATE (HR: all, Employee: their own)
// Query param: ?date=YYYY-MM-DD
// ============================================
exports.getAttendance = async (req, res) => {
  try {
    // Get date from query parameter, default to today
    const dateParam = req.query.date;
    let selectedDate;
    
    if (dateParam) {
      selectedDate = new Date(dateParam);
      selectedDate.setHours(0, 0, 0, 0);
    } else {
      selectedDate = new Date();
      selectedDate.setHours(0, 0, 0, 0);
    }
    
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // If employee, return only their records for the selected date
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ userId: req.user.id });
      if (!employee) {
        return res.json({ success: true, attendance: [], stats: { present: 0, absent: 0, late: 0 } });
      }
      
      const attendance = await Attendance.find({
        employeeId: employee._id,
        date: { $gte: selectedDate, $lt: nextDay }
      }).populate('employeeId', 'name employeeId department');
      
      const formatted = attendance.map(record => ({
        id: record._id,
        employeeName: record.employeeId?.name || 'Unknown',
        employeeId: record.employeeId?.employeeId || 'N/A',
        department: record.employeeId?.department || 'N/A',
        date: record.date,
        status: record.status,
        checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
        checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
        attendanceId: record._id,
      }));

      const present = formatted.filter(r => r.status === 'present').length;
      const absent = formatted.filter(r => r.status === 'absent').length;
      const late = formatted.filter(r => r.status === 'late').length;

      return res.json({ 
        success: true, 
        attendance: formatted,
        stats: { present, absent, late },
        date: selectedDate,
      });
    }

    // HR: Get all employees with their attendance for the selected date
    const employees = await Employee.find({});

    const attendanceRecords = await Attendance.find({
      date: { $gte: selectedDate, $lt: nextDay }
    });

    const formatted = employees.map(emp => {
      const record = attendanceRecords.find(a => 
        a.employeeId.toString() === emp._id.toString()
      );
      return {
        id: record?._id || null,
        _id: emp._id,
        employeeName: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        date: selectedDate,
        status: record?.status || 'not-marked',
        checkIn: record?.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
        checkOut: record?.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
        attendanceId: record?._id || null,
      };
    });

    const present = formatted.filter(r => r.status === 'present').length;
    const absent = formatted.filter(r => r.status === 'absent').length;
    const late = formatted.filter(r => r.status === 'late').length;
    const halfDay = formatted.filter(r => r.status === 'half-day').length;

    res.json({ 
      success: true, 
      attendance: formatted,
      stats: { present, absent, late, halfDay, total: formatted.length },
      date: selectedDate,
    });
  } catch (error) {
    console.error('❌ Get attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ============================================
// MARK ATTENDANCE WITH DATE
// ============================================
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, status, checkInTime, checkOutTime, date } = req.body;
    
    let employee;
    let attendanceDate;

    if (date) {
      attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
    } else {
      attendanceDate = new Date();
      attendanceDate.setHours(0, 0, 0, 0);
    }

    if (req.user.role === 'employee') {
      employee = await Employee.findOne({ userId: req.user.id });
      if (!employee) {
        return res.status(404).json({ 
          success: false,
          message: 'Employee profile not found' 
        });
      }
    } else {
      if (employeeId) {
        employee = await Employee.findById(employeeId);
        if (!employee) {
          employee = await Employee.findOne({ employeeId: employeeId });
        }
      }
      
      if (!employee) {
        return res.status(404).json({ 
          success: false,
          message: 'Employee not found' 
        });
      }
    }

    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    let existing = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: attendanceDate, $lt: nextDay }
    });

    if (existing) {
      if (status) existing.status = status;
      if (checkInTime) existing.checkInTime = new Date(checkInTime);
      if (checkOutTime) existing.checkOutTime = new Date(checkOutTime);
      existing.updatedAt = new Date();
      await existing.save();
      
      return res.json({
        success: true,
        attendance: existing,
        message: 'Attendance updated successfully',
      });
    }

    const attendance = new Attendance({
      employeeId: employee._id,
      date: attendanceDate,
      status: status || 'present',
      checkInTime: checkInTime ? new Date(checkInTime) : new Date(),
      checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      attendance,
      message: 'Attendance marked successfully',
    });
  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// ============================================
// GET EMPLOYEE ATTENDANCE
// ============================================
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    let employee;

    if (req.user.role === 'employee') {
      employee = await Employee.findOne({ userId: req.user.id });
      if (!employee) {
        return res.status(404).json({ 
          success: false,
          message: 'Employee profile not found' 
        });
      }
    } else {
      employee = await Employee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ 
          success: false,
          message: 'Employee not found' 
        });
      }
    }

    const attendance = await Attendance.find({ employeeId: employee._id })
      .sort({ date: -1 })
      .populate('employeeId', 'name employeeId department');

    const formatted = attendance.map(record => ({
      id: record._id,
      employeeName: record.employeeId?.name || 'Unknown',
      employeeId: record.employeeId?.employeeId || 'N/A',
      department: record.employeeId?.department || 'N/A',
      date: record.date,
      status: record.status,
      checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
      checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
    }));

    const present = formatted.filter(r => r.status === 'present').length;
    const absent = formatted.filter(r => r.status === 'absent').length;
    const late = formatted.filter(r => r.status === 'late').length;

    res.json({ 
      success: true, 
      attendance: formatted,
      stats: { present, absent, late },
      total: formatted.length,
    });
  } catch (error) {
    console.error('❌ Get employee attendance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// UPDATE ATTENDANCE RECORD (HR ONLY)
// ============================================
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkInTime, checkOutTime, remarks, date } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ 
        success: false,
        message: 'Attendance record not found' 
      });
    }

    if (status) attendance.status = status;
    if (checkInTime) attendance.checkInTime = new Date(checkInTime);
    if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime);
    if (remarks) attendance.remarks = remarks;
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      attendance.date = newDate;
    }
    attendance.updatedAt = new Date();
    
    await attendance.save();

    res.json({
      success: true,
      attendance,
      message: 'Attendance updated successfully',
    });
  } catch (error) {
    console.error('❌ Update attendance error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// ============================================
// DELETE ATTENDANCE RECORD (HR ONLY)
// ============================================
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ 
        success: false,
        message: 'Attendance record not found' 
      });
    }

    await attendance.deleteOne();

    res.json({
      success: true,
      message: 'Attendance deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete attendance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// CHECK-IN (Mark Arrival)
// ============================================
exports.checkIn = async (req, res) => {
  try {
    const { date } = req.body;
    
    let employee;
    let attendanceDate;

    if (date) {
      attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
    } else {
      attendanceDate = new Date();
      attendanceDate.setHours(0, 0, 0, 0);
    }

    console.log('🔍 Check-in attempt for user:', req.user.id, 'role:', req.user.role);

    // Find employee - works for both HR and Employee
    employee = await Employee.findOne({ userId: req.user.id });
    
    if (!employee && req.user.employeeId) {
      employee = await Employee.findOne({ employeeId: req.user.employeeId });
    }
    
    if (!employee && req.user.email) {
      employee = await Employee.findOne({ email: req.user.email });
    }
    
    // If HR is marking for someone else
    if (!employee && req.user.role === 'hr' && req.body.employeeId) {
      employee = await Employee.findById(req.body.employeeId);
      if (!employee) {
        employee = await Employee.findOne({ employeeId: req.body.employeeId });
      }
    }
    
    if (!employee) {
      console.log('❌ Employee not found for user:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found. Please contact HR.'
      });
    }

    console.log('✅ Employee found:', employee.name, employee.employeeId);

    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if already checked in today
    let existing = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: attendanceDate, $lt: nextDay }
    });

    const now = new Date();
    const checkInTime = now;

    if (existing) {
      if (existing.checkInTime) {
        return res.status(400).json({
          success: false,
          message: 'Already checked in today at ' + new Date(existing.checkInTime).toLocaleTimeString()
        });
      }
      
      existing.checkInTime = checkInTime;
      existing.status = 'present';
      existing.updatedAt = new Date();
      await existing.save();
      
      return res.json({
        success: true,
        attendance: existing,
        message: `Check-in successful at ${checkInTime.toLocaleTimeString()}`,
        checkInTime: checkInTime
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      employeeId: employee._id,
      date: attendanceDate,
      status: 'present',
      checkInTime: checkInTime,
      checkOutTime: null,
    });

    await attendance.save();

    console.log(`✅ Check-in successful for: ${employee.name} at ${checkInTime.toLocaleTimeString()}`);

    res.status(201).json({
      success: true,
      attendance,
      message: `Check-in successful at ${checkInTime.toLocaleTimeString()}`,
      checkInTime: checkInTime
    });
  } catch (error) {
    console.error('❌ Check-in error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// ============================================
// CHECK-OUT (Mark Departure)
// ============================================
exports.checkOut = async (req, res) => {
  try {
    const { date } = req.body;
    
    let employee;
    let attendanceDate;

    if (date) {
      attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
    } else {
      attendanceDate = new Date();
      attendanceDate.setHours(0, 0, 0, 0);
    }

    console.log('🔍 Check-out attempt for user:', req.user.id, 'role:', req.user.role);

    // Find employee - works for both HR and Employee
    employee = await Employee.findOne({ userId: req.user.id });
    
    if (!employee && req.user.employeeId) {
      employee = await Employee.findOne({ employeeId: req.user.employeeId });
    }
    
    if (!employee && req.user.email) {
      employee = await Employee.findOne({ email: req.user.email });
    }
    
    // If HR is marking for someone else
    if (!employee && req.user.role === 'hr' && req.body.employeeId) {
      employee = await Employee.findById(req.body.employeeId);
      if (!employee) {
        employee = await Employee.findOne({ employeeId: req.body.employeeId });
      }
    }
    
    if (!employee) {
      console.log('❌ Employee not found for user:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found. Please contact HR.'
      });
    }

    console.log('✅ Employee found:', employee.name, employee.employeeId);

    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find today's attendance record
    let existing = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: attendanceDate, $lt: nextDay }
    });

    console.log('🔍 Attendance record found:', existing ? 'Yes' : 'No');

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'No check-in found for today. Please check-in first.'
      });
    }

    // Check if already checked out
    if (existing.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today at ' + new Date(existing.checkOutTime).toLocaleTimeString()
      });
    }

    // Check if checked in
    if (!existing.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'You have not checked in yet. Please check-in first.'
      });
    }

    // Perform check-out
    const now = new Date();
    existing.checkOutTime = now;
    existing.updatedAt = new Date();
    await existing.save();

    // Calculate duration
    const durationMs = now.getTime() - new Date(existing.checkInTime).getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    console.log(`✅ Check-out successful for: ${employee.name} at ${now.toLocaleTimeString()}`);

    res.json({
      success: true,
      attendance: existing,
      message: `Check-out successful at ${now.toLocaleTimeString()}`,
      checkOutTime: now,
      duration: {
        hours,
        minutes,
        totalMinutes: Math.floor(durationMs / (1000 * 60))
      }
    });
  } catch (error) {
    console.error('❌ Check-out error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Use local date instead of UTC
const today = new Date();
const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

// ============================================
// GET TODAY'S STATUS (Check-in/out status)
// ============================================
exports.getTodayStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.json({
        success: true,
        status: 'not-marked',
        isCheckedIn: false,
        isCheckedOut: false,
        date: null,
      });
    }

    const record = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    res.json({
      success: true,
      status: record?.status || 'not-marked',
      checkInTime: record?.checkInTime || null,
      checkOutTime: record?.checkOutTime || null,
      isCheckedIn: !!record?.checkInTime,
      isCheckedOut: !!record?.checkOutTime,
      duration: record?.duration || null,
      date: record?.date || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET TODAY'S ATTENDANCE (HR ONLY)
// ============================================
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('employeeId', 'name employeeId department');

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const halfDay = records.filter(r => r.status === 'half-day').length;

    const formatted = records.map(record => ({
      id: record._id,
      employeeName: record.employeeId?.name || 'Unknown',
      employeeId: record.employeeId?.employeeId || 'N/A',
      department: record.employeeId?.department || 'N/A',
      status: record.status,
      checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
      checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
    }));

    res.json({ 
      success: true, 
      attendance: formatted,
      summary: { present, absent, late, halfDay, total: records.length },
      date: today,
    });
  } catch (error) {
    console.error('❌ Get today attendance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// GET ATTENDANCE SUMMARY (HR ONLY)
// ============================================
exports.getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const present = todayRecords.filter(r => r.status === 'present').length;
    const absent = todayRecords.filter(r => r.status === 'absent').length;
    const late = todayRecords.filter(r => r.status === 'late').length;
    const halfDay = todayRecords.filter(r => r.status === 'half-day').length;
    
    const total = await Employee.countDocuments();
    const markedToday = todayRecords.length;
    const rate = total > 0 ? Math.round((markedToday / total) * 100) : 0;

    res.json({
      success: true,
      summary: {
        today: {
          present,
          absent,
          late,
          halfDay,
          totalMarked: markedToday,
          totalEmployees: total,
          rate,
        }
      },
      date: today,
    });
  } catch (error) {
    console.error('❌ Get attendance summary error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// GET ATTENDANCE STATS FOR DASHBOARD
// ============================================
exports.getAttendanceStats = async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ userId: req.user.id });
      if (!employee) {
        return res.json({ 
          success: true, 
          stats: { totalPresent: 0, todayStatus: 'Not Marked' } 
        });
      }

      const allAttendance = await Attendance.find({ employeeId: employee._id });
      const totalPresent = allAttendance.filter(a => a.status === 'present').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayRecord = await Attendance.findOne({
        employeeId: employee._id,
        date: { $gte: today, $lt: tomorrow }
      });

      return res.json({
        success: true,
        stats: {
          totalPresent,
          todayStatus: todayRecord?.status || 'Not Marked',
        }
      });
    }

    const totalEmployees = await Employee.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const present = todayRecords.filter(r => r.status === 'present').length;
    const absent = todayRecords.filter(r => r.status === 'absent').length;
    const late = todayRecords.filter(r => r.status === 'late').length;

    res.json({
      success: true,
      stats: {
        totalEmployees,
        presentToday: present,
        absentToday: absent,
        lateToday: late,
        attendanceRate: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
      }
    });
  } catch (error) {
    console.error('❌ Get attendance stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// EXPORT ATTENDANCE TO CSV
// ============================================
exports.exportAttendanceCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    let dateRangeText = 'All Time';
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { date: { $gte: start, $lte: end } };
      dateRangeText = `${startDate} to ${endDate}`;
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter = { date: { $gte: start, $lt: nextDay } };
      dateRangeText = startDate;
    }

    let attendanceRecords;
    let employees;

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ userId: req.user.id });
      if (!employee) {
        return res.status(404).json({ 
          success: false,
          message: 'Employee not found' 
        });
      }
      
      attendanceRecords = await Attendance.find({
        employeeId: employee._id,
        ...dateFilter
      }).populate('employeeId', 'name employeeId department');
      
      employees = [employee];
    } else {
      employees = await Employee.find({});
      attendanceRecords = await Attendance.find(dateFilter).populate('employeeId', 'name employeeId department');
    }

    const csvRows = [];
    
    // Headers
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Status', 'Check In', 'Check Out'];
    csvRows.push(headers.join(','));

    if (attendanceRecords.length === 0) {
      csvRows.push(['No attendance records found', '', '', '', '', '', ''].join(','));
    } else {
      attendanceRecords.forEach(record => {
        const row = [
          record.date ? new Date(record.date).toLocaleDateString('en-US') : 'N/A',
          record.employeeId?.employeeId || 'N/A',
          record.employeeId?.name || 'Unknown',
          record.employeeId?.department || 'N/A',
          record.status || 'not-marked',
          record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
          record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'
        ];
        csvRows.push(row.join(','));
      });
    }

    const csvString = csvRows.join('\n');
    const filename = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    res.send(csvString);

    console.log(`📊 Exported attendance CSV: ${attendanceRecords.length} records (${dateRangeText})`);
    
  } catch (error) {
    console.error('❌ Export CSV error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to export attendance data' 
    });
  }
};
const Employee = require('../models/Employee.model');
const Attendance = require('../models/Attendance.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total employees
    const totalEmployees = await Employee.countDocuments();
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    // Get valid employee IDs (for filtering orphaned records)
    const employeeIds = await Employee.find({}, '_id');
    const validEmployeeIds = new Set(employeeIds.map(emp => emp._id.toString()));

    // Filter attendance to only include valid employees
    const validAttendance = todayAttendance.filter(a => 
      validEmployeeIds.has(a.employeeId.toString())
    );

    // Calculate stats from valid attendance
    const presentToday = validAttendance.filter(a => a.status === 'present').length;
    const absentToday = validAttendance.filter(a => a.status === 'absent').length;
    const lateToday = validAttendance.filter(a => a.status === 'late').length;
    const halfDayToday = validAttendance.filter(a => a.status === 'half-day').length;

    // Calculate attendance rate
    const markedToday = validAttendance.filter(a => a.status !== 'not-marked').length;
    const attendanceRate = totalEmployees > 0 
      ? Math.round((markedToday / totalEmployees) * 100) 
      : 0;

    // Get recent activities (last 10)
    const recentActivities = await Attendance.find({
      employeeId: { $in: employeeIds.map(e => e._id) }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('employeeId', 'name employeeId');

    // Format activities
    const formattedActivities = recentActivities.map(activity => {
      const statusMap = {
        'present': { icon: '✅', class: 'bg-green-100 text-green-600' },
        'absent': { icon: '❌', class: 'bg-red-100 text-red-600' },
        'late': { icon: '⏰', class: 'bg-yellow-100 text-yellow-600' },
        'half-day': { icon: '🌓', class: 'bg-orange-100 text-orange-600' },
      };

      const statusInfo = statusMap[activity.status] || statusMap['present'];
      
      return {
        id: activity._id,
        icon: statusInfo.icon,
        description: `${activity.employeeId?.name || 'Employee'} marked as ${activity.status}`,
        time: activity.createdAt || activity.date,
        status: activity.status.charAt(0).toUpperCase() + activity.status.slice(1),
        statusClass: statusInfo.class,
      };
    });

    // If no activities, add a helpful message
    if (formattedActivities.length === 0) {
      formattedActivities.push({
        id: '1',
        icon: 'ℹ️',
        description: 'No attendance records yet. Start marking attendance!',
        time: new Date(),
        status: 'Info',
        statusClass: 'bg-blue-100 text-blue-600',
      });
    }

    res.json({
      success: true,
      stats: {
        totalEmployees: totalEmployees || 0,
        presentToday: presentToday || 0,
        absentToday: absentToday || 0,
        lateToday: lateToday || 0,
        halfDayToday: halfDayToday || 0,
        attendanceRate: attendanceRate || 0,
      },
      recentActivities: formattedActivities,
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    
    // Return empty data on error
    res.json({
      success: true,
      stats: {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        halfDayToday: 0,
        attendanceRate: 0,
      },
      recentActivities: [
        {
          id: '1',
          icon: '⚠️',
          description: 'Error loading activities. Please try again.',
          time: new Date(),
          status: 'Error',
          statusClass: 'bg-red-100 text-red-600',
        }
      ]
    });
  }
};
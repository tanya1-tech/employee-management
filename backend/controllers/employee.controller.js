const Employee = require('../models/Employee.model');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');
const bcrypt = require('bcryptjs');

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .sort({ employeeId: 1 })
      .populate('userId', 'username email isActive');
    
    res.json({ 
      success: true, 
      employees 
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.json({ 
      success: true, 
      employees: [] 
    });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'username email isActive');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    res.json({ 
      success: true, 
      employee 
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Create employee with auto user creation
exports.createEmployee = async (req, res) => {
  try {
    const { name, department, email, phone, position, status } = req.body;

    // 1. Check if employee exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ 
        success: false,
        message: 'Employee with this email already exists' 
      });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'A user with this email already exists' 
      });
    }

    // 3. Generate employee ID
    const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
    let employeeId = 'EMP001';
    if (lastEmployee) {
      const lastId = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      employeeId = `EMP${String(lastId + 1).padStart(3, '0')}`;
    }

    // 4. Generate username and password
    const username = email.split('@')[0];
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 5. Create user account
    const user = new User({
      username: username,
      email: email,
      name: name,
      password: hashedPassword,
      role: 'employee',
      employeeId: employeeId,
      isActive: true,
    });

    await user.save();
    console.log(`✅ User created: ${username}`);

    // 6. Create employee
    const employee = new Employee({
      employeeId,
      name,
      department,
      email,
      phone,
      position,
      status: status || 'active',
      userId: user._id,
    });

    await employee.save();
    console.log(`✅ Employee created: ${employeeId}`);

    // 7. Return success with login details
    res.status(201).json({
      success: true,
      employee: employee,
      loginCredentials: {
        username: username,
        password: defaultPassword,
        email: email,
      },
      message: `Employee created successfully. Login: ${username} / ${defaultPassword}`,
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates._id;
    delete updates.employeeId;
    delete updates.userId;

    // Check if email is being changed and if it's already taken
    if (updates.email) {
      const existing = await Employee.findOne({ 
        email: updates.email, 
        _id: { $ne: id } 
      });
      if (existing) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already in use' 
        });
      }

      // Also update user email
      const employee = await Employee.findById(id);
      if (employee && employee.userId) {
        await User.findByIdAndUpdate(employee.userId, { 
          email: updates.email,
          username: updates.email.split('@')[0],
          name: updates.name || employee.name,
        });
      }
    }

    // Update name in user as well
    if (updates.name) {
      const employee = await Employee.findById(id);
      if (employee && employee.userId) {
        await User.findByIdAndUpdate(employee.userId, { 
          name: updates.name 
        });
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    console.log(`✅ Employee updated: ${employee.employeeId}`);

    res.json({
      success: true,
      employee,
      message: 'Employee updated successfully',
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// Delete employee (also deletes user and attendance)
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Delete user account
    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
      console.log(`🗑️ Deleted user for ${employee.name}`);
    }

    // Delete attendance records
    await Attendance.deleteMany({ employeeId: id });
    console.log(`🗑️ Deleted attendance for ${employee.name}`);

    // Delete employee
    await Employee.findByIdAndDelete(id);
    console.log(`🗑️ Deleted employee: ${employee.name} (${employee.employeeId})`);

    res.json({
      success: true,
      message: `Employee ${employee.name} and associated data deleted successfully`,
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};
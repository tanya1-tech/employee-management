const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '7d',
  });
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔍 Login attempt:', { 
      username, 
      passwordLength: password?.length 
    });

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ User found:', {
      username: user.username,
      email: user.email,
      role: user.role,
    });

    if (user.isActive === false) {
      console.log('❌ User is inactive:', username);
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log('🔍 Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Invalid password for:', username);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ Login successful for:', username);

    const token = generateToken(user._id);

    let employee = null;
    if (user.employeeId) {
      employee = await Employee.findOne({ employeeId: user.employeeId });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name || user.username,
        employeeId: user.employeeId,
        department: employee?.department || null,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    let employee = null;
    if (user.employeeId) {
      employee = await Employee.findOne({ employeeId: user.employeeId });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name || user.username,
        employeeId: user.employeeId,
        department: employee?.department || null,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    console.log('✅ Password changed for:', user.username);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ============================================
// RESET PASSWORD (HR ONLY)
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Check if user is HR
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || currentUser.role !== 'hr') {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized. Only HR can reset passwords.' 
      });
    }

    // Find user to reset
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Reset password
    user.password = newPassword || 'password123';
    user.updatedAt = new Date();
    await user.save();

    console.log('✅ Password reset for:', user.username);

    res.json({
      success: true,
      message: 'Password reset successfully',
      newPassword: newPassword || 'password123',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
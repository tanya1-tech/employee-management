const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware, hrOnly } = require('../middleware/auth.middleware');

// ============================================
// PUBLIC ROUTES
// ============================================

// Login (public)
router.post('/login', authController.login);

// ============================================
// PROTECTED ROUTES
// ============================================

// Get current user (authenticated)
router.get('/me', authMiddleware, authController.getCurrentUser);

// Change password (authenticated)
router.post('/change-password', authMiddleware, authController.changePassword);

// Reset password (HR only)
router.post('/reset-password', authMiddleware, hrOnly, authController.resetPassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authMiddleware, hrOnly } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get all employees
router.get('/', employeeController.getEmployees);

// Create employee (HR only)
router.post('/', hrOnly, employeeController.createEmployee);

// Update employee (HR only)
router.put('/:id', hrOnly, employeeController.updateEmployee);

// Delete employee (HR only)
router.delete('/:id', hrOnly, employeeController.deleteEmployee);

module.exports = router;
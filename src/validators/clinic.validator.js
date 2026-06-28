const { body, param } = require('express-validator');

const createClinicValidator = [
  body('name').trim().notEmpty().withMessage('Clinic name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').optional().trim(),
];

const updateClinicValidator = [
  body('name').optional().trim().notEmpty().withMessage('Clinic name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('phone').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { createClinicValidator, updateClinicValidator };

const { body, query } = require('express-validator');

const registerBusinessValidator = [
  body('bio').optional().trim(),
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
];

const updateProviderValidator = [
  body('bio').optional().trim(),
];

const updateBusinessValidator = [
  body('name').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
];

const listProvidersValidator = [
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

module.exports = {
  registerBusinessValidator,
  updateProviderValidator,
  updateBusinessValidator,
  listProvidersValidator,
};

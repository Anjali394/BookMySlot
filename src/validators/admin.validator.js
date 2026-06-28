const { query, param } = require('express-validator');

const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['CUSTOMER', 'PROVIDER', 'ADMIN']).withMessage('Invalid role'),
  query('search').optional().trim(),
];

const listBookingsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'CANCELLED'])
    .withMessage('Invalid status'),
];

module.exports = { listUsersValidator, listBookingsValidator };

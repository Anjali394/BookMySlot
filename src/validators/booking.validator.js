const { body } = require('express-validator');

const createBookingValidator = [
  body('slotId').notEmpty().withMessage('slotId is required'),
  body('notes').optional().trim(),
];

const updateBookingStatusValidator = [
  body('status')
    .isIn(['CONFIRMED', 'REJECTED'])
    .withMessage('Status must be CONFIRMED or REJECTED'),
  body('reason').optional().trim(),
];

const cancelBookingValidator = [
  body('reason').optional().trim(),
];

module.exports = {
  createBookingValidator,
  updateBookingStatusValidator,
  cancelBookingValidator,
};

const { body, query } = require('express-validator');

const createAvailabilityValidator = [
  body('dayOfWeek')
    .isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
    .withMessage('Invalid day of week'),
  body('startTime')
    .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
    .withMessage('startTime must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
    .withMessage('endTime must be in HH:MM format'),
  body('slotDuration')
    .isInt({ min: 5, max: 240 })
    .withMessage('slotDuration must be between 5 and 240 minutes'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
];

const generateSlotsValidator = [
  body('clinicId').notEmpty().withMessage('clinicId is required'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date must be in YYYY-MM-DD format'),
];

const listSlotsValidator = [
  query('clinicId').notEmpty().withMessage('clinicId is required'),
  query('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date must be in YYYY-MM-DD format'),
];

const blockSlotValidator = [
  body('isBlocked').isBoolean().withMessage('isBlocked must be a boolean'),
];

module.exports = {
  createAvailabilityValidator,
  generateSlotsValidator,
  listSlotsValidator,
  blockSlotValidator,
};

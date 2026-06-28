const { Router } = require('express');
const controller = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createBookingValidator,
  updateBookingStatusValidator,
  cancelBookingValidator,
} = require('../validators/booking.validator');

const router = Router();

// Customer routes
router.post('/', authenticate, authorize('CUSTOMER'), createBookingValidator, controller.createBooking);
router.get('/my', authenticate, authorize('CUSTOMER'), controller.getMyBookings);
router.patch('/:id/cancel', authenticate, authorize('CUSTOMER', 'PROVIDER'), cancelBookingValidator, controller.cancelBooking);

// Provider routes
router.get('/provider', authenticate, authorize('PROVIDER'), controller.getProviderBookings);
router.patch('/:id/status', authenticate, authorize('PROVIDER'), updateBookingStatusValidator, controller.updateBookingStatus);

// Shared — must be last to avoid swallowing /my and /provider
router.get('/:id', authenticate, controller.getBookingById);

module.exports = router;

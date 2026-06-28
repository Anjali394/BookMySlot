const { Router } = require('express');
const controller = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { listUsersValidator, listBookingsValidator } = require('../validators/admin.validator');

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', controller.getStats);
router.get('/users', listUsersValidator, controller.listUsers);
router.get('/users/:id', controller.getUserById);
router.patch('/users/:id/suspend', controller.suspendUser);
router.get('/providers', controller.listProviders);
router.get('/bookings', listBookingsValidator, controller.listBookings);

module.exports = router;

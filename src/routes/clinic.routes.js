const { Router } = require('express');
const controller = require('../controllers/clinic.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createClinicValidator, updateClinicValidator } = require('../validators/clinic.validator');
const { createAvailabilityValidator } = require('../validators/slot.validator');

const router = Router();

// Public
router.get('/:id', controller.getClinicById);
router.get('/:id/availability', controller.getClinicAvailability);

// Provider only
router.post('/', authenticate, authorize('PROVIDER'), createClinicValidator, controller.createClinic);
router.get('/my/list', authenticate, authorize('PROVIDER'), controller.getMyClinics);
router.put('/:id', authenticate, authorize('PROVIDER'), updateClinicValidator, controller.updateClinic);
router.post('/:id/availability', authenticate, authorize('PROVIDER'), createAvailabilityValidator, controller.addAvailability);
router.delete('/:id/availability/:availabilityId', authenticate, authorize('PROVIDER'), controller.removeAvailability);

module.exports = router;

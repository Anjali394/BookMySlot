const { Router } = require('express');
const controller = require('../controllers/provider.controller');
const { authenticate, authorize } = require('../middleware/auth');
const {
  registerBusinessValidator,
  updateProviderValidator,
  updateBusinessValidator,
  listProvidersValidator,
} = require('../validators/provider.validator');

const router = Router();

// Provider-only routes (must be before /:id)
router.post(
  '/register-business',
  authenticate,
  authorize('PROVIDER'),
  registerBusinessValidator,
  controller.registerBusiness
);
router.get('/me', authenticate, authorize('PROVIDER'), controller.getMyProfile);
router.put(
  '/me',
  authenticate,
  authorize('PROVIDER'),
  updateProviderValidator,
  controller.updateMyProfile
);
router.put(
  '/business',
  authenticate,
  authorize('PROVIDER'),
  updateBusinessValidator,
  controller.updateMyBusiness
);

// Public routes
router.get('/', listProvidersValidator, controller.listProviders);
router.get('/:id', controller.getProviderById);

module.exports = router;

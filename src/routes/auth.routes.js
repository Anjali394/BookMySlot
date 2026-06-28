const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} = require('../validators/auth.validator');

const router = Router();

router.post('/register', authLimiter, registerValidator, controller.register);
router.post('/login', authLimiter, loginValidator, controller.login);
router.post('/refresh', refreshTokenValidator, controller.refresh);
router.post('/logout', refreshTokenValidator, controller.logout);
router.get('/me', authenticate, controller.getMe);

module.exports = router;

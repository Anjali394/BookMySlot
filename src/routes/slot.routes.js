const { Router } = require('express');
const controller = require('../controllers/slot.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { generateSlotsValidator, listSlotsValidator, blockSlotValidator } = require('../validators/slot.validator');

const router = Router();

// Public — list available slots for a clinic on a date
router.get('/', listSlotsValidator, controller.listSlots);

// Provider only
router.post('/generate', authenticate, authorize('PROVIDER'), generateSlotsValidator, controller.generateSlots);
router.patch('/:id/block', authenticate, authorize('PROVIDER'), blockSlotValidator, controller.blockSlot);

module.exports = router;

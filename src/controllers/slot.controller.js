const { validationResult } = require('express-validator');
const slotService = require('../services/slot.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw ApiError.badRequest('Validation failed', errors.array());
};

const generateSlots = async (req, res, next) => {
  try {
    validate(req);
    const result = await slotService.generateSlots(req.user.id, req.body);
    ApiResponse.created(res, 'Slots generated successfully', result);
  } catch (err) { next(err); }
};

const listSlots = async (req, res, next) => {
  try {
    validate(req);
    const result = await slotService.listSlots(req.query);
    ApiResponse.success(res, 'Slots fetched', result);
  } catch (err) { next(err); }
};

const blockSlot = async (req, res, next) => {
  try {
    validate(req);
    const result = await slotService.blockSlot(req.user.id, req.params.id, req.body.isBlocked);
    ApiResponse.success(res, 'Slot updated', result);
  } catch (err) { next(err); }
};

module.exports = { generateSlots, listSlots, blockSlot };

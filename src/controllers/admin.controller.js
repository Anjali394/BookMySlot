const { validationResult } = require('express-validator');
const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw ApiError.badRequest('Validation failed', errors.array());
};

const listUsers = async (req, res, next) => {
  try {
    validate(req);
    const result = await adminService.listUsers(req.query);
    ApiResponse.success(res, 'Users fetched', result);
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const result = await adminService.getUserById(req.params.id);
    ApiResponse.success(res, 'User fetched', result);
  } catch (err) { next(err); }
};

const suspendUser = async (req, res, next) => {
  try {
    const isActive = req.body.isActive;
    if (typeof isActive !== 'boolean') {
      throw ApiError.badRequest('isActive must be a boolean');
    }
    const result = await adminService.suspendUser(req.params.id, isActive);
    const msg = isActive ? 'User activated' : 'User suspended';
    ApiResponse.success(res, msg, result);
  } catch (err) { next(err); }
};

const listProviders = async (req, res, next) => {
  try {
    const result = await adminService.listProviders(req.query);
    ApiResponse.success(res, 'Providers fetched', result);
  } catch (err) { next(err); }
};

const listBookings = async (req, res, next) => {
  try {
    validate(req);
    const result = await adminService.listBookings(req.query);
    ApiResponse.success(res, 'Bookings fetched', result);
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const result = await adminService.getStats();
    ApiResponse.success(res, 'Stats fetched', result);
  } catch (err) { next(err); }
};

module.exports = { listUsers, getUserById, suspendUser, listProviders, listBookings, getStats };

const { validationResult } = require('express-validator');
const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw ApiError.badRequest('Validation failed', errors.array());
};

const createBooking = async (req, res, next) => {
  try {
    validate(req);
    const result = await bookingService.createBooking(req.user.id, req.body);
    ApiResponse.created(res, 'Booking created successfully', result);
  } catch (err) { next(err); }
};

const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getMyBookings(req.user.id, req.query.page, req.query.limit);
    ApiResponse.success(res, 'Bookings fetched', result);
  } catch (err) { next(err); }
};

const getBookingById = async (req, res, next) => {
  try {
    const result = await bookingService.getBookingById(req.user.id, req.user.role, req.params.id);
    ApiResponse.success(res, 'Booking fetched', result);
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  try {
    validate(req);
    const result = await bookingService.cancelBooking(req.user.id, req.user.role, req.params.id, req.body.reason);
    ApiResponse.success(res, 'Booking cancelled', result);
  } catch (err) { next(err); }
};

const getProviderBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getProviderBookings(req.user.id, req.query.page, req.query.limit);
    ApiResponse.success(res, 'Bookings fetched', result);
  } catch (err) { next(err); }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    validate(req);
    const result = await bookingService.updateBookingStatus(
      req.user.id, req.params.id, req.body.status, req.body.reason
    );
    ApiResponse.success(res, `Booking ${req.body.status.toLowerCase()}`, result);
  } catch (err) { next(err); }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getProviderBookings,
  updateBookingStatus,
};

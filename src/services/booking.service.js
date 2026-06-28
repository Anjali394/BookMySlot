const prisma = require('../config/db');
const slotRepo = require('../repositories/slot.repository');
const bookingRepo = require('../repositories/booking.repository');
const providerRepo = require('../repositories/provider.repository');
const ApiError = require('../utils/ApiError');

const createBooking = async (userId, { slotId, notes }) => {
  const slot = await slotRepo.findSlotWithBookingCount(slotId);
  if (!slot) throw ApiError.notFound('Slot not found');
  if (slot.isBlocked) throw ApiError.badRequest('This slot is blocked');

  const activeBookings = slot._count.bookings;
  if (activeBookings >= slot.totalCapacity) {
    throw ApiError.badRequest('Slot is fully booked');
  }

  return bookingRepo.createBooking({ slotId, userId, notes });
};

const getMyBookings = async (userId, page = 1, limit = 10) => {
  const [bookings, total] = await Promise.all([
    bookingRepo.findBookingsByUser(userId, parseInt(page), parseInt(limit)),
    bookingRepo.countBookingsByUser(userId),
  ]);
  return {
    bookings,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
  };
};

const getBookingById = async (userId, role, bookingId) => {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  if (role === 'CUSTOMER' && booking.userId !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  if (role === 'PROVIDER') {
    const provider = await providerRepo.findProviderByUserId(userId);
    if (!provider || booking.slot.clinic.providerId !== provider.id) {
      throw ApiError.forbidden('Access denied');
    }
  }

  return booking;
};

const cancelBooking = async (userId, role, bookingId, reason) => {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  if (role === 'CUSTOMER' && booking.userId !== userId) {
    throw ApiError.forbidden('You can only cancel your own bookings');
  }

  if (!['PENDING_CONFIRMATION', 'CONFIRMED'].includes(booking.status)) {
    throw ApiError.badRequest(`Cannot cancel a booking with status ${booking.status}`);
  }

  return bookingRepo.updateBookingStatus(bookingId, 'CANCELLED', reason);
};

const getProviderBookings = async (userId, page = 1, limit = 10) => {
  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider) throw ApiError.notFound('Provider profile not found');

  const [bookings, total] = await Promise.all([
    bookingRepo.findProviderBookings(provider.id, parseInt(page), parseInt(limit)),
    bookingRepo.countProviderBookings(provider.id),
  ]);

  return {
    bookings,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
  };
};

const updateBookingStatus = async (userId, bookingId, status, reason) => {
  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider) throw ApiError.notFound('Provider profile not found');

  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  if (booking.slot.clinic.providerId !== provider.id) {
    throw ApiError.forbidden('This booking does not belong to your clinic');
  }

  if (booking.status !== 'PENDING_CONFIRMATION') {
    throw ApiError.badRequest(`Cannot update a booking with status ${booking.status}`);
  }

  return bookingRepo.updateBookingStatus(bookingId, status, reason);
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getProviderBookings,
  updateBookingStatus,
};

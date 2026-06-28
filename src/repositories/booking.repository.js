const prisma = require('../config/db');

const createBooking = (data) =>
  prisma.booking.create({
    data,
    include: { slot: true, user: { select: { id: true, name: true, email: true } } },
  });

const findBookingById = (id) =>
  prisma.booking.findUnique({
    where: { id },
    include: {
      slot: { include: { clinic: true } },
      user: { select: { id: true, name: true, email: true } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
    },
  });

const findBookingsByUser = (userId, page, limit) =>
  prisma.booking.findMany({
    where: { userId },
    include: {
      slot: { include: { clinic: true } },
      statusHistory: { orderBy: { changedAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

const countBookingsByUser = (userId) =>
  prisma.booking.count({ where: { userId } });

const findBookingsBySlot = (slotId) =>
  prisma.booking.findMany({
    where: { slotId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

const findProviderBookings = (providerId, page, limit) =>
  prisma.booking.findMany({
    where: { slot: { clinic: { providerId } } },
    include: {
      slot: { include: { clinic: true } },
      user: { select: { id: true, name: true, email: true } },
      statusHistory: { orderBy: { changedAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

const countProviderBookings = (providerId) =>
  prisma.booking.count({ where: { slot: { clinic: { providerId } } } });

const updateBookingStatus = (id, status, reason) =>
  prisma.$transaction([
    prisma.booking.update({ where: { id }, data: { status } }),
    prisma.bookingStatusHistory.create({ data: { bookingId: id, status, reason } }),
  ]).then(([booking]) => booking);

const countActiveBookingsForSlot = (slotId) =>
  prisma.booking.count({
    where: { slotId, status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED'] } },
  });

module.exports = {
  createBooking,
  findBookingById,
  findBookingsByUser,
  countBookingsByUser,
  findBookingsBySlot,
  findProviderBookings,
  countProviderBookings,
  updateBookingStatus,
  countActiveBookingsForSlot,
};

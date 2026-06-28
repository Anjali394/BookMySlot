const prisma = require('../config/db');

const listUsers = ({ search, role, skip, take }) =>
  prisma.user.findMany({
    where: {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

const countUsers = ({ search, role }) =>
  prisma.user.count({
    where: {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
  });

const findUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
      provider: { include: { business: true } },
      _count: { select: { bookings: true } },
    },
  });

const setUserActive = (id, isActive) =>
  prisma.user.update({ where: { id }, data: { isActive } });

const listAllProviders = ({ skip, take }) =>
  prisma.provider.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      business: true,
      _count: { select: { clinics: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

const countAllProviders = () => prisma.provider.count();

const listAllBookings = ({ status, skip, take }) =>
  prisma.booking.findMany({
    where: { ...(status && { status }) },
    include: {
      user: { select: { id: true, name: true, email: true } },
      slot: { include: { clinic: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

const countAllBookings = ({ status }) =>
  prisma.booking.count({ where: { ...(status && { status }) } });

const getStats = () =>
  prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PROVIDER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'PENDING_CONFIRMATION' } }),
    prisma.clinic.count(),
    prisma.slot.count(),
  ]).then(([totalUsers, totalProviders, totalCustomers, totalBookings, confirmedBookings, pendingBookings, totalClinics, totalSlots]) => ({
    totalUsers,
    totalProviders,
    totalCustomers,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalClinics,
    totalSlots,
  }));

module.exports = {
  listUsers,
  countUsers,
  findUserById,
  setUserActive,
  listAllProviders,
  countAllProviders,
  listAllBookings,
  countAllBookings,
  getStats,
};

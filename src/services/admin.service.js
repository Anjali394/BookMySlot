const repo = require('../repositories/admin.repository');
const ApiError = require('../utils/ApiError');

const listUsers = async ({ search, role, page = 1, limit = 10 }) => {
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;
  const [users, total] = await Promise.all([
    repo.listUsers({ search, role, skip, take }),
    repo.countUsers({ search, role }),
  ]);
  return {
    users,
    pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
  };
};

const getUserById = async (id) => {
  const user = await repo.findUserById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const suspendUser = async (id, isActive) => {
  const user = await repo.findUserById(id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'ADMIN') throw ApiError.forbidden('Cannot suspend an admin account');
  return repo.setUserActive(id, isActive);
};

const listProviders = async ({ page = 1, limit = 10 }) => {
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;
  const [providers, total] = await Promise.all([
    repo.listAllProviders({ skip, take }),
    repo.countAllProviders(),
  ]);
  return {
    providers,
    pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
  };
};

const listBookings = async ({ status, page = 1, limit = 10 }) => {
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;
  const [bookings, total] = await Promise.all([
    repo.listAllBookings({ status, skip, take }),
    repo.countAllBookings({ status }),
  ]);
  return {
    bookings,
    pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
  };
};

const getStats = () => repo.getStats();

module.exports = { listUsers, getUserById, suspendUser, listProviders, listBookings, getStats };

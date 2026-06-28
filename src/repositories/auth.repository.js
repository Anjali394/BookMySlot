const prisma = require('../config/db');

const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

const findUserById = (id) =>
  prisma.user.findUnique({ where: { id } });

const createUser = (data) =>
  prisma.user.create({ data });

const saveRefreshToken = (data) =>
  prisma.refreshToken.create({ data });

const findRefreshToken = (token) =>
  prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });

const deleteRefreshToken = (token) =>
  prisma.refreshToken.delete({ where: { token } });

const deleteAllUserRefreshTokens = (userId) =>
  prisma.refreshToken.deleteMany({ where: { userId } });

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
};

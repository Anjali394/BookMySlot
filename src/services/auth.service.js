const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} = require('../config/env');
const repo = require('../repositories/auth.repository');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 12;

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, role = 'CUSTOMER' }) => {
  const existing = await repo.findUserByEmail(email);
  if (existing) throw ApiError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await repo.createUser({ name, email, passwordHash, role });

  const { accessToken, refreshToken } = generateTokens(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await repo.saveRefreshToken({ userId: user.id, token: refreshToken, expiresAt });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const user = await repo.findUserByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('Account is suspended');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const { accessToken, refreshToken } = generateTokens(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await repo.saveRefreshToken({ userId: user.id, token: refreshToken, expiresAt });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const refresh = async (token) => {
  const stored = await repo.findRefreshToken(token);
  if (!stored) throw ApiError.unauthorized('Invalid refresh token');
  if (new Date() > stored.expiresAt) {
    await repo.deleteRefreshToken(token);
    throw ApiError.unauthorized('Refresh token expired');
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  await repo.deleteRefreshToken(token);

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(stored.user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 1 day
  await repo.saveRefreshToken({
    userId: stored.user.id,
    token: newRefreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (token) => {
  const stored = await repo.findRefreshToken(token);
  if (!stored) throw ApiError.badRequest('Invalid refresh token');
  await repo.deleteRefreshToken(token);
};

const getMe = async (userId) => {
  const user = await repo.findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
};

module.exports = { register, login, refresh, logout, getMe };

const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const validate = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed', errors.array());
  }
};

const register = async (req, res, next) => {
  try {
    validate(req, next);
    const result = await authService.register(req.body);
    ApiResponse.created(res, 'Registration successful', result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    validate(req, next);
    const result = await authService.login(req.body);
    ApiResponse.success(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    validate(req, next);
    const result = await authService.refresh(req.body.refreshToken);
    ApiResponse.success(res, 'Token refreshed', result);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    validate(req, next);
    await authService.logout(req.body.refreshToken);
    ApiResponse.success(res, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    ApiResponse.success(res, 'User profile fetched', user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe };

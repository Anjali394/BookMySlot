const { validationResult } = require('express-validator');
const providerService = require('../services/provider.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw ApiError.badRequest('Validation failed', errors.array());
};

const registerBusiness = async (req, res, next) => {
  try {
    validate(req);
    const result = await providerService.registerBusiness(req.user.id, req.body);
    ApiResponse.created(res, 'Business registered successfully', result);
  } catch (err) {
    next(err);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const result = await providerService.getMyProfile(req.user.id);
    ApiResponse.success(res, 'Provider profile fetched', result);
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    validate(req);
    const result = await providerService.updateMyProfile(req.user.id, req.body);
    ApiResponse.success(res, 'Provider profile updated', result);
  } catch (err) {
    next(err);
  }
};

const updateMyBusiness = async (req, res, next) => {
  try {
    validate(req);
    const result = await providerService.updateMyBusiness(req.user.id, req.body);
    ApiResponse.success(res, 'Business updated successfully', result);
  } catch (err) {
    next(err);
  }
};

const listProviders = async (req, res, next) => {
  try {
    validate(req);
    const result = await providerService.listProviders(req.query);
    ApiResponse.success(res, 'Providers fetched', result);
  } catch (err) {
    next(err);
  }
};

const getProviderById = async (req, res, next) => {
  try {
    const result = await providerService.getProviderById(req.params.id);
    ApiResponse.success(res, 'Provider fetched', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerBusiness,
  getMyProfile,
  updateMyProfile,
  updateMyBusiness,
  listProviders,
  getProviderById,
};

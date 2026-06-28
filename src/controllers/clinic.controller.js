const { validationResult } = require('express-validator');
const clinicService = require('../services/clinic.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw ApiError.badRequest('Validation failed', errors.array());
};

const createClinic = async (req, res, next) => {
  try {
    validate(req);
    const result = await clinicService.createClinic(req.user.id, req.body);
    ApiResponse.created(res, 'Clinic created successfully', result);
  } catch (err) { next(err); }
};

const getMyClinics = async (req, res, next) => {
  try {
    const result = await clinicService.getMyClinics(req.user.id);
    ApiResponse.success(res, 'Clinics fetched', result);
  } catch (err) { next(err); }
};

const updateClinic = async (req, res, next) => {
  try {
    validate(req);
    const result = await clinicService.updateClinic(req.user.id, req.params.id, req.body);
    ApiResponse.success(res, 'Clinic updated', result);
  } catch (err) { next(err); }
};

const getClinicById = async (req, res, next) => {
  try {
    const result = await clinicService.getClinicById(req.params.id);
    ApiResponse.success(res, 'Clinic fetched', result);
  } catch (err) { next(err); }
};

const addAvailability = async (req, res, next) => {
  try {
    validate(req);
    const result = await clinicService.addAvailability(req.user.id, req.params.id, req.body);
    ApiResponse.created(res, 'Availability added', result);
  } catch (err) { next(err); }
};

const getClinicAvailability = async (req, res, next) => {
  try {
    const result = await clinicService.getClinicAvailability(req.params.id);
    ApiResponse.success(res, 'Availability fetched', result);
  } catch (err) { next(err); }
};

const removeAvailability = async (req, res, next) => {
  try {
    await clinicService.removeAvailability(req.user.id, req.params.id, req.params.availabilityId);
    ApiResponse.success(res, 'Availability removed');
  } catch (err) { next(err); }
};

module.exports = {
  createClinic,
  getMyClinics,
  updateClinic,
  getClinicById,
  addAvailability,
  getClinicAvailability,
  removeAvailability,
};

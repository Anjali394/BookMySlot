const clinicRepo = require('../repositories/clinic.repository');
const providerRepo = require('../repositories/provider.repository');
const ApiError = require('../utils/ApiError');

const createClinic = async (userId, data) => {
  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider) throw ApiError.notFound('Provider profile not found. Register your business first.');
  return clinicRepo.createClinic(provider.id, data);
};

const getMyClinics = async (userId) => {
  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider) throw ApiError.notFound('Provider profile not found');
  return clinicRepo.findClinicsByProvider(provider.id);
};

const updateClinic = async (userId, clinicId, data) => {
  const clinic = await clinicRepo.findClinicById(clinicId);
  if (!clinic) throw ApiError.notFound('Clinic not found');

  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider || clinic.providerId !== provider.id) {
    throw ApiError.forbidden('You do not own this clinic');
  }
  return clinicRepo.updateClinic(clinicId, data);
};

const getClinicById = async (clinicId) => {
  const clinic = await clinicRepo.findClinicById(clinicId);
  if (!clinic) throw ApiError.notFound('Clinic not found');
  return clinic;
};

const addAvailability = async (userId, clinicId, data) => {
  const clinic = await clinicRepo.findClinicById(clinicId);
  if (!clinic) throw ApiError.notFound('Clinic not found');

  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider || clinic.providerId !== provider.id) {
    throw ApiError.forbidden('You do not own this clinic');
  }

  const existing = await clinicRepo.findAvailabilityByDay(clinicId, data.dayOfWeek);
  if (existing) throw ApiError.conflict(`Availability for ${data.dayOfWeek} already exists`);

  if (data.startTime >= data.endTime) {
    throw ApiError.badRequest('startTime must be before endTime');
  }

  return clinicRepo.createAvailability(clinicId, data);
};

const getClinicAvailability = async (clinicId) => {
  const clinic = await clinicRepo.findClinicById(clinicId);
  if (!clinic) throw ApiError.notFound('Clinic not found');
  return clinicRepo.findAvailabilityByClinic(clinicId);
};

const removeAvailability = async (userId, clinicId, availabilityId) => {
  const clinic = await clinicRepo.findClinicById(clinicId);
  if (!clinic) throw ApiError.notFound('Clinic not found');

  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider || clinic.providerId !== provider.id) {
    throw ApiError.forbidden('You do not own this clinic');
  }
  return clinicRepo.deleteAvailability(availabilityId);
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

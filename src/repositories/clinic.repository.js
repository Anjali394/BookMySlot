const prisma = require('../config/db');

const createClinic = (providerId, data) =>
  prisma.clinic.create({ data: { providerId, ...data } });

const findClinicById = (id) =>
  prisma.clinic.findUnique({
    where: { id },
    include: { provider: { include: { user: { select: { id: true, name: true } } } } },
  });

const findClinicsByProvider = (providerId) =>
  prisma.clinic.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
  });

const updateClinic = (id, data) =>
  prisma.clinic.update({ where: { id }, data });

const createAvailability = (clinicId, data) =>
  prisma.providerAvailability.create({ data: { clinicId, ...data } });

const findAvailabilityByClinic = (clinicId) =>
  prisma.providerAvailability.findMany({ where: { clinicId, isActive: true } });

const findAvailabilityByDay = (clinicId, dayOfWeek) =>
  prisma.providerAvailability.findUnique({ where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } } });

const updateAvailability = (id, data) =>
  prisma.providerAvailability.update({ where: { id }, data });

const deleteAvailability = (id) =>
  prisma.providerAvailability.delete({ where: { id } });

module.exports = {
  createClinic,
  findClinicById,
  findClinicsByProvider,
  updateClinic,
  createAvailability,
  findAvailabilityByClinic,
  findAvailabilityByDay,
  updateAvailability,
  deleteAvailability,
};

const prisma = require('../config/db');

const createSlot = (data) => prisma.slot.create({ data });

const createManySlots = (slots) => prisma.slot.createMany({ data: slots, skipDuplicates: true });

const findSlotById = (id) =>
  prisma.slot.findUnique({
    where: { id },
    include: { clinic: true },
  });

const findSlotsByClinicAndDate = (clinicId, date) =>
  prisma.slot.findMany({
    where: { clinicId, date: new Date(date) },
    orderBy: { startTime: 'asc' },
  });

const findSlotWithBookingCount = (id) =>
  prisma.slot.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bookings: {
            where: { status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED'] } },
          },
        },
      },
    },
  });

const updateSlot = (id, data) => prisma.slot.update({ where: { id }, data });

module.exports = {
  createSlot,
  createManySlots,
  findSlotById,
  findSlotsByClinicAndDate,
  findSlotWithBookingCount,
  updateSlot,
};

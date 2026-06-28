const clinicRepo = require('../repositories/clinic.repository');
const providerRepo = require('../repositories/provider.repository');
const slotRepo = require('../repositories/slot.repository');
const ApiError = require('../utils/ApiError');

// Parses "09:00" into { hours: 9, minutes: 0 }
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

// Adds minutes to a time object and returns "HH:MM"
const addMinutes = (timeStr, mins) => {
  const { hours, minutes } = parseTime(timeStr);
  const total = hours * 60 + minutes + mins;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getDayOfWeek = (dateStr) => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[new Date(dateStr).getDay()];
};

const generateSlots = async (userId, { clinicId, date }) => {
  const clinic = await clinicRepo.findClinicById(clinicId);
  if (!clinic) throw ApiError.notFound('Clinic not found');

  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider || clinic.providerId !== provider.id) {
    throw ApiError.forbidden('You do not own this clinic');
  }

  const dayOfWeek = getDayOfWeek(date);
  const availability = await clinicRepo.findAvailabilityByDay(clinicId, dayOfWeek);
  if (!availability) {
    throw ApiError.badRequest(`No availability configured for ${dayOfWeek}`);
  }

  const slots = [];
  let current = availability.startTime;

  while (true) {
    const next = addMinutes(current, availability.slotDuration);
    if (next > availability.endTime) break;
    slots.push({
      clinicId,
      date: new Date(date),
      startTime: current,
      endTime: next,
      totalCapacity: availability.capacity,
    });
    current = next;
  }

  if (slots.length === 0) throw ApiError.badRequest('No slots could be generated for this configuration');

  await slotRepo.createManySlots(slots);
  return slotRepo.findSlotsByClinicAndDate(clinicId, date);
};

const listSlots = async ({ clinicId, date }) => {
  const clinic = await clinicRepo.findClinicById(clinicId);
  if (!clinic) throw ApiError.notFound('Clinic not found');

  const slots = await slotRepo.findSlotsByClinicAndDate(clinicId, date);

  return Promise.all(
    slots.map(async (slot) => {
      const full = await slotRepo.findSlotWithBookingCount(slot.id);
      const activeBookings = full._count.bookings;
      return {
        ...slot,
        activeBookings,
        availableCapacity: slot.totalCapacity - activeBookings,
      };
    })
  );
};

const blockSlot = async (userId, slotId, isBlocked) => {
  const slot = await slotRepo.findSlotById(slotId);
  if (!slot) throw ApiError.notFound('Slot not found');

  const provider = await providerRepo.findProviderByUserId(userId);
  if (!provider || slot.clinic.providerId !== provider.id) {
    throw ApiError.forbidden('You do not own this slot');
  }

  return slotRepo.updateSlot(slotId, { isBlocked });
};

module.exports = { generateSlots, listSlots, blockSlot };

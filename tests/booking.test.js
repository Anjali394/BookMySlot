const request = require('supertest');
const app = require('../src/app');

describe('Booking API', () => {
  let customerToken;
  let providerToken;
  let slotId;
  let bookingId;
  let clinicId;

  const providerEmail = `bookprovider_${Date.now()}@test.com`;
  const customerEmail = `bookcustomer_${Date.now()}@test.com`;

  // Get next upcoming date for a specific day of week (0=Sun, 6=Sat)
  const getNextDate = (dayIndex) => {
    const today = new Date();
    const diff = (dayIndex - today.getDay() + 7) % 7 || 7;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    return next.toISOString().split('T')[0];
  };

  beforeAll(async () => {
    // Register provider and set up clinic + slots
    const providerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Booking Provider', email: providerEmail, password: 'Test1234', role: 'PROVIDER' });
    providerToken = providerRes.body.data.accessToken;

    // Register business
    await request(app)
      .post('/api/v1/providers/register-business')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ businessName: 'Booking Test Clinic', category: 'General', phone: '1234567890', address: 'Test City' });

    // Create clinic
    const clinicRes = await request(app)
      .post('/api/v1/clinics')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ name: 'Booking Clinic', address: 'Test Address' });
    clinicId = clinicRes.body.data.id;

    // Add Monday availability
    await request(app)
      .post(`/api/v1/clinics/${clinicId}/availability`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', slotDuration: 30, capacity: 1 });

    // Generate slots for next Monday
    const nextMonday = getNextDate(1);
    const slotsRes = await request(app)
      .post('/api/v1/slots/generate')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ clinicId, date: nextMonday });
    slotId = slotsRes.body.data[0].id;

    // Register customer
    const customerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Booking Customer', email: customerEmail, password: 'Test1234', role: 'CUSTOMER' });
    customerToken = customerRes.body.data.accessToken;
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a booking successfully', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ slotId, notes: 'Test appointment' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING_CONFIRMATION');
      bookingId = res.body.data.id;
    });

    it('should reject booking when slot is full (capacity=1)', async () => {
      // Register another customer
      const anotherRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Another Customer', email: `another_${Date.now()}@test.com`, password: 'Test1234', role: 'CUSTOMER' });
      const anotherToken = anotherRes.body.data.accessToken;

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({ slotId, notes: 'Second booking' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/fully booked/i);
    });

    it('should reject provider creating a booking', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ slotId, notes: 'Provider booking' });

      expect(res.statusCode).toBe(403);
    });

    it('should reject unauthenticated booking', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .send({ slotId, notes: 'No auth' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/bookings/my', () => {
    it('should return customer booking history', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
      expect(res.body.data.bookings.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/v1/bookings/:id/status', () => {
    it('should allow provider to confirm booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'CONFIRMED', reason: 'Confirmed by test' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('should reject confirming an already-confirmed booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject customer updating booking status', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/v1/bookings/:id/cancel', () => {
    it('should allow customer to cancel a confirmed booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Changed my mind' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should reject cancelling an already-cancelled booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Again' });

      expect(res.statusCode).toBe(400);
    });
  });
});

const request = require('supertest');
const app = require('../src/app');

describe('Provider API', () => {
  let providerToken;
  let customerToken;
  const providerEmail = `provider_${Date.now()}@test.com`;
  const customerEmail = `customer_${Date.now()}@test.com`;

  beforeAll(async () => {
    // Register provider
    const providerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Provider', email: providerEmail, password: 'Test1234', role: 'PROVIDER' });
    providerToken = providerRes.body.data.accessToken;

    // Register customer
    const customerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Customer', email: customerEmail, password: 'Test1234', role: 'CUSTOMER' });
    customerToken = customerRes.body.data.accessToken;
  });

  describe('POST /api/v1/providers/register-business', () => {
    it('should register business for a provider', async () => {
      const res = await request(app)
        .post('/api/v1/providers/register-business')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          bio: 'Test bio',
          businessName: 'Test Business',
          category: 'Dentistry',
          phone: '9876543210',
          address: 'Test Address',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.name).toBe('Test Business');
    });

    it('should reject duplicate business registration', async () => {
      const res = await request(app)
        .post('/api/v1/providers/register-business')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ businessName: 'Another Business', category: 'Dentistry' });

      expect(res.statusCode).toBe(409);
    });

    it('should reject customer registering a business', async () => {
      const res = await request(app)
        .post('/api/v1/providers/register-business')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ businessName: 'Test Business', category: 'Dentistry' });

      expect(res.statusCode).toBe(403);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/providers/register-business')
        .send({ businessName: 'Test Business', category: 'Dentistry' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/providers', () => {
    it('should list providers publicly', async () => {
      const res = await request(app).get('/api/v1/providers');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('providers');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.providers)).toBe(true);
    });

    it('should filter providers by category', async () => {
      const res = await request(app).get('/api/v1/providers?category=Dentistry');

      expect(res.statusCode).toBe(200);
      res.body.data.providers.forEach((p) => {
        expect(p.business.category.toLowerCase()).toContain('dentistry');
      });
    });

    it('should return empty list for unknown category', async () => {
      const res = await request(app).get('/api/v1/providers?category=UnknownXYZ999');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.providers).toHaveLength(0);
    });
  });

  describe('GET /api/v1/providers/me', () => {
    it('should return provider profile', async () => {
      const res = await request(app)
        .get('/api/v1/providers/me')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('business');
    });

    it('should reject customer accessing provider profile', async () => {
      const res = await request(app)
        .get('/api/v1/providers/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});

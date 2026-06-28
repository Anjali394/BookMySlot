const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  const baseEmail = `testuser_${Date.now()}@test.com`;

  describe('POST /api/v1/auth/register', () => {
    it('should register a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: baseEmail, password: 'Test1234', role: 'CUSTOMER' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: baseEmail, password: 'Test1234', role: 'CUSTOMER' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: `short_${Date.now()}@test.com`, password: 'Test1' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject password without uppercase letter', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: `noup_${Date.now()}@test.com`, password: 'test1234' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: `role_${Date.now()}@test.com`, password: 'Test1234', role: 'SUPERUSER' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject missing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', password: 'Test1234' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: baseEmail, password: 'Test1234' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: baseEmail, password: 'WrongPass1' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ghost@nobody.com', password: 'Test1234' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: baseEmail, password: 'Test1234' });

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(baseEmail);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.statusCode).toBe(401);
    });
  });
});

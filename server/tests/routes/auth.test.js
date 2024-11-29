const request = require('supertest');
const app = require('../../app');
const {
  setupTestDB,
  teardownTestDB,
  clearDatabase,
  createTestUser
} = require('../helpers');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', validUser.email);
    });

    it('should not register a user with existing email', async () => {
      await createTestUser(validUser);

      const res = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Benutzer existiert bereits');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/login', () => {
    const userCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(async () => {
      await createTestUser(userCredentials);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send(userCredentials);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userCredentials.email);
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Ungültige Anmeldedaten');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userCredentials.password
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Ungültige Anmeldedaten');
    });
  });

  describe('GET /auth/me', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await createTestUser();
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      token = loginRes.body.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/auth/me');

      expect(res.status).toBe(401);
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
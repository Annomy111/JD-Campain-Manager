const request = require('supertest');
const app = require('../../app');
const Task = require('../../models/Task');
const {
  setupTestDB,
  teardownTestDB,
  clearDatabase,
  createTestUser,
  generateTestToken
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

describe('Task Routes', () => {
  let token;
  let user;
  
  beforeEach(async () => {
    user = await createTestUser();
    token = generateTestToken(user._id);
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Create some test tasks
      await Task.insertMany([
        {
          title: 'Test Task 1',
          description: 'Description 1',
          userId: user._id,
          status: 'pending'
        },
        {
          title: 'Test Task 2',
          description: 'Description 2',
          userId: user._id,
          status: 'in-progress'
        }
      ]);
    });

    it('should get all tasks for authenticated user', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('status');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(401);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/tasks?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBeTruthy();
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('totalPages');
    });
  });

  describe('POST /tasks', () => {
    const validTask = {
      title: 'New Task',
      description: 'Task Description',
      dueDate: new Date().toISOString(),
      priority: 'high'
    };

    it('should create a new task', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validTask);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', validTask.title);
      expect(res.body).toHaveProperty('userId', user._id.toString());
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should set default status to pending', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validTask);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'pending');
    });
  });

  describe('PATCH /tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Description',
        userId: user._id,
        status: 'pending'
      });
      taskId = task._id;
    });

    it('should update task successfully', async () => {
      const update = {
        title: 'Updated Title',
        status: 'in-progress'
      };

      const res = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', update.title);
      expect(res.body).toHaveProperty('status', update.status);
    });

    it('should not update task of another user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherTask = await Task.create({
        title: 'Other Task',
        description: 'Description',
        userId: otherUser._id,
        status: 'pending'
      });

      const res = await request(app)
        .patch(`/tasks/${otherTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('should validate update fields', async () => {
      const res = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid-status' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Description',
        userId: user._id,
        status: 'pending'
      });
      taskId = task._id;
    });

    it('should delete task successfully', async () => {
      const res = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      
      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should not delete task of another user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherTask = await Task.create({
        title: 'Other Task',
        description: 'Description',
        userId: otherUser._id,
        status: 'pending'
      });

      const res = await request(app)
        .delete(`/tasks/${otherTask._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      
      const taskStillExists = await Task.findById(otherTask._id);
      expect(taskStillExists).toBeTruthy();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeTaskId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/tasks/${fakeTaskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
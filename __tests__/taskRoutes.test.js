const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store/memoryStore');

describe('Task Routes', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.status).toBe(taskData.status);
      expect(response.body.priority).toBe(taskData.priority);
    });

    test('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.error).toBe('Task title is required');
    });

    test('should use default values if not provided', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' })
        .expect(201);

      expect(response.body.status).toBe('pending');
      expect(response.body.priority).toBe('medium');
    });
  });

  describe('GET /api/tasks', () => {
    test('should get all tasks', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 1' });
      
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 2' });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should get a task by id', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Test Task');
    });

    test('should return 404 if task not found', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update a task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Title' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title', status: 'completed' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.status).toBe('completed');
    });

    test('should return 404 if task not found', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete a task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);
    });

    test('should return 404 if task not found', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });
});

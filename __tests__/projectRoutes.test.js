const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store/memoryStore');

describe('Project Routes', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('POST /api/projects', () => {
    test('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.description).toBe(projectData.description);
      expect(response.body.status).toBe(projectData.status);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    test('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ description: 'No name' })
        .expect(400);

      expect(response.body.error).toBe('Project name is required');
    });

    test('should use default status if not provided', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' })
        .expect(201);

      expect(response.body.status).toBe('active');
    });
  });

  describe('GET /api/projects', () => {
    test('should get all projects', async () => {
      // Create some test projects
      await request(app)
        .post('/api/projects')
        .send({ name: 'Project 1' });
      
      await request(app)
        .post('/api/projects')
        .send({ name: 'Project 2' });

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    test('should return empty array if no projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/projects/:id', () => {
    test('should get a project by id', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body.id).toBe(projectId);
      expect(response.body.name).toBe('Test Project');
    });

    test('should return 404 if project not found', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('GET /api/projects/:id/details', () => {
    test('should get project with tasks and integrations', async () => {
      // Create project
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });
      const projectId = projectResponse.body.id;

      // Create task
      const taskResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });
      const taskId = taskResponse.body.id;

      // Create integration
      const integrationResponse = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });
      const integrationId = integrationResponse.body.id;

      // Add task to project
      await request(app)
        .post(`/api/projects/${projectId}/tasks/${taskId}`)
        .expect(200);

      // Add integration to project
      await request(app)
        .post(`/api/projects/${projectId}/integrations/${integrationId}`)
        .expect(200);

      // Get project details
      const response = await request(app)
        .get(`/api/projects/${projectId}/details`)
        .expect(200);

      expect(response.body.id).toBe(projectId);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].id).toBe(taskId);
      expect(response.body.integrations).toHaveLength(1);
      expect(response.body.integrations[0].id).toBe(integrationId);
    });
  });

  describe('PUT /api/projects/:id', () => {
    test('should update a project', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Original Name' });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send({ name: 'Updated Name', description: 'New Description' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('New Description');
      expect(response.body.id).toBe(projectId);
    });

    test('should return 404 if project not found', async () => {
      const response = await request(app)
        .put('/api/projects/non-existent-id')
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    test('should delete a project', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body.message).toBe('Project deleted successfully');
      expect(response.body.project.id).toBe(projectId);

      // Verify project is deleted
      await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(404);
    });

    test('should return 404 if project not found', async () => {
      const response = await request(app)
        .delete('/api/projects/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('Project-Task Mapping', () => {
    test('should add task to project', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });
      const projectId = projectResponse.body.id;

      const taskResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });
      const taskId = taskResponse.body.id;

      const response = await request(app)
        .post(`/api/projects/${projectId}/tasks/${taskId}`)
        .expect(200);

      expect(response.body.message).toBe('Task added to project successfully');
    });

    test('should get project tasks', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });
      const projectId = projectResponse.body.id;

      const task1Response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 1' });
      const task2Response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 2' });

      await request(app)
        .post(`/api/projects/${projectId}/tasks/${task1Response.body.id}`);
      await request(app)
        .post(`/api/projects/${projectId}/tasks/${task2Response.body.id}`);

      const response = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    test('should remove task from project', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });
      const projectId = projectResponse.body.id;

      const taskResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });
      const taskId = taskResponse.body.id;

      await request(app)
        .post(`/api/projects/${projectId}/tasks/${taskId}`);

      const response = await request(app)
        .delete(`/api/projects/${projectId}/tasks/${taskId}`)
        .expect(200);

      expect(response.body.message).toBe('Task removed from project successfully');

      // Verify task is removed
      const tasksResponse = await request(app)
        .get(`/api/projects/${projectId}/tasks`);

      expect(tasksResponse.body).toHaveLength(0);
    });

    test('should return 404 when adding non-existent task', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });

      const response = await request(app)
        .post(`/api/projects/${projectResponse.body.id}/tasks/non-existent`)
        .expect(404);

      expect(response.body.error).toBe('Project or task not found');
    });
  });

  describe('Project-Integration Mapping', () => {
    test('should add integration to project', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });
      const projectId = projectResponse.body.id;

      const integrationResponse = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });
      const integrationId = integrationResponse.body.id;

      const response = await request(app)
        .post(`/api/projects/${projectId}/integrations/${integrationId}`)
        .expect(200);

      expect(response.body.message).toBe('Integration added to project successfully');
    });

    test('should get project integrations', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });
      const projectId = projectResponse.body.id;

      const int1Response = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });
      const int2Response = await request(app)
        .post('/api/integrations')
        .send({ name: 'Slack', type: 'messaging' });

      await request(app)
        .post(`/api/projects/${projectId}/integrations/${int1Response.body.id}`);
      await request(app)
        .post(`/api/projects/${projectId}/integrations/${int2Response.body.id}`);

      const response = await request(app)
        .get(`/api/projects/${projectId}/integrations`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    test('should remove integration from project', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });
      const projectId = projectResponse.body.id;

      const integrationResponse = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });
      const integrationId = integrationResponse.body.id;

      await request(app)
        .post(`/api/projects/${projectId}/integrations/${integrationId}`);

      const response = await request(app)
        .delete(`/api/projects/${projectId}/integrations/${integrationId}`)
        .expect(200);

      expect(response.body.message).toBe('Integration removed from project successfully');

      // Verify integration is removed
      const integrationsResponse = await request(app)
        .get(`/api/projects/${projectId}/integrations`);

      expect(integrationsResponse.body).toHaveLength(0);
    });

    test('should return 404 when adding non-existent integration', async () => {
      const projectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' });

      const response = await request(app)
        .post(`/api/projects/${projectResponse.body.id}/integrations/non-existent`)
        .expect(404);

      expect(response.body.error).toBe('Project or integration not found');
    });
  });
});

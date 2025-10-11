const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store/memoryStore');

describe('Integration Routes', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('POST /api/integrations', () => {
    test('should create a new integration', async () => {
      const integrationData = {
        name: 'GitHub',
        type: 'git',
        config: { apiKey: 'test-key' }
      };

      const response = await request(app)
        .post('/api/integrations')
        .send(integrationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(integrationData.name);
      expect(response.body.type).toBe(integrationData.type);
      expect(response.body.config).toEqual(integrationData.config);
      expect(response.body.status).toBe('active');
    });

    test('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/integrations')
        .send({ type: 'git' })
        .expect(400);

      expect(response.body.error).toBe('Integration name is required');
    });

    test('should return 400 if type is missing', async () => {
      const response = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub' })
        .expect(400);

      expect(response.body.error).toBe('Integration type is required');
    });

    test('should use empty config if not provided', async () => {
      const response = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' })
        .expect(201);

      expect(response.body.config).toEqual({});
    });
  });

  describe('GET /api/integrations', () => {
    test('should get all integrations', async () => {
      await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });
      
      await request(app)
        .post('/api/integrations')
        .send({ name: 'Slack', type: 'messaging' });

      const response = await request(app)
        .get('/api/integrations')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/integrations/:id', () => {
    test('should get an integration by id', async () => {
      const createResponse = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });

      const integrationId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/integrations/${integrationId}`)
        .expect(200);

      expect(response.body.id).toBe(integrationId);
      expect(response.body.name).toBe('GitHub');
    });

    test('should return 404 if integration not found', async () => {
      const response = await request(app)
        .get('/api/integrations/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Integration not found');
    });
  });

  describe('PUT /api/integrations/:id', () => {
    test('should update an integration', async () => {
      const createResponse = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });

      const integrationId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/integrations/${integrationId}`)
        .send({ name: 'GitHub Updated', config: { apiKey: 'new-key' } })
        .expect(200);

      expect(response.body.name).toBe('GitHub Updated');
      expect(response.body.config).toEqual({ apiKey: 'new-key' });
    });

    test('should return 404 if integration not found', async () => {
      const response = await request(app)
        .put('/api/integrations/non-existent-id')
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Integration not found');
    });
  });

  describe('DELETE /api/integrations/:id', () => {
    test('should delete an integration', async () => {
      const createResponse = await request(app)
        .post('/api/integrations')
        .send({ name: 'GitHub', type: 'git' });

      const integrationId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/integrations/${integrationId}`)
        .expect(200);

      expect(response.body.message).toBe('Integration deleted successfully');

      await request(app)
        .get(`/api/integrations/${integrationId}`)
        .expect(404);
    });

    test('should return 404 if integration not found', async () => {
      const response = await request(app)
        .delete('/api/integrations/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Integration not found');
    });
  });
});

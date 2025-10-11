const store = require('../src/store/memoryStore');

describe('Memory Store', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('Project Operations', () => {
    test('should create a project', () => {
      const project = {
        id: '1',
        name: 'Test Project',
        description: 'Test Description'
      };

      const created = store.createProject(project);
      expect(created).toEqual(project);
      expect(store.getProject('1')).toEqual(project);
    });

    test('should get all projects', () => {
      store.createProject({ id: '1', name: 'Project 1' });
      store.createProject({ id: '2', name: 'Project 2' });

      const projects = store.getAllProjects();
      expect(projects).toHaveLength(2);
    });

    test('should update a project', () => {
      store.createProject({ id: '1', name: 'Original' });
      const updated = store.updateProject('1', { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.id).toBe('1');
    });

    test('should delete a project', () => {
      store.createProject({ id: '1', name: 'Test' });
      const deleted = store.deleteProject('1');

      expect(deleted.id).toBe('1');
      expect(store.getProject('1')).toBeUndefined();
    });

    test('should return null when updating non-existent project', () => {
      const result = store.updateProject('non-existent', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('Task Operations', () => {
    test('should create a task', () => {
      const task = {
        id: '1',
        title: 'Test Task',
        status: 'pending'
      };

      const created = store.createTask(task);
      expect(created).toEqual(task);
      expect(store.getTask('1')).toEqual(task);
    });

    test('should get all tasks', () => {
      store.createTask({ id: '1', title: 'Task 1' });
      store.createTask({ id: '2', title: 'Task 2' });

      const tasks = store.getAllTasks();
      expect(tasks).toHaveLength(2);
    });

    test('should update a task', () => {
      store.createTask({ id: '1', title: 'Original' });
      const updated = store.updateTask('1', { title: 'Updated' });

      expect(updated.title).toBe('Updated');
    });

    test('should delete a task', () => {
      store.createTask({ id: '1', title: 'Test' });
      const deleted = store.deleteTask('1');

      expect(deleted.id).toBe('1');
      expect(store.getTask('1')).toBeUndefined();
    });
  });

  describe('Integration Operations', () => {
    test('should create an integration', () => {
      const integration = {
        id: '1',
        name: 'GitHub',
        type: 'git'
      };

      const created = store.createIntegration(integration);
      expect(created).toEqual(integration);
      expect(store.getIntegration('1')).toEqual(integration);
    });

    test('should get all integrations', () => {
      store.createIntegration({ id: '1', name: 'GitHub' });
      store.createIntegration({ id: '2', name: 'Slack' });

      const integrations = store.getAllIntegrations();
      expect(integrations).toHaveLength(2);
    });

    test('should update an integration', () => {
      store.createIntegration({ id: '1', name: 'Original' });
      const updated = store.updateIntegration('1', { name: 'Updated' });

      expect(updated.name).toBe('Updated');
    });

    test('should delete an integration', () => {
      store.createIntegration({ id: '1', name: 'Test' });
      const deleted = store.deleteIntegration('1');

      expect(deleted.id).toBe('1');
      expect(store.getIntegration('1')).toBeUndefined();
    });
  });

  describe('Project-Task Mappings', () => {
    beforeEach(() => {
      store.createProject({ id: 'p1', name: 'Project 1' });
      store.createTask({ id: 't1', title: 'Task 1' });
      store.createTask({ id: 't2', title: 'Task 2' });
    });

    test('should add task to project', () => {
      const result = store.addTaskToProject('p1', 't1');
      expect(result).toBe(true);

      const tasks = store.getProjectTasks('p1');
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe('t1');
    });

    test('should remove task from project', () => {
      store.addTaskToProject('p1', 't1');
      const result = store.removeTaskFromProject('p1', 't1');

      expect(result).toBe(true);
      expect(store.getProjectTasks('p1')).toHaveLength(0);
    });

    test('should return false when adding task to non-existent project', () => {
      const result = store.addTaskToProject('non-existent', 't1');
      expect(result).toBe(false);
    });

    test('should get multiple tasks for a project', () => {
      store.addTaskToProject('p1', 't1');
      store.addTaskToProject('p1', 't2');

      const tasks = store.getProjectTasks('p1');
      expect(tasks).toHaveLength(2);
    });

    test('should remove task from all projects when task is deleted', () => {
      store.addTaskToProject('p1', 't1');
      store.deleteTask('t1');

      const tasks = store.getProjectTasks('p1');
      expect(tasks).toHaveLength(0);
    });
  });

  describe('Project-Integration Mappings', () => {
    beforeEach(() => {
      store.createProject({ id: 'p1', name: 'Project 1' });
      store.createIntegration({ id: 'i1', name: 'Integration 1' });
      store.createIntegration({ id: 'i2', name: 'Integration 2' });
    });

    test('should add integration to project', () => {
      const result = store.addIntegrationToProject('p1', 'i1');
      expect(result).toBe(true);

      const integrations = store.getProjectIntegrations('p1');
      expect(integrations).toHaveLength(1);
      expect(integrations[0].id).toBe('i1');
    });

    test('should remove integration from project', () => {
      store.addIntegrationToProject('p1', 'i1');
      const result = store.removeIntegrationFromProject('p1', 'i1');

      expect(result).toBe(true);
      expect(store.getProjectIntegrations('p1')).toHaveLength(0);
    });

    test('should return false when adding integration to non-existent project', () => {
      const result = store.addIntegrationToProject('non-existent', 'i1');
      expect(result).toBe(false);
    });

    test('should get multiple integrations for a project', () => {
      store.addIntegrationToProject('p1', 'i1');
      store.addIntegrationToProject('p1', 'i2');

      const integrations = store.getProjectIntegrations('p1');
      expect(integrations).toHaveLength(2);
    });

    test('should remove integration from all projects when integration is deleted', () => {
      store.addIntegrationToProject('p1', 'i1');
      store.deleteIntegration('i1');

      const integrations = store.getProjectIntegrations('p1');
      expect(integrations).toHaveLength(0);
    });
  });

  describe('Project Deletion Cleanup', () => {
    test('should clean up mappings when project is deleted', () => {
      store.createProject({ id: 'p1', name: 'Project 1' });
      store.createTask({ id: 't1', title: 'Task 1' });
      store.createIntegration({ id: 'i1', name: 'Integration 1' });

      store.addTaskToProject('p1', 't1');
      store.addIntegrationToProject('p1', 'i1');

      store.deleteProject('p1');

      // Task and integration should still exist
      expect(store.getTask('t1')).toBeDefined();
      expect(store.getIntegration('i1')).toBeDefined();

      // But project should be gone
      expect(store.getProject('p1')).toBeUndefined();
    });
  });
});

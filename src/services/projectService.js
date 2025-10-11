const store = require('../store/memoryStore');
const { generateUUID } = require('../utils/uuid');

/**
 * Project service - handles business logic for project management
 */
class ProjectService {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Object} Created project
   */
  createProject(projectData) {
    const project = {
      id: generateUUID(),
      name: projectData.name,
      description: projectData.description || '',
      status: projectData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return store.createProject(project);
  }

  /**
   * Get a project by ID
   * @param {string} id - Project ID
   * @returns {Object|null} Project or null if not found
   */
  getProject(id) {
    return store.getProject(id);
  }

  /**
   * Get all projects
   * @returns {Array} Array of all projects
   */
  getAllProjects() {
    return store.getAllProjects();
  }

  /**
   * Update a project
   * @param {string} id - Project ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated project or null if not found
   */
  updateProject(id, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return store.updateProject(id, updatedData);
  }

  /**
   * Delete a project
   * @param {string} id - Project ID
   * @returns {Object|null} Deleted project or null if not found
   */
  deleteProject(id) {
    return store.deleteProject(id);
  }

  /**
   * Add a task to a project
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @returns {boolean} True if successful
   */
  addTaskToProject(projectId, taskId) {
    return store.addTaskToProject(projectId, taskId);
  }

  /**
   * Remove a task from a project
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @returns {boolean} True if successful
   */
  removeTaskFromProject(projectId, taskId) {
    return store.removeTaskFromProject(projectId, taskId);
  }

  /**
   * Get all tasks for a project
   * @param {string} projectId - Project ID
   * @returns {Array} Array of tasks
   */
  getProjectTasks(projectId) {
    return store.getProjectTasks(projectId);
  }

  /**
   * Add an integration to a project
   * @param {string} projectId - Project ID
   * @param {string} integrationId - Integration ID
   * @returns {boolean} True if successful
   */
  addIntegrationToProject(projectId, integrationId) {
    return store.addIntegrationToProject(projectId, integrationId);
  }

  /**
   * Remove an integration from a project
   * @param {string} projectId - Project ID
   * @param {string} integrationId - Integration ID
   * @returns {boolean} True if successful
   */
  removeIntegrationFromProject(projectId, integrationId) {
    return store.removeIntegrationFromProject(projectId, integrationId);
  }

  /**
   * Get all integrations for a project
   * @param {string} projectId - Project ID
   * @returns {Array} Array of integrations
   */
  getProjectIntegrations(projectId) {
    return store.getProjectIntegrations(projectId);
  }

  /**
   * Get project with all related data (tasks and integrations)
   * @param {string} id - Project ID
   * @returns {Object|null} Project with tasks and integrations
   */
  getProjectWithDetails(id) {
    const project = store.getProject(id);
    if (!project) return null;

    return {
      ...project,
      tasks: this.getProjectTasks(id),
      integrations: this.getProjectIntegrations(id)
    };
  }
}

module.exports = new ProjectService();

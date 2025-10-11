/**
 * In-memory data store for projects, tasks, and integrations
 */
class MemoryStore {
  constructor() {
    this.projects = new Map();
    this.tasks = new Map();
    this.integrations = new Map();
    this.projectTaskMappings = new Map(); // projectId -> Set of taskIds
    this.projectIntegrationMappings = new Map(); // projectId -> Set of integrationIds
  }

  // Project operations
  createProject(project) {
    this.projects.set(project.id, project);
    this.projectTaskMappings.set(project.id, new Set());
    this.projectIntegrationMappings.set(project.id, new Set());
    return project;
  }

  getProject(id) {
    return this.projects.get(id);
  }

  getAllProjects() {
    return Array.from(this.projects.values());
  }

  updateProject(id, updates) {
    const project = this.projects.get(id);
    if (!project) return null;
    
    const updatedProject = { ...project, ...updates, id };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  deleteProject(id) {
    const project = this.projects.get(id);
    if (!project) return null;
    
    this.projects.delete(id);
    this.projectTaskMappings.delete(id);
    this.projectIntegrationMappings.delete(id);
    return project;
  }

  // Task operations
  createTask(task) {
    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  updateTask(id, updates) {
    const task = this.tasks.get(id);
    if (!task) return null;
    
    const updatedTask = { ...task, ...updates, id };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  deleteTask(id) {
    const task = this.tasks.get(id);
    if (!task) return null;
    
    this.tasks.delete(id);
    // Remove from all project mappings
    for (const [projectId, taskIds] of this.projectTaskMappings) {
      taskIds.delete(id);
    }
    return task;
  }

  // Integration operations
  createIntegration(integration) {
    this.integrations.set(integration.id, integration);
    return integration;
  }

  getIntegration(id) {
    return this.integrations.get(id);
  }

  getAllIntegrations() {
    return Array.from(this.integrations.values());
  }

  updateIntegration(id, updates) {
    const integration = this.integrations.get(id);
    if (!integration) return null;
    
    const updatedIntegration = { ...integration, ...updates, id };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  deleteIntegration(id) {
    const integration = this.integrations.get(id);
    if (!integration) return null;
    
    this.integrations.delete(id);
    // Remove from all project mappings
    for (const [projectId, integrationIds] of this.projectIntegrationMappings) {
      integrationIds.delete(id);
    }
    return integration;
  }

  // Project-Task mapping operations
  addTaskToProject(projectId, taskId) {
    if (!this.projects.has(projectId) || !this.tasks.has(taskId)) {
      return false;
    }
    
    this.projectTaskMappings.get(projectId).add(taskId);
    return true;
  }

  removeTaskFromProject(projectId, taskId) {
    if (!this.projectTaskMappings.has(projectId)) {
      return false;
    }
    
    return this.projectTaskMappings.get(projectId).delete(taskId);
  }

  getProjectTasks(projectId) {
    const taskIds = this.projectTaskMappings.get(projectId);
    if (!taskIds) return [];
    
    return Array.from(taskIds)
      .map(id => this.tasks.get(id))
      .filter(task => task !== undefined);
  }

  // Project-Integration mapping operations
  addIntegrationToProject(projectId, integrationId) {
    if (!this.projects.has(projectId) || !this.integrations.has(integrationId)) {
      return false;
    }
    
    this.projectIntegrationMappings.get(projectId).add(integrationId);
    return true;
  }

  removeIntegrationFromProject(projectId, integrationId) {
    if (!this.projectIntegrationMappings.has(projectId)) {
      return false;
    }
    
    return this.projectIntegrationMappings.get(projectId).delete(integrationId);
  }

  getProjectIntegrations(projectId) {
    const integrationIds = this.projectIntegrationMappings.get(projectId);
    if (!integrationIds) return [];
    
    return Array.from(integrationIds)
      .map(id => this.integrations.get(id))
      .filter(integration => integration !== undefined);
  }

  // Clear all data (useful for testing)
  clear() {
    this.projects.clear();
    this.tasks.clear();
    this.integrations.clear();
    this.projectTaskMappings.clear();
    this.projectIntegrationMappings.clear();
  }
}

// Singleton instance
const store = new MemoryStore();

module.exports = store;

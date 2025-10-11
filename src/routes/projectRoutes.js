const express = require('express');
const router = express.Router();
const projectService = require('../services/projectService');

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Public
 */
router.post('/', (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = projectService.createProject({ name, description, status });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const projects = projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get a project by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const project = projectService.getProject(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects/:id/details
 * @desc    Get a project with all tasks and integrations
 * @access  Public
 */
router.get('/:id/details', (req, res) => {
  try {
    const project = projectService.getProjectWithDetails(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Public
 */
router.put('/:id', (req, res) => {
  try {
    const { name, description, status } = req.body;
    const updates = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const project = projectService.updateProject(req.params.id, updates);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Public
 */
router.delete('/:id', (req, res) => {
  try {
    const project = projectService.deleteProject(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/projects/:id/tasks/:taskId
 * @desc    Add a task to a project
 * @access  Public
 */
router.post('/:id/tasks/:taskId', (req, res) => {
  try {
    const success = projectService.addTaskToProject(req.params.id, req.params.taskId);
    
    if (!success) {
      return res.status(404).json({ error: 'Project or task not found' });
    }

    res.json({ message: 'Task added to project successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/projects/:id/tasks/:taskId
 * @desc    Remove a task from a project
 * @access  Public
 */
router.delete('/:id/tasks/:taskId', (req, res) => {
  try {
    const success = projectService.removeTaskFromProject(req.params.id, req.params.taskId);
    
    if (!success) {
      return res.status(404).json({ error: 'Project or task not found' });
    }

    res.json({ message: 'Task removed from project successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects/:id/tasks
 * @desc    Get all tasks for a project
 * @access  Public
 */
router.get('/:id/tasks', (req, res) => {
  try {
    const tasks = projectService.getProjectTasks(req.params.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/projects/:id/integrations/:integrationId
 * @desc    Add an integration to a project
 * @access  Public
 */
router.post('/:id/integrations/:integrationId', (req, res) => {
  try {
    const success = projectService.addIntegrationToProject(req.params.id, req.params.integrationId);
    
    if (!success) {
      return res.status(404).json({ error: 'Project or integration not found' });
    }

    res.json({ message: 'Integration added to project successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/projects/:id/integrations/:integrationId
 * @desc    Remove an integration from a project
 * @access  Public
 */
router.delete('/:id/integrations/:integrationId', (req, res) => {
  try {
    const success = projectService.removeIntegrationFromProject(req.params.id, req.params.integrationId);
    
    if (!success) {
      return res.status(404).json({ error: 'Project or integration not found' });
    }

    res.json({ message: 'Integration removed from project successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/projects/:id/integrations
 * @desc    Get all integrations for a project
 * @access  Public
 */
router.get('/:id/integrations', (req, res) => {
  try {
    const integrations = projectService.getProjectIntegrations(req.params.id);
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

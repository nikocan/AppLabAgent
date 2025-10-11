const express = require('express');
const router = express.Router();
const store = require('../store/memoryStore');
const { generateUUID } = require('../utils/uuid');

/**
 * @route   POST /api/integrations
 * @desc    Create a new integration
 * @access  Public
 */
router.post('/', (req, res) => {
  try {
    const { name, type, config } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Integration name is required' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Integration type is required' });
    }

    const integration = {
      id: generateUUID(),
      name,
      type,
      config: config || {},
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdIntegration = store.createIntegration(integration);
    res.status(201).json(createdIntegration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/integrations
 * @desc    Get all integrations
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const integrations = store.getAllIntegrations();
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/integrations/:id
 * @desc    Get an integration by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const integration = store.getIntegration(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/integrations/:id
 * @desc    Update an integration
 * @access  Public
 */
router.put('/:id', (req, res) => {
  try {
    const { name, type, config, status } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (config !== undefined) updates.config = config;
    if (status !== undefined) updates.status = status;

    const integration = store.updateIntegration(req.params.id, updates);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/integrations/:id
 * @desc    Delete an integration
 * @access  Public
 */
router.delete('/:id', (req, res) => {
  try {
    const integration = store.deleteIntegration(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ message: 'Integration deleted successfully', integration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

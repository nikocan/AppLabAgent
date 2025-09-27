// App Lab Agent - AI Controller
// AI ve otomataion servisleri için controller

const aiService = require('../services/aiService');
const analyticsService = require('../services/analyticsService');
const loggingService = require('../services/loggingService');
const notificationService = require('../services/notificationService');

class AIController {
  // AI agent oluştur
  async createAgent(req, res) {
    try {
      const { name, type, configuration, projectId } = req.body;
      const userId = req.user.id;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Agent adı ve tipi gereklidir'
        });
      }

      const result = await aiService.createAgent({
        name,
        type,
        configuration: configuration || {},
        projectId,
        userId
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Analytics event
      analyticsService.trackEvent({
        name: 'ai_agent_created',
        category: 'ai',
        userId: userId,
        properties: { agentType: type, projectId }
      });

      // Bildirim gönder
      await notificationService.createNotification({
        title: 'AI Agent Oluşturuldu',
        message: `${name} adlı AI agent başarıyla oluşturuldu`,
        type: 'ai_agent',
        userId: userId,
        projectId: projectId,
        priority: 'low'
      });

      res.status(201).json(result);

    } catch (error) {
      loggingService.error('Create AI agent error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'AI agent oluşturulurken hata oluştu'
      });
    }
  }

  // AI agent listesi
  async getAgents(req, res) {
    try {
      const userId = req.user.id;
      const { projectId, type } = req.query;

      const result = await aiService.listAgents({
        userId,
        projectId,
        type
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Get AI agents error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'AI agent listesi alınırken hata oluştu'
      });
    }
  }

  // AI agent detayı
  async getAgent(req, res) {
    try {
      const { agentId } = req.params;
      const userId = req.user.id;

      const result = await aiService.getAgent(agentId, userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);

    } catch (error) {
      loggingService.error('Get AI agent error', { 
        error: error.message, 
        userId: req.user.id,
        agentId: req.params.agentId
      });
      res.status(500).json({
        success: false,
        error: 'AI agent detayları alınırken hata oluştu'
      });
    }
  }

  // AI agent güncelle
  async updateAgent(req, res) {
    try {
      const { agentId } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const result = await aiService.updateAgent(agentId, updates, userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Analytics event
      analyticsService.trackEvent({
        name: 'ai_agent_updated',
        category: 'ai',
        userId: userId,
        properties: { agentId }
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Update AI agent error', { 
        error: error.message, 
        userId: req.user.id,
        agentId: req.params.agentId
      });
      res.status(500).json({
        success: false,
        error: 'AI agent güncellenirken hata oluştu'
      });
    }
  }

  // AI agent sil
  async deleteAgent(req, res) {
    try {
      const { agentId } = req.params;
      const userId = req.user.id;

      const result = await aiService.deleteAgent(agentId, userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Analytics event
      analyticsService.trackEvent({
        name: 'ai_agent_deleted',
        category: 'ai',
        userId: userId,
        properties: { agentId }
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Delete AI agent error', { 
        error: error.message, 
        userId: req.user.id,
        agentId: req.params.agentId
      });
      res.status(500).json({
        success: false,
        error: 'AI agent silinirken hata oluştu'
      });
    }
  }

  // AI agent çalıştır
  async runAgent(req, res) {
    try {
      const { agentId } = req.params;
      const { input, context } = req.body;
      const userId = req.user.id;

      const result = await aiService.runAgent(agentId, {
        input,
        context: context || {},
        userId
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Analytics event
      analyticsService.trackEvent({
        name: 'ai_agent_executed',
        category: 'ai',
        userId: userId,
        properties: { 
          agentId,
          executionTime: result.executionTime
        }
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Run AI agent error', { 
        error: error.message, 
        userId: req.user.id,
        agentId: req.params.agentId
      });
      res.status(500).json({
        success: false,
        error: 'AI agent çalıştırılırken hata oluştu'
      });
    }
  }

  // AI chat
  async chat(req, res) {
    try {
      const { message, conversationId, context } = req.body;
      const userId = req.user.id;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Mesaj gereklidir'
        });
      }

      const result = await aiService.chat({
        message,
        conversationId,
        context: context || {},
        userId
      });

      // Analytics event
      analyticsService.trackEvent({
        name: 'ai_chat_message',
        category: 'ai',
        userId: userId,
        properties: { 
          conversationId: result.conversationId,
          messageLength: message.length
        }
      });

      res.json(result);

    } catch (error) {
      loggingService.error('AI chat error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'AI chat sırasında hata oluştu'
      });
    }
  }

  // Kod analizi
  async analyzeCode(req, res) {
    try {
      const { code, language, analysisType } = req.body;
      const userId = req.user.id;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Analiz edilecek kod gereklidir'
        });
      }

      const result = await aiService.analyzeCode({
        code,
        language: language || 'javascript',
        analysisType: analysisType || 'general',
        userId
      });

      // Analytics event
      analyticsService.trackEvent({
        name: 'code_analyzed',
        category: 'ai',
        userId: userId,
        properties: { 
          language,
          analysisType,
          codeLength: code.length
        }
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Code analysis error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'Kod analizi sırasında hata oluştu'
      });
    }
  }

  // Kod üret
  async generateCode(req, res) {
    try {
      const { prompt, language, framework, requirements } = req.body;
      const userId = req.user.id;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Kod üretim prompt\'u gereklidir'
        });
      }

      const result = await aiService.generateCode({
        prompt,
        language: language || 'javascript',
        framework,
        requirements: requirements || [],
        userId
      });

      // Analytics event
      analyticsService.trackEvent({
        name: 'code_generated',
        category: 'ai',
        userId: userId,
        properties: { 
          language,
          framework,
          promptLength: prompt.length
        }
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Code generation error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'Kod üretimi sırasında hata oluştu'
      });
    }
  }

  // AI model listesi
  async getModels(req, res) {
    try {
      const result = await aiService.getAvailableModels();
      res.json(result);

    } catch (error) {
      loggingService.error('Get AI models error', { 
        error: error.message, 
        userId: req.user?.id 
      });
      res.status(500).json({
        success: false,
        error: 'AI model listesi alınırken hata oluştu'
      });
    }
  }

  // AI kullanım istatistikleri
  async getUsageStats(req, res) {
    try {
      const userId = req.user.id;
      const { timeRange } = req.query;

      const result = await aiService.getUsageStats(userId, timeRange);

      res.json(result);

    } catch (error) {
      loggingService.error('Get AI usage stats error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'AI kullanım istatistikleri alınırken hata oluştu'
      });
    }
  }
}

module.exports = new AIController();
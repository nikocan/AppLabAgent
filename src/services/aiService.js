import axios from 'axios';

class AIServiceClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.rapidapi.com';
  }

  async request(endpoint, method = 'GET', data = null) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        data,
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  // AI Servisleri
  async generateText(prompt) {
    return this.request('/text-generation', 'POST', { prompt });
  }

  async analyzeImage(imageUrl) {
    return this.request('/image-analysis', 'POST', { url: imageUrl });
  }

  async translateText(text, targetLang) {
    return this.request('/translation', 'POST', { text, target_lang: targetLang });
  }

  async generateImage(prompt) {
    return this.request('/image-generation', 'POST', { prompt });
  }

  // Uygulama Oluşturma Servisleri
  async createWebApp(config) {
    return this.request('/web-app-builder', 'POST', config);
  }

  async createMobileApp(config) {
    return this.request('/mobile-app-builder', 'POST', config);
  }

  async deployApp(appId) {
    return this.request(`/deploy/${appId}`, 'POST');
  }

  async getAppAnalytics(appId) {
    return this.request(`/analytics/${appId}`);
  }
}
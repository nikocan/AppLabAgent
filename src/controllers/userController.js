// App Lab Agent - User Controller
// Kullanıcı yönetimi için controller

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const notificationService = require('../services/notificationService');
const analyticsService = require('../services/analyticsService');
const loggingService = require('../services/loggingService');

class UserController {
  // Kullanıcı kayıt
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, planType = 'free' } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'Email, şifre, ad ve soyad gereklidir'
        });
      }

      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 12);

      // Mock user creation - gerçek implementasyonda database kullanılır
      const user = {
        id: Date.now(),
        email,
        firstName,
        lastName,
        planType,
        createdAt: new Date().toISOString()
      };

      // JWT token oluştur
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          planType: user.planType
        },
        token
      });

    } catch (error) {
      loggingService.error('User registration error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Kayıt sırasında hata oluştu'
      });
    }
  }

  // Kullanıcı giriş
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email ve şifre gereklidir'
        });
      }

      // Mock user - gerçek implementasyonda database'den gelir
      const user = {
        id: 1,
        email,
        password: await bcrypt.hash('password', 12), // Mock hashed password
        firstName: 'John',
        lastName: 'Doe',
        planType: 'free'
      };

      // JWT token oluştur
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          planType: user.planType
        },
        token
      });

    } catch (error) {
      loggingService.error('User login error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Giriş sırasında hata oluştu'
      });
    }
  }

  // Kullanıcı profili
  async getProfile(req, res) {
    try {
      const user = req.user;

      res.json({
        success: true,
        user
      });

    } catch (error) {
      loggingService.error('Get user profile error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Profil bilgileri alınırken hata oluştu'
      });
    }
  }

  // Profil güncelle
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;

      const updatedUser = {
        ...req.user,
        firstName,
        lastName,
        email,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        user: updatedUser
      });

    } catch (error) {
      loggingService.error('Update profile error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Profil güncellenirken hata oluştu'
      });
    }
  }
}

module.exports = new UserController();
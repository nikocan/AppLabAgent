// App Lab Agent - User Controller
// Kullanıcı yönetimi için controller

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../data/databaseNew');
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

      // Email kontrolü
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bu email adresi zaten kullanımda'
        });
      }

      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 12);

      // Kullanıcı oluştur
      const result = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, plan_type, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, email, first_name, last_name, plan_type`,
        [email, hashedPassword, firstName, lastName, planType]
      );

      const user = result.rows[0];

      // JWT token oluştur
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      // Analytics event
      analyticsService.trackEvent({
        name: 'user_registered',
        category: 'authentication',
        userId: user.id,
        properties: { planType }
      });

      // Hoş geldin bildirimi
      await notificationService.createNotification({
        title: 'Hoş Geldiniz!',
        message: 'AppLab Agent platformuna başarıyla kayıt oldunuz.',
        type: 'welcome',
        userId: user.id,
        priority: 'low'
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          planType: user.plan_type
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

      // Kullanıcıyı bul
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Geçersiz email veya şifre'
        });
      }

      const user = result.rows[0];

      // Şifre kontrolü
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Geçersiz email veya şifre'
        });
      }

      // Son giriş zamanını güncelle
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // JWT token oluştur
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      // Analytics event
      analyticsService.trackEvent({
        name: 'user_login',
        category: 'authentication',
        userId: user.id
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          planType: user.plan_type,
          lastLogin: user.last_login
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
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.plan_type, u.created_at, u.last_login,
                s.status as subscription_status, s.expires_at
         FROM users u
         LEFT JOIN subscriptions s ON u.id = s.user_id
         WHERE u.id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Kullanıcı bulunamadı'
        });
      }

      const user = result.rows[0];

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          planType: user.plan_type,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          subscription: {
            status: user.subscription_status,
            expiresAt: user.expires_at
          }
        }
      });

    } catch (error) {
      loggingService.error('Get user profile error', { error: error.message, userId: req.user.id });
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

      const result = await pool.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = NOW()
         WHERE id = $4 RETURNING id, email, first_name, last_name, plan_type`,
        [firstName, lastName, email, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Kullanıcı bulunamadı'
        });
      }

      const user = result.rows[0];

      // Analytics event
      analyticsService.trackEvent({
        name: 'profile_updated',
        category: 'user',
        userId: user.id
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          planType: user.plan_type
        }
      });

    } catch (error) {
      loggingService.error('Update profile error', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        error: 'Profil güncellenirken hata oluştu'
      });
    }
  }

  // Şifre değiştir
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Mevcut şifre ve yeni şifre gereklidir'
        });
      }

      // Mevcut kullanıcı bilgilerini al
      const result = await pool.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Kullanıcı bulunamadı'
        });
      }

      const user = result.rows[0];

      // Mevcut şifreyi kontrol et
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Mevcut şifre yanlış'
        });
      }

      // Yeni şifreyi hashle
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Şifreyi güncelle
      await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId]
      );

      // Analytics event
      analyticsService.trackEvent({
        name: 'password_changed',
        category: 'security',
        userId: userId
      });

      // Güvenlik bildirimi
      await notificationService.createNotification({
        title: 'Şifre Değiştirildi',
        message: 'Hesabınızın şifresi başarıyla değiştirildi.',
        type: 'security',
        userId: userId,
        priority: 'medium'
      });

      res.json({
        success: true,
        message: 'Şifre başarıyla değiştirildi'
      });

    } catch (error) {
      loggingService.error('Change password error', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        error: 'Şifre değiştirilirken hata oluştu'
      });
    }
  }

  // Kullanıcı istatistikleri
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;

      // Proje sayıları
      const projectStats = await pool.query(
        `SELECT 
           COUNT(*) as total_projects,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
         FROM projects WHERE user_id = $1`,
        [userId]
      );

      // API kullanım istatistikleri
      const apiStats = await pool.query(
        `SELECT 
           SUM(request_count) as total_requests,
           COUNT(*) as api_calls
         FROM api_usage WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
        [userId]
      );

      const stats = {
        projects: projectStats.rows[0],
        api: {
          totalRequests: parseInt(apiStats.rows[0].total_requests) || 0,
          apiCalls: parseInt(apiStats.rows[0].api_calls) || 0
        }
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      loggingService.error('Get user stats error', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        error: 'İstatistikler alınırken hata oluştu'
      });
    }
  }
}

module.exports = new UserController();
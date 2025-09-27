const jwt = require('jsonwebtoken');
const { pool } = require('../data/databaseNew');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Token bulunamadı' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      
      // Kullanıcı bilgilerini ve abonelik durumunu kontrol et
      const result = await pool.query(
        `SELECT u.*, s.plan_type, s.status as subscription_status, s.expires_at
         FROM users u
         LEFT JOIN subscriptions s ON u.id = s.user_id
         WHERE u.id = $1`,
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ 
          success: false,
          error: 'Geçersiz kullanıcı' 
        });
      }

      const user = result.rows[0];
      
      // Abonelik kontrolü (isteğe bağlı)
      if (user.subscription_status && user.expires_at && new Date(user.expires_at) < new Date()) {
        return res.status(401).json({ 
          success: false,
          error: 'Abonelik süresi dolmuş' 
        });
      }
      
      // API kullanım limitlerini kontrol et
      const usageResult = await pool.query(
        `SELECT SUM(request_count) as total_requests
         FROM api_usage
         WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 month'`,
        [user.id]
      );

      const totalRequests = parseInt(usageResult.rows[0]?.total_requests) || 0;
      const limits = {
        'free': 1000,
        'basic': 10000,
        'pro': 100000,
        'enterprise': Infinity
      };

      const userPlanType = user.plan_type || 'free';
      if (totalRequests >= limits[userPlanType]) {
        return res.status(429).json({ 
          success: false,
          error: 'API kullanım limiti aşıldı' 
        });
      }

      // Kullanıcı bilgilerini request'e ekle
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        planType: user.plan_type,
        role: user.role || 'user'
      };
      
      next();
      
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        error: 'Geçersiz veya süresi dolmuş token' 
      });
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kimlik doğrulama sırasında hata oluştu' 
    });
  }
};

module.exports = { authenticate };
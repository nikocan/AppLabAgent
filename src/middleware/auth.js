import jwt from 'jsonwebtoken';
import { pool } from '../data/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcı bilgilerini ve abonelik durumunu kontrol et
    const result = await pool.query(
      `SELECT u.*, s.plan_type, s.status as subscription_status, s.expires_at
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id
       WHERE u.id = $1 AND (s.expires_at > NOW() OR s.expires_at IS NULL)`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired subscription' });
    }

    const user = result.rows[0];
    
    // API kullanım limitlerini kontrol et
    const usageResult = await pool.query(
      `SELECT SUM(request_count) as total_requests
       FROM api_usage
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 month'`,
      [user.id]
    );

    const totalRequests = parseInt(usageResult.rows[0].total_requests) || 0;
    const limits = {
      'free': 100,
      'basic': 1000,
      'pro': 10000,
      'enterprise': Infinity
    };

    if (totalRequests >= limits[user.plan_type]) {
      return res.status(429).json({ error: 'API limit exceeded' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
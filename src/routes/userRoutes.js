import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../data/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, companyName } = req.body;
    
    // Parola hash'leme
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Kullanıcı oluşturma
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, company_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, fullName, companyName]
    );
    
    // Ücretsiz abonelik oluşturma
    await pool.query(
      'INSERT INTO subscriptions (user_id, plan_type, status) VALUES ($1, $2, $3)',
      [result.rows[0].id, 'free', 'active']
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı profili
router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, s.plan_type, s.status as subscription_status, s.expires_at
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    
    const usage = await pool.query(
      `SELECT api_name, SUM(request_count) as total_requests
       FROM api_usage
       WHERE user_id = $1
       GROUP BY api_name`,
      [req.user.id]
    );
    
    res.json({
      profile: result.rows[0],
      usage: usage.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Abonelik güncelleme
router.post('/subscription/upgrade', authenticate, async (req, res) => {
  try {
    const { planType } = req.body;
    
    await pool.query(
      `UPDATE subscriptions 
       SET plan_type = $1, 
           status = 'active',
           started_at = CURRENT_TIMESTAMP,
           expires_at = CURRENT_TIMESTAMP + INTERVAL '1 month'
       WHERE user_id = $2`,
      [planType, req.user.id]
    );
    
    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
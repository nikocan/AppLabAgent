const jwt = require('jsonwebtoken');

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
      
      // Mock user - gerçek implementasyonda database'den gelir
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        firstName: 'John',
        lastName: 'Doe',
        planType: 'free',
        role: 'user'
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
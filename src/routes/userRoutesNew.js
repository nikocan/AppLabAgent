const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Kullanıcı kaydı
router.post('/register', userController.register);

// Kullanıcı girişi
router.post('/login', userController.login);

// Korumalı route'lar
router.use(authenticate);

// Kullanıcı profili
router.get('/profile', userController.getProfile);

// Profil güncelle
router.put('/profile', userController.updateProfile);

module.exports = router;
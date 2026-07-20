const express = require('express');
const router = express.Router();
const { login, primeiroAcesso } = require('../controllers/auth');

router.post('/login', login);
router.post('/primeiro-acesso', primeiroAcesso);

module.exports = router;
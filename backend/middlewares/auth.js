const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.produtor = decoded;
    next();
  } catch (erro) {
    res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
  }
};

const verificarAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores.' });
    }
    req.produtor = decoded;
    next();
  } catch (erro) {
    res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
  }
};

module.exports = { verificarToken, verificarAdmin };

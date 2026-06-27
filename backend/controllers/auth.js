const pool = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  const { cpf, senha } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT * FROM produtores WHERE cpf = $1', [cpf]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensagem: 'CPF ou senha inválidos' });
    }

    const produtor = resultado.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, produtor.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'CPF ou senha inválidos' });
    }

    const token = jwt.sign(
      { cpf: produtor.cpf, nome: produtor.nome },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, nome: produtor.nome });

  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro no servidor', erro });
  }
};

module.exports = { login };
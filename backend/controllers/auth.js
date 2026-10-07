const pool = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarCadastroCompleto = (produtor) => {
  if (produtor.tipo === 'admin') {
    return true;
  }

  return Boolean(
    produtor.nome?.trim() &&
    produtor.telefone?.trim() &&
    produtor.email?.trim() &&
    produtor.cidade?.trim() &&
    produtor.endereco?.trim()
  );
};

const login = async (req, res) => {
  const { cpf, senha } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT * FROM produtores WHERE cpf = $1',
      [cpf]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensagem: 'CPF ou senha inválidos'
      });
    }

    const produtor = resultado.rows[0];

    if (!produtor.ativo) {
      return res.status(403).json({
        mensagem:
          'Conta não ativada. Faça seu primeiro acesso.'
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      produtor.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: 'CPF ou senha inválidos'
      });
    }

    const token = jwt.sign(
      {
        cpf: produtor.cpf,
        nome: produtor.nome,
        tipo: produtor.tipo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    const cadastroCompleto =
      verificarCadastroCompleto(produtor);

    res.json({
      token,
      nome: produtor.nome,
      tipo: produtor.tipo,
      cadastro_completo: cadastroCompleto
    });

  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro no servidor',
      erro
    });
  }
};

const primeiroAcesso = async (req, res) => {
  const { cpf, senha } = req.body;

  try {
    const resultado = await pool.query(
      `SELECT *
       FROM produtores
       WHERE cpf = $1
         AND ativo = FALSE`,
      [cpf]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          'CPF não encontrado ou conta já ativada.'
      });
    }

    const senhaCriptografada = await bcrypt.hash(
      senha,
      10
    );

    await pool.query(
      `UPDATE produtores
       SET
         senha = $1,
         ativo = TRUE,
         data_ativacao = NOW()
       WHERE cpf = $2`,
      [
        senhaCriptografada,
        cpf
      ]
    );

    res.json({
      mensagem:
        'Conta ativada com sucesso! Faça o login.'
    });

  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro no servidor',
      erro
    });
  }
};

module.exports = {
  login,
  primeiroAcesso
};